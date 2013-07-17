package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.AuthorizedUser;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class UserManager {
    
    public List<AuthorizedUser> loadAll() {
        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        List<AuthorizedUser> users;
        try {
            Query query = em.createQuery("select u from AuthorizedUser u");
            users = query.getResultList();
        } finally {
            JPAHelper.close(em);
        }
        return users;
    }
    
}
