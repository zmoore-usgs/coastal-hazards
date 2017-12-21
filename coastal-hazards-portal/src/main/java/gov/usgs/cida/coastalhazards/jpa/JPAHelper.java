package gov.usgs.cida.coastalhazards.jpa;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.PersistenceUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class JPAHelper {
	
	private static final Logger log = LoggerFactory.getLogger(JPAHelper.class);

	@PersistenceUnit
	private static EntityManagerFactory emf = null;

	public synchronized static EntityManagerFactory getEntityManagerFactory() {
		return getEntityManagerFactory("coastalhazards");
	}

	public synchronized static EntityManagerFactory getEntityManagerFactory(String unit) {
		if (emf == null) {
			try {
				emf = Persistence.createEntityManagerFactory(unit);
			} catch (Exception e) {
				log.error("Unable to build entity manager factory", e);
			}
			cleanup();
		}
		return emf;
	}

	public synchronized static void closeEntityManagerFactory() {
		if (emf != null && emf.isOpen()) {
			emf.close();
		}
	}

	public synchronized static void close(EntityManager em) {
		if (em != null && em.isOpen()) {
			em.close();
		}
	}
	
	/**
	 * This is used to perform several tasks on startup related to database.
	 * Meant to get the database to a good state before the app starts using it
	 */
	private static void cleanup() {
		try (DownloadManager downloadManager = new DownloadManager()) {
			downloadManager.deleteAllMissing();
		} catch (Exception ex) {
			log.error("Unable to clean up properly.");
		}
	}

}
