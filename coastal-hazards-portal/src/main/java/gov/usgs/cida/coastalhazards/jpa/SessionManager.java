package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.Session;
import gov.usgs.cida.coastalhazards.session.io.SessionIO;
import gov.usgs.cida.coastalhazards.session.io.SessionIOException;
import java.security.NoSuchAlgorithmException;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.PersistenceContext;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class SessionManager implements SessionIO {

    @Override
    public String load(String sessionID) {
        String jsonSession = null;
        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        try {
            Session session = em.find(Session.class, sessionID);

            
            if (null != session) {
                jsonSession = session.toJSON();
            }
        } finally {
            JPAHelper.close(em);
        }
        return jsonSession;
    }

    @Override
    public synchronized String save(String session) {
        String id = "ERR";
        EntityManager em = JPAHelper.getEntityManagerFactory().createEntityManager();
        EntityTransaction transaction = em.getTransaction();
        try {
            transaction.begin();
            Session sessionObj = Session.fromJSON(session);
            em.persist(sessionObj);
            id = sessionObj.getId();
            transaction.commit();
        } catch (NoSuchAlgorithmException ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        } finally {
            JPAHelper.close(em);
        }
        return id;
    }

}
