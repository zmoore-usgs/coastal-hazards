package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.Layer;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.PersistenceException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class LayerManager implements AutoCloseable {

	private EntityManager em;

	public LayerManager() {
		em = JPAHelper.getEntityManagerFactory().createEntityManager();
	}

	public Layer load(String id) {
		Layer layer = null;

		layer = em.find(Layer.class, id);
		
		return layer;
	}

	public void save(Layer layer) {
		EntityTransaction transaction = em.getTransaction();
		try {
			transaction.begin();
			em.persist(layer);
			transaction.commit();
		}
		catch (Exception ex) {
			if (transaction.isActive()) {
				transaction.rollback();
			}
			throw new PersistenceException("Unable to persist", ex);
		}
	}

	public void delete(Layer layer) {
		EntityTransaction transaction = em.getTransaction();
		try {
			transaction.begin();
			em.remove(layer);
			transaction.commit();
		}
		catch (Exception ex) {
			if (transaction.isActive()) {
				transaction.rollback();
			}
		}
	}
	
	@Override
	public void close() {
		JPAHelper.close(em);
	}
}
