package gov.usgs.cida.coastalhazards.jpa;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.model.Item;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

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
        Item item = em.find(Item.class, itemId);
        String jsonItem = item.toJSON();
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
    
    public String query(/* will have params here */) {
        Query query = em.createQuery("select i from Item i", Item.class);
        List<Item> resultList = query.getResultList();
        Map<String, List> resultMap = new HashMap<String, List>();
        resultMap.put("items", resultList);
        return new Gson().toJson(resultMap, HashMap.class);
    }
    
}
