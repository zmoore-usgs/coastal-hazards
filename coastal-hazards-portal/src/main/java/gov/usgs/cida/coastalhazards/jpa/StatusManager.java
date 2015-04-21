package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.util.Status;
import gov.usgs.cida.coastalhazards.model.util.Status.StatusName;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class StatusManager implements AutoCloseable {
	
	private static final Logger log = LoggerFactory.getLogger(StatusManager.class);

	private static final String HQL_SELECT_BY_ID = "select s from Status s where s.statusName = :name";
	private static final String HQL_SELECT_ALL = "select s from Status s";

	private EntityManager em;

	public StatusManager() {
		em = JPAHelper.getEntityManagerFactory().createEntityManager();
	}

	public Status load(StatusName name) {
		Status status = null;
		Query selectQuery = em.createQuery(HQL_SELECT_BY_ID);
		selectQuery.setParameter("name", name);
		List<Status> resultList = selectQuery.getResultList();
		if (!resultList.isEmpty()) {
			status = resultList.get(0);
		}
		return status;
	}
	
	public Map<StatusName, Status> loadAll() {
		Map<StatusName, Status> result = new TreeMap<>();
		Query selectQuery = em.createQuery(HQL_SELECT_ALL);
		List<Status> resultList = selectQuery.getResultList();
		for (Status status : resultList) {
			result.put(status.getStatusName(), status);
		}
		return result;
	}

	public boolean save(Status status) {
		EntityTransaction transaction = em.getTransaction();
		boolean saved = false;
		try {
			Status fromDb = load(status.getStatusName());
			transaction.begin();
			if (fromDb != null) {
				// if there are more properties, copy those as well
				fromDb.setLastUpdate(status.getLastUpdate());
				em.merge(fromDb);
			} else {
				em.persist(status);
			}
			transaction.commit();
			saved = true;
		}
		catch (Exception ex) {
			log.error("unable to update status", ex);
			if (transaction.isActive()) {
				transaction.rollback();
			}
			saved = false;
		}
		return saved;
	}

	@Override
	public void close() {
		JPAHelper.close(em);
	}
}
