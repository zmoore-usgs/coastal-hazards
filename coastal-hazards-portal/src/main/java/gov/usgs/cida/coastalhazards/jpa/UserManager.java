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

    @PersistenceContext
    private EntityManager em;
    
    public UserManager() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
    }
    
    public List<AuthorizedUser> loadAll() {
        Query query = em.createQuery("select u from AuthorizedUser u");
        List<AuthorizedUser> users = query.getResultList();
        return users;
    }
    
}
