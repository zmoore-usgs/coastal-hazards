package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.Session;
import gov.usgs.cida.coastalhazards.model.SessionItem;
import gov.usgs.cida.coastalhazards.session.io.SessionIO;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.PersistenceException;
import javax.persistence.Query;
import org.apache.log4j.Logger;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class SessionManager implements SessionIO, AutoCloseable {
    
    private static final Logger log = Logger.getLogger(SessionManager.class);
    private EntityManager em;
    
    public SessionManager() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
    }

    @Override
	public void close() {
		JPAHelper.close(em);
	}

    @Override
    public String load(String sessionID) {
        String jsonSession = null;
        try {
            Session session = em.find(Session.class, sessionID);

            if (null != session) {
                jsonSession = session.toJSON();
            }
        } catch (PersistenceException ex) {
			log.error("Unable to load session", ex);
		}
        return jsonSession;
    }

    private Session loadSession(String sessionID) {
        try {
            return em.find(Session.class, sessionID);
        } catch (PersistenceException ex) {
			log.error("Unable to load session", ex);
        }
        return null;
    }

    @Override
    public synchronized String save(String session) {
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

    public synchronized boolean removeItemFromSessions(String itemId) {
        EntityTransaction transaction = em.getTransaction();

        for(String sessionId : getSessionIdsByItemId(itemId)) {
            try {
                Session sessionObj = loadSession(sessionId);
                List<SessionItem> newItems = new ArrayList<>(sessionObj.getItems());

                for(SessionItem item : sessionObj.getItems()) {
                    if(item.getItemId().equals(itemId)){
                        newItems.remove(item);
                    }
                }

                transaction.begin();
                em.remove(sessionObj);
                sessionObj.setItems(newItems);
                em.persist(sessionObj);
                transaction.commit();
            } catch (Exception ex) {
                if (transaction.isActive()) {
                    transaction.rollback();
                }
                log.error("An error occurred while modifying the session. Error: " + ex.getMessage());
                return false;
            }
        }

        return true;
    }

    private List<String> getSessionIdsByItemId(String itemId) {
        Query sessions = em.createNativeQuery("SELECT session_id FROM session_item WHERE item_id = :itemId");
		sessions.setParameter("itemId", itemId);
		return (List<String>) sessions.getResultList();
    }
}
