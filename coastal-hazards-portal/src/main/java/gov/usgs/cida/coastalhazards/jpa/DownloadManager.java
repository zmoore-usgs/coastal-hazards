package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.util.Download;
import java.io.File;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DownloadManager implements AutoCloseable {

	private static final Logger log = LoggerFactory.getLogger(DownloadManager.class);

	private static final String HQL_SELECT_BY_ID = "select d from Download d where d.itemId = :id or d.sessionId = :id";
	private static final String HQL_SELECT_ALL = "select d from Download d";
	private static final String HQL_DELETE_MISSING = "delete from Download d where d.persistanceURI IS NULL";

	private EntityManager em;

	public DownloadManager() {
		em = JPAHelper.getEntityManagerFactory().createEntityManager();
	}

	/**
	 * Attempts to load the Download object which specifies, among other things,
	 * where on the file system the file sits.
	 * 
	 * @param id
	 * @return 
	 */
	public Download load(String id) {
		Download download = null;

		Query selectQuery = em.createQuery(HQL_SELECT_BY_ID);
		selectQuery.setParameter("id", id);
		List<Download> resultList = selectQuery.getResultList();
		if (!resultList.isEmpty()) {
			download = resultList.get(0);
		}
		return download;
	}

	/**
	 * Check that the download location in the database actually exists on the file system
	 * @param download
	 * @return whether the file exists
	 */
	public boolean downloadFileExistsOnFilesystem(Download download) {
		boolean exists = false;
		if (null != download.getPersistanceURI()) {
			File checkFile;
			try {
				checkFile = new File(new URI(download.getPersistanceURI()));
				exists = checkFile.exists();
			} catch (URISyntaxException ex) {
				log.info("Item download exists in database but not on disk.");
			}
			
		}
		return exists;
	}

	/**
	 * Persists download data to the database
	 * @param download
	 * @return whether save was succesful
	 */
	public boolean save(Download download) {
		boolean saved = false;
		EntityTransaction transaction = em.getTransaction();
		try {
			transaction.begin();
			log.info("Saving download id {}", download.getId());
			em.persist(download);
			transaction.commit();
			saved = true;
			log.info("Saved download id {}", download.getId());
		} catch (Exception ex) {
			log.error("Download id {} could not be saved", ex);
			if (transaction.isActive()) {
				transaction.rollback();
			}
		}
		return saved;
	}

	/**
	 * Updates download data in the database
	 * @param download
	 * @return whether update was succesful 
	 */
	public boolean update(Download download) {
		boolean updated = false;
		EntityTransaction transaction = em.getTransaction();
		try {
			transaction.begin();
			log.info("Updating download id {}", download.getId());
			em.merge(download);
			transaction.commit();
			updated = true;
			log.info("Saved download id {}", download.getId());
		} catch (Exception ex) {
			log.error("Download id {} could not be updated", ex);
			if (transaction.isActive()) {
				transaction.rollback();
			}
		}
		return updated;
	}

	/**
	 * This needs to be wrapped in transaction or it will fail
	 *
	 * @param download
	 * @return whether download was deleted or not
	 */
	public boolean delete(Download download) {
		boolean deleted = false;
		log.info("Deleting download id {}", download.getId());
		em.remove(download);
		deleted = true;
		log.info("Deleted download id {}", download.getId());
		return deleted;
	}

	public boolean deleteAllMissing() {
		Query deleteQuery = em.createQuery(HQL_DELETE_MISSING);
		EntityTransaction transaction = em.getTransaction();
		boolean deletedAll = false;
		try {
			transaction.begin();
			int deleted = deleteQuery.executeUpdate();
			log.debug("Deleted {} missing downloads", deleted);
			transaction.commit();
			deletedAll = true;
		} catch (Exception ex) {
			log.error("Error deleting downloads", ex);
			if (transaction.isActive()) {
				transaction.rollback();
			}
		}
		return deletedAll;
	}

	public List<Download> getAllStagedDownloads() {
		Query selectQuery = em.createQuery(HQL_SELECT_ALL);
		return selectQuery.getResultList();
	}

	public EntityTransaction getTransaction() {
		return em.getTransaction();
	}

	@Override
	public void close() {
		JPAHelper.close(em);
	}
}
