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
        if (emf == null) {
            Persistence.createEntityManagerFactory("coastalhazards");
        }
        return emf;
    }
    
}
