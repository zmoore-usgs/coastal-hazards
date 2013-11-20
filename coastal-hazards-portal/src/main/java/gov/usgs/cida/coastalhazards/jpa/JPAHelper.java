package gov.usgs.cida.coastalhazards.jpa;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.PersistenceUnit;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class JPAHelper {

    @PersistenceUnit
    private static EntityManagerFactory emf = null;

    public static EntityManagerFactory getEntityManagerFactory() {
        return getEntityManagerFactory("coastalhazards");
    }
    
    public static EntityManagerFactory getEntityManagerFactory(String unit) {
        if (emf == null) {
            emf = Persistence.createEntityManagerFactory(unit);
        }
        return emf;
    }
    
    public static void closeEntityManagerFactory() {
        if (emf != null && emf.isOpen()) {
            emf.close();
        }
    }
    
    public static void close(EntityManager em) {
        if (em != null && em.isOpen()) {
            em.close();
        }
    }
    
}
