package gov.usgs.cida.coastalhazards.service.data;

import gov.usgs.cida.coastalhazards.jpa.DownloadManager;
import gov.usgs.cida.coastalhazards.model.util.Download;
import java.io.File;
import java.net.URISyntaxException;
import java.util.List;
import javax.persistence.EntityTransaction;
import javax.ws.rs.NotFoundException;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DownloadService implements AutoCloseable {

	private static final Logger log = LoggerFactory.getLogger(DownloadService.class);

	private DownloadManager manager;

	public DownloadService() {
		manager = new DownloadManager();
	}

	public boolean delete(String id) {
		boolean deleted = false;
		EntityTransaction transaction = manager.getTransaction();
		try {
			transaction.begin();
			Download download = manager.load(id);
			if (download == null) {
				throw new NotFoundException();
			}
			deleted = deleteDownload(download);
			transaction.commit();
		} catch (Exception ex) {
			log.error("Unable to delete item", ex);
			if (transaction.isActive()) {
				transaction.rollback();
			}
		}
		return deleted;
	}

	public int deleteAll(List<String> downloadIds) {
		int deleted = 0;
		EntityTransaction transaction = manager.getTransaction();
		try {
			transaction.begin();
			for (String id : downloadIds) {
				Download download = manager.load(id);
				if (download != null) {
					if (deleteDownload(download)) {
						deleted++;
					}
				}

			}
			transaction.commit();
		} catch (Exception ex) {
			log.error("Unable to delete items", ex);
			if (transaction.isActive()) {
				transaction.rollback();
			}
		}
		return deleted;
	}

	private boolean deleteDownload(Download download) {
		boolean deleted = false;
		try {
			manager.delete(download);
			File stagingFolder = download.fetchZipFile().getParentFile();
			deleted = FileUtils.deleteQuietly(stagingFolder);
		} catch (URISyntaxException ex) {
			log.error("Invalid file pointer", ex);
		}
		return deleted;
	}

	@Override
	public void close() {
		manager.close();
	}
}
