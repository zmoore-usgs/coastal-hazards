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
public class DownloadManager implements AutoCloseable {

    private static final String HQL_SELECT_BY_ID = "select d from Download d where d.itemId = :id or d.sessionId = :id";
    private static final String HQL_SELECT_ALL = "select d from Download d";
    
    private EntityManager em;
    
    public DownloadManager() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
    }

    public boolean isPersisted(String id) {
        boolean isPersisted = false;

        Query selectQuery = em.createQuery(HQL_SELECT_BY_ID);
        selectQuery.setParameter("id", id);
        List<Download> resultList = selectQuery.getResultList();
        if (!resultList.isEmpty()) {
            isPersisted = true;
        }
        return isPersisted;
    }

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

    public void save(Download download) {
        EntityTransaction transaction = em.getTransaction();
        try {
            transaction.begin();
            em.persist(download);
            transaction.commit();
        } catch (Exception ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
    }

    public void delete(Download download) {
        EntityTransaction transaction = em.getTransaction();
        try {
            transaction.begin();
            em.remove(download);
            transaction.commit();
        } catch (Exception ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
    }
    
    public List<Download> getAllStagedDownloads() {
        List<Download> resultList;
        Query selectQuery = em.createQuery(HQL_SELECT_ALL);
        resultList = selectQuery.getResultList();
        return resultList;
    }
    
    @Override
    public void close() {
        JPAHelper.close(em);
    }
}
