package gov.usgs.cida.coastalhazards.jpa;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.utilities.IdGenerator;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ItemManager {

	@PersistenceContext
	private EntityManager em;

	public ItemManager() {
		em = JPAHelper.getEntityManagerFactory().createEntityManager();
	}

	public String load(String itemId) {
		String jsonItem = null;
		
		Item item = em.find(Item.class, itemId);
		if (null != item) {
			jsonItem = item.toJSON();
		} else {
			File onDiskItem = new File(FileUtils.getTempDirectory(), itemId);
			if (onDiskItem.exists()) {
				try {
					jsonItem = IOUtils.toString(new FileInputStream(onDiskItem));
				} catch (IOException ex) {
					// Ignore - pass back null
				}
			}
		}
		
		return jsonItem;
	}

	public String save(String item) {
		String id = "ERR";
		try {
			em.getTransaction().begin();
			Item itemObj = Item.fromJSON(item);
			em.persist(itemObj);
			id = itemObj.getId();
			em.getTransaction().commit();
		} catch (Exception ex) {
			em.getTransaction().rollback();
		}
		return id;
	}
	
	public String savePreview(Item item) {
        String id = item.getId();
		try {
			File onDiskItem = new File(FileUtils.getTempDirectory(), id);
			FileUtils.write(onDiskItem, item.toJSON());
			onDiskItem.deleteOnExit();
		} catch (Exception ex) {
			id = "ERR";
		}
		return id;
	}

	public String query(/* will have params here */) {
		Query query = em.createQuery("select i from Item i order by i.rank.totalScore desc", Item.class);
		List<Item> resultList = query.getResultList();
		Map<String, List> resultMap = new HashMap<String, List>();
		resultMap.put("items", resultList);
		return new Gson().toJson(resultMap, HashMap.class);
	}
}
