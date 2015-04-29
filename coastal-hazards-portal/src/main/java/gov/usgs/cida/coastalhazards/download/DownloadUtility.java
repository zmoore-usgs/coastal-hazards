package gov.usgs.cida.coastalhazards.download;

import gov.usgs.cida.coastalhazards.jpa.DownloadManager;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import gov.usgs.cida.coastalhazards.model.Session;
import gov.usgs.cida.coastalhazards.model.SessionItem;
import gov.usgs.cida.coastalhazards.model.util.Download;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.ConcurrentModificationException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility to download items and sessions (bucket)
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DownloadUtility {

	private static final Logger LOG = LoggerFactory.getLogger(DownloadUtility.class);

	private static final String MISSING_FILE = "MISSING.txt";
	private static final String README_RESOURCE = "gov/usgs/cida/coastalhazards/download/README.txt";
	private static final String README_FILE = "README.txt";
	private static final String ZIP_FILE = "download.zip";
	private static final String WINDOWS_NEWLINE = "\r\n";

	private static Set<File> locks = Collections.synchronizedSet(new HashSet<File>());

	public synchronized static void lock(File file) throws ConcurrentModificationException {
		if (locks.contains(file)) {
			throw new ConcurrentModificationException("May not lock file already being worked on");
		} else {
			locks.add(file);
		}
	}

	public synchronized static void unlock(File file) {
		if (locks.contains(file)) {
			locks.remove(file);
		}
	}

	public static File getStagingParentDir() {
		String downloadDir = JNDISingleton.getInstance().getProperty("coastal-hazards.files.directory.download",
				System.getProperty("java.io.tmpdir"));
		return new File(downloadDir);
	}

	public static File createDownloadStagingArea() throws IOException {
		File stagingParentDir = getStagingParentDir();
		UUID uuid = UUID.randomUUID();
		File tmpDir = new File(stagingParentDir, uuid.toString());
		FileUtils.forceMkdir(tmpDir);
		return tmpDir;
	}

	/**
	 * Creates a new thread to asynchronously stage the cache for an item's
	 * download cache
	 *
	 * @param itemId
	 * @return java.util.concurrent.Future<java.io.File> the download staging
	 * area
	 */
	public static Future<Download> stageAsyncItemDownload(String itemId) {
		ExecutorService execSvc = Executors.newSingleThreadExecutor();
		return execSvc.submit(new DownloadStagingRunner(itemId));
	}

	/**
	 * This will need some refactoring because it is real messy
	 *
	 * @param stageThis
	 * @param stagingDir
	 * @return considered successful if it was able to get some data at all
	 * @throws java.io.IOException
	 */
	public static boolean stageItemDownload(Item stageThis, File stagingDir) throws IOException, ConcurrentModificationException {
		boolean success = false;
		lock(stagingDir);

		List<String> missing = new LinkedList<>();

		try (DownloadManager manager = new DownloadManager()) {
			Download dbDownload = new Download();
			dbDownload.setItemId(stageThis.getId());
			manager.save(dbDownload);
			
			Map<WFSService, SingleDownload> downloadMap = new HashMap<>();
			populateDownloadMap(downloadMap, stageThis);
			List<String> namesUsed = new ArrayList<>();

			for (SingleDownload stagedDownload : downloadMap.values()) {
				while (namesUsed.contains(stagedDownload.getName())) {
					stagedDownload.incrementName();
				}
				namesUsed.add(stagedDownload.getName());

				// TODO try/catch this to isolate/retry problem downloads
				try {
					boolean staged = stagedDownload.stage(stagingDir, missing);
					success = success || staged;
				} catch (Exception ex) {
					LOG.error("unable to stage {} for download", stagedDownload.getName());
				}
			}
		} finally {
			writeMissingFile(stagingDir, missing);
			writeReadmeFile(stagingDir);
			unlock(stagingDir);
		}
		return success;
	}

	/**
	 * TODO stage all the items with some smarts about naming and such
	 *
	 * @param stageThis
	 * @param stagingDir
	 */
	public static boolean stageSessionDownload(Session stageThis, File stagingDir) throws IOException, ConcurrentModificationException {
		boolean success = false;
		lock(stagingDir);

		List<String> missing = new LinkedList<>();

		try (ItemManager itemManager = new ItemManager()) {
			Map<WFSService, SingleDownload> downloadMap = new HashMap<>();
			for (SessionItem sessionItem : stageThis.getItems()) {
				Item item = itemManager.load(sessionItem.getItemId());
				populateDownloadMap(downloadMap, item);
			}
			List<String> namesUsed = new ArrayList<>();

			for (SingleDownload stagedDownload : downloadMap.values()) {
				while (namesUsed.contains(stagedDownload.getName())) {
					stagedDownload.incrementName();
				}
				namesUsed.add(stagedDownload.getName());

				// TODO try/catch this to isolate/retry problem downloads?
				boolean stage = stagedDownload.stage(stagingDir, missing);
				success = success || stage;
			}
		} finally {
			writeMissingFile(stagingDir, missing);
			writeReadmeFile(stagingDir);
			unlock(stagingDir);
		}
		return success;
	}

	/**
	 *
	 * @param stagingDir
	 * @return Download populates the download item with everything but itemId
	 * @throws java.io.IOException
	 */
	public static Download zipStagingAreaForDownload(File stagingDir, Download download) throws ConcurrentModificationException, IOException {
		lock(stagingDir);
		File zipFile = null;
		ZipOutputStream zipOutputStream = null;
		try {
			File[] files = stagingDir.listFiles();
			zipFile = new File(stagingDir, ZIP_FILE);
			zipOutputStream = new ZipOutputStream(new FileOutputStream(zipFile), Charset.defaultCharset());
			for (File file : files) {
				if (file.isFile()) {
					if (MISSING_FILE.equals(file.getName())) {
						download.setProblem(true);
					}
					FileInputStream fis = null;
					try {
						fis = new FileInputStream(file);
						zipOutputStream.putNextEntry(new ZipEntry(file.getName()));
						IOUtils.copy(fis, zipOutputStream);
					} finally {
						IOUtils.closeQuietly(fis);
						zipOutputStream.closeEntry();
					}
				}
			}
		} finally {
			IOUtils.closeQuietly(zipOutputStream);
			unlock(stagingDir);
		}
		download.setPersistanceURI(zipFile.toURI().toString());
		return download;
	}

	private static void populateDownloadMap(Map<WFSService, SingleDownload> downloadMap, Item item) {
		SingleDownload download = null;

		Queue<Item> itemQueue = new LinkedList<>();
		itemQueue.add(item);
		// Important that there are no cycles in the data model, this could go on forever
		// TODO enforce acyclic model somewhere in the Items themselves
		// (i.e. an item that sees itself in the subtree throws an exception)
		while (itemQueue.peek() != null) {
			Item currentItem = itemQueue.poll();
			WFSService wfs = getWfsService(currentItem);
			if (wfs != null && wfs.checkValidity()) {
				if (downloadMap.containsKey(wfs)) {
					download = downloadMap.get(wfs);
				} else {
					download = new SingleDownload();
					download.setWfs(wfs);
					download.setName(currentItem.getName());
					try {
						URL cswUrl = currentItem.fetchCswService().fetchUrl();
						download.setMetadata(cswUrl);
					} catch (MalformedURLException ex) {
						LOG.debug("Invalid csw url {}", currentItem.fetchCswService());
					} catch (NullPointerException ex) {
						LOG.debug("CSW service not set");
					}
					downloadMap.put(wfs, download);
				}
				String attr = currentItem.getAttr();
				if (StringUtils.isNotBlank(attr)) {
					download.addAttr(attr);
				}
			}

			List<Item> children = currentItem.getChildren();
			if (children != null) {
				itemQueue.addAll(children);
			}
		}
	}

	private static void writeMissingFile(File stagingDir, List<String> missingFiles) {
		if (!missingFiles.isEmpty()) {
			FileWriter missingFileWriter = null;
			try {
				missingFileWriter = new FileWriter(FileUtils.getFile(stagingDir, MISSING_FILE));
				for (String file : missingFiles) {
					missingFileWriter.write(file + WINDOWS_NEWLINE);
				}
			} catch (IOException ex) {
				LOG.error("Unable to write MISSING file", ex);
			} finally {
				IOUtils.closeQuietly(missingFileWriter);
			}
		}
	}

	private static void writeReadmeFile(File stagingDir) {
		try {
			URL resource = DownloadUtility.class.getClassLoader().getResource(README_RESOURCE);
			File readmeIn = FileUtils.toFile(resource);
			File readmeOut = FileUtils.getFile(stagingDir, README_FILE);
			FileUtils.copyFile(readmeIn, readmeOut);
		} catch (IOException ex) {
			LOG.error("unable to write README file", ex);
		}
	}

	/**
	 * Replaces item.getWfsService() after services were added to list
	 *
	 * @param item
	 * @return source wfsService representing the canonical dataset
	 */
	private static WFSService getWfsService(Item item) {
		WFSService sourceWfs = null;
		List<Service> services = item.getServices();
		for (Service service : services) {
			if (service.getType() == ServiceType.proxy_wfs) {
				sourceWfs = new WFSService(service);
			}
		}
		return sourceWfs;
	}

	/**
	 * Creates a new thread to asynchronously kick off the caching for an item
	 * download data
	 */
	private static class DownloadStagingRunner implements Callable<Download> {

		Thread stagingThread;
		String itemId;

		DownloadStagingRunner(String itemId) {
			this.itemId = itemId;
		}

		@Override
		public Download call() throws IOException {
			Download download = null;
			File stagingDir = DownloadUtility.createDownloadStagingArea();
			try (ItemManager itemManager = new ItemManager(); DownloadManager downloadManager = new DownloadManager()) {
				Item item = itemManager.load(itemId);
				download = downloadManager.load(itemId);
				if (download == null) {
					download = new Download();
					download.setItemId(itemId);
					downloadManager.save(download);
				}
				boolean staged = DownloadUtility.stageItemDownload(item, stagingDir);
				if (staged) {
					download = DownloadUtility.zipStagingAreaForDownload(stagingDir, download);
					downloadManager.update(download);
				}
			} catch (IOException ioe) {
				FileUtils.forceDelete(stagingDir);
			}
			return download;
		}
	}

}
