package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.Thumbnail;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Query;

import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ThumbnailManager implements AutoCloseable {

	private static final Logger log = LoggerFactory.getLogger(ThumbnailManager.class);

	private EntityManager em;

	public ThumbnailManager() {
		em = JPAHelper.getEntityManagerFactory().createEntityManager();
	}

	public InputStream loadStream(Thumbnail thumb) {
		InputStream inputStream = null;
		if (thumb != null) {
			inputStream = new ByteArrayInputStream(Base64.decodeBase64(thumb.getImage()));
		}
		return inputStream;
	}

	public Thumbnail load(String itemId) {
		Thumbnail thumb = em.find(Thumbnail.class, itemId);
		return thumb;
	}

	public synchronized String save(Thumbnail thumbnail) {
		EntityTransaction transaction = em.getTransaction();
		String result = "{\"success\": false}";
		try {
			transaction.begin();
			em.merge(thumbnail);
			transaction.commit();
			result = "{\"success\": true}";
			
			updateDirtyBits(thumbnail.getItemId());
		}
		catch (Exception ex) {
			if (transaction.isActive()) {
				transaction.rollback();
			}
		}
		return result;
	}

	public int updateDirtyBits(String id) {
		int status = -1;
		EntityTransaction transaction = em.getTransaction();
		try {
			Query setDirty = em.createNativeQuery("UPDATE thumbnail SET dirty=TRUE WHERE item_id IN\n"
					+ "(SELECT t.item_id FROM thumbnail as t, \n"
					+ "(SELECT id, last_update FROM item WHERE id IN (SELECT id FROM cch_get_ancestors(:id))) as changed\n"
					+ "WHERE t.item_id = changed.id AND t.last_modified < changed.last_update");
			setDirty.setParameter("id", id);
			transaction.begin();
			status = setDirty.executeUpdate();
			transaction.commit();
		}
		catch (Exception ex) {
			log.debug("Transaction failed on update enabled", ex);
			if (transaction.isActive()) {
				transaction.rollback();
			}
		}
		return status;
	}

	@Override
	public void close() {
		JPAHelper.close(em);
	}

}
