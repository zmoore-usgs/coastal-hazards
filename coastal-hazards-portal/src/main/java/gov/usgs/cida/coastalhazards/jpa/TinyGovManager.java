package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.TinyGov;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class TinyGovManager {

    public TinyGov load(String url) {
        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        TinyGov urls;
        try {
            urls = em.find(TinyGov.class, url);
        } finally {
            JPAHelper.close(em);
        }    
        return urls;
    }
    
    public synchronized boolean save(TinyGov tinygov) {
        boolean result = false;
        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        EntityTransaction transaction = em.getTransaction();
		try {
			transaction.begin();
			em.persist(tinygov);
			transaction.commit();
            result = true;
		} catch (Exception ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
		} finally { 
            JPAHelper.close(em);
        }
		return result;
    }
    
}
