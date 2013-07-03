package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.Activity;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.PersistenceContext;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ActivityManager {

    @PersistenceContext
    private EntityManager em;
            
    public ActivityManager() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
    }

    public synchronized String hit(Activity activity) {
        String result = "{\"success\": false}";
        EntityTransaction transaction = em.getTransaction();
        try {
            transaction.begin();
            em.persist(activity);
            transaction.commit();
            result = "{\"success\": true}";
        } catch (Exception ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
        return result;
    }
}
