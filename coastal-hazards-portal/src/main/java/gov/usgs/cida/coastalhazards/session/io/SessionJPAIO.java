package gov.usgs.cida.coastalhazards.session.io;

import gov.usgs.cida.coastalhazards.jpa.JPAHelper;
import gov.usgs.cida.coastalhazards.model.Session;
import java.security.NoSuchAlgorithmException;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class SessionJPAIO implements SessionIO {
    
    @PersistenceContext
    private EntityManager em;
            
    public SessionJPAIO() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
    }

    @Override
    public String load(String sessionID) throws SessionIOException {
        Session session = em.createNamedQuery("Session.findByName", Session.class)
                .setParameter("id", sessionID).getSingleResult();
        String jsonSession = session.toJSON();
        return jsonSession;
    }

    @Override
    public String save(String session) throws SessionIOException {
        String id = "ERR";
        try {
            em.getTransaction().begin();
            Session sessionObj = Session.fromJSONString(session);
            em.persist(sessionObj);
            id = sessionObj.getId();
            em.getTransaction().commit();
        } catch (NoSuchAlgorithmException ex) {
            em.getTransaction().rollback();
        }
        return id;
    }

}
