package gov.usgs.cida.coastalhazards.download;

import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Session;
import gov.usgs.cida.coastalhazards.model.ogc.WFSService;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.ConcurrentModificationException;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Set;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DownloadManager {
    
    
    private static final Logger LOG = LoggerFactory.getLogger(DownloadManager.class);
    
    private static final String MISSING_FILE = "MISSING";
    
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
    
    public static File createDownloadStagingArea() throws IOException {
        String downloadDir = JNDISingleton.getInstance().getProperty("coastal-hazards.files.directory.download",
                System.getProperty("java.io.tmpdir"));
        UUID uuid = UUID.randomUUID();
        File tmpDir = new File(downloadDir + File.separator + uuid.toString());
        FileUtils.forceMkdir(tmpDir);
        return tmpDir;
    }
    
    /**
     * This will need some refactoring because it is real messy
     * @param stageThis
     * @param stagingDir 
     * @throws java.io.IOException 
     */
    public static void stageItemDownload(Item stageThis, File stagingDir) throws IOException, ConcurrentModificationException {
        
        lock(stagingDir);
        
        List<String> missing = new LinkedList<>();
        
        try {
            List<SingleDownload> downloadList = new LinkedList<>();
            SingleDownload download = new SingleDownload();

            Queue<Item> itemQueue = new LinkedList<>();
            itemQueue.add(stageThis);
            // Important that there are no cycles in the data model, this could go on forever
            // TODO enforce acyclic model somewhere in the Items themselves
            // (i.e. an item that sees itself in the subtree throws an exception)
            while (itemQueue.peek() != null) {
                Item currentItem = itemQueue.poll();
                WFSService wfs = currentItem.getWfsService();
                if (wfs.checkValidity() && !wfs.equals(download.getWfs())) {
                    if (download.isValid()) {
                        downloadList.add(download);
                    }
                    download = new SingleDownload();
                    download.setWfs(wfs);
                    download.setName(currentItem.getName());
                    download.setMetadata(new URL(currentItem.getMetadata()));
                }

                String attr = currentItem.getAttr();
                if (StringUtils.isNotBlank(attr)) {
                    download.addAttr(attr);
                }

                List<Item> children = currentItem.getChildren();
                if (children != null) {
                    itemQueue.addAll(children);
                }
            }
            // left over download should be assembled
            if (download.isValid()) {
                downloadList.add(download);
            }

            List<String> namesUsed = new ArrayList<>();
            for (SingleDownload stagedDownload : downloadList) {
                while (namesUsed.contains(stagedDownload.getName())) {
                    stagedDownload.incrementName();
                }
                namesUsed.add(stagedDownload.getName());

                // TODO try/catch this to isolate/retry problem downloads
                try {
                    stagedDownload.stage(stagingDir, missing);
                } catch (Exception ex) {
                    LOG.error("unable to stage {} for download", stagedDownload.getName());
                }
            }
        } finally {
            if (!missing.isEmpty()) {
                FileWriter missingFileWriter = new FileWriter(FileUtils.getFile(stagingDir, MISSING_FILE));
                for (String file : missing) {
                    missingFileWriter.write(file + System.lineSeparator());
                }
                IOUtils.closeQuietly(missingFileWriter);
            }
            
            unlock(stagingDir);
        }
    }
    
    /**
     * TODO stage all the items with some smarts about naming and such
     * @param stageThis
     * @param stagingDir 
     */
    public static void stageSessionDownload(Session stageThis, File stagingDir) throws ConcurrentModificationException {
        throw new UnsupportedOperationException("Not yet implemented");
    }
    
    /**
     * 
     * @param stagingDir
     * @return 
     * @throws java.io.IOException 
     */
    public static File zipStagingAreaForDownload(File stagingDir) throws ConcurrentModificationException, IOException {
        lock(stagingDir);
        File zipFile = null;
        ZipOutputStream zipOutputStream = null;
        try {
            File[] files = stagingDir.listFiles();
            zipFile = new File(stagingDir, "download.zip");
            zipOutputStream = new ZipOutputStream(new FileOutputStream(zipFile), Charset.defaultCharset());
            for (File file : files) {
                if (file.isFile()) {
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
        
        return zipFile;
    }
}
