package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.TinyGov;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.PersistenceContext;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class TinyGovManager {

    @PersistenceContext
    private EntityManager em;
    
    public TinyGovManager() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
    }
    
    public TinyGov load(String url) {
        TinyGov urls = em.find(TinyGov.class, url);
        return urls;
    }
    
    public synchronized boolean save(TinyGov tinygov) {
        boolean result = false;
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
		}
		return result;
    }
    
}
