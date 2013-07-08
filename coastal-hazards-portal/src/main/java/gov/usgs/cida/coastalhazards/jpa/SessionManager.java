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
    
    @PersistenceContext
    private EntityManager em;
            
    public SessionManager() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
        //query = em.createQuery("select s from Session s where s.id = ?", Session.class);
    }

    @Override
    public String load(String sessionID) throws SessionIOException {
        Session session = em.find(Session.class, sessionID);
		
        String jsonSession = null;
		if (null != session) {
			jsonSession = session.toJSON();
		}
        return jsonSession;
    }

    @Override
    public synchronized String save(String session) throws SessionIOException {
        String id = "ERR";
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
        }
        return id;
    }

}
