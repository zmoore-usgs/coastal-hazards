package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.TinyGov;
import javax.persistence.EntityManager;
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
		try {
			em.getTransaction().begin();
			em.persist(tinygov);
			em.getTransaction().commit();
            result = true;
		} catch (Exception ex) {
			em.getTransaction().rollback();
		}
		return result;
    }
    
}
