package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.Item;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

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
    
}
