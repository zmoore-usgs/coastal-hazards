package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.util.Download;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Query;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DownloadManager {
    
    private static final Query selectQuery;
    
    static {
        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        try {
            selectQuery = em.createNamedQuery("select d from Download d where d.item_id = :id or d.session_id = :id");
        } finally {
            JPAHelper.close(em);
        }
    }

    public boolean isPersisted(String id) {
        boolean isPersisted = false;

        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        try {
            selectQuery.setParameter("id", id);
            List<Download> resultList = selectQuery.getResultList();
            if (!resultList.isEmpty()) {
                isPersisted = true;
            }
        } finally {
            JPAHelper.close(em);
        }
        return isPersisted;
    }
    
    public Download load(String id) {
        Download download = null;
        
        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        try {
            selectQuery.setParameter("id", id);
            List<Download> resultList = selectQuery.getResultList();
            if (!resultList.isEmpty()) {
                download = resultList.get(0);
            }
        } finally {
            JPAHelper.close(em);
        }
        return download;
    }
    
    public void save(Download download) {
        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        EntityTransaction transaction = em.getTransaction();
        try {
			transaction.begin();
			em.persist(download);
			transaction.commit();
		} catch (Exception ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
		} finally {
            JPAHelper.close(em);
        }
    }
    
    public void delete(Download download) {
        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        EntityTransaction transaction = em.getTransaction();
        try {
			transaction.begin();
			em.remove(download);
			transaction.commit();
		} catch (Exception ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
		} finally {
            JPAHelper.close(em);
        }
    }
    
}
