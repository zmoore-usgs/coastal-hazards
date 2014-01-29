package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.Item;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Query;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ItemManager implements AutoCloseable {
    
    private static final Logger log = Logger.getLogger(ItemManager.class);
    private EntityManager em;
    
    public ItemManager() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
    }

    public Item load(String itemId) {
        Item item = null;
        item = em.find(Item.class, itemId);
        List<Item> children = item.getChildren();
        List<Item> replaceList = new LinkedList<>();
        if (children != null) {
            for (Item child : children) {
                replaceList.add(load(child.getId()));
            }
            item.setChildren(replaceList);
        }
        return item;
    }

    public synchronized String persist(String item) {
        String id = null;

        EntityTransaction transaction = em.getTransaction();
		try {
			transaction.begin();
			Item itemObj = Item.fromJSON(item);
            List<Item> children = itemObj.getChildren();
            List<Item> replaceList = new LinkedList<>();
            if (children != null) {
                for (Item child : children) {
                    replaceList.add(load(child.getId()));
                }
                itemObj.setChildren(replaceList);
            }
			em.persist(itemObj);
			id = itemObj.getId();
			transaction.commit();
            fixEnabledStatus();

		} catch (Exception ex) {
            log.debug("Exception during save", ex);
            if (transaction.isActive()) {
                transaction.rollback();
            }
            id = null;
		}
        return id;
    }

    public synchronized String merge(Item item) {
        String id = null;
        EntityTransaction transaction = em.getTransaction();
        try {
            transaction.begin();
            em.merge(item);
            id = item.getId();
            transaction.commit();
            fixEnabledStatus();
        } catch (Exception ex) {
            log.debug("Transaction failed on merge", ex);
            if (transaction.isActive()) {
                transaction.rollback();
            }
            id = null;
        }
        return id;
    }
    
    public boolean delete(String itemId) {
        boolean deleted = false;
        EntityTransaction transaction = em.getTransaction();
        try {
            transaction.begin();
            Item item = em.find(Item.class, itemId);
            em.remove(item);
            transaction.commit();
            fixEnabledStatus();
            deleted = true;
        } catch (Exception ex) {
            log.debug("Transaction failed on delete", ex);
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
        return deleted;
    }

    /**
     * Query the database for items and return it as a json string
     *
     * @param queryText keywords to query on
     * @param types item types to include in results
     * @param sortBy sort the results according to this technique
     * @param count max items to return (TODO paging)
     * @param bbox search bounding box (TODO fix this)
     * @param subtree whether to return entire subtree for aggregated items
     * @param showDisabled whether to include disabled items in the search
     * @return JSON result of items
     */
    public String query(List<String> queryText, List<String> types, String sortBy,
            int count, String bbox, boolean subtree, boolean showDisabled) {
        StringBuilder builder = new StringBuilder();
        List<String> queryParams = new LinkedList<>();
        int paramIndex = 1;
        builder.append("select i from Item i where i.enabled = true");
        // show disabled means return enable == true and false, so 1=1, narrow it down if !showDisabled
        if (showDisabled) {
            builder.append(" and i.enabled = false");
        }
        boolean hasQueryText = isEmpty(queryText);
        boolean hasType = isEmpty(types);
        List<Item.Type> typesList = new LinkedList<>();
        if (hasQueryText || hasType) {
            if (hasQueryText) {
                builder.append(" and ");
				List<String> likes = new ArrayList<>();
				for (String keyword : queryText) {
					if (StringUtils.isNotBlank(keyword)) {
                        queryParams.add('%' + keyword + "%");
                        StringBuilder likeBuilder = new StringBuilder();
                        likeBuilder.append(" lower(i.summary.keywords) like lower(?")
                                .append(paramIndex++)
                                .append(")");
                        likes.add(likeBuilder.toString());
                    }
                }
                builder.append(StringUtils.join(likes, " or"));
            }
            if (hasType) {
                builder.append(" and");
                for (String type : types) {
                    typesList.add(Item.Type.valueOf(type));
                }
                builder.append(" i.type in(:types)");
            }
        }
//        if ("popularity".equals(sortBy)) {
//            builder.append(" order by i.rank.totalScore desc");
//        } else if (false/*replace with other sort options */) {
        // TODO add order by clause
//        }
        if (StringUtils.isNotBlank(bbox)) {
            //TODO bbox stuff here
        }

        String jsonResult = "";

        Query query = em.createQuery(builder.toString(), Item.class);
        for (int i = 0; i < queryParams.size(); i++) {
            String param = queryParams.get(i);
            query.setParameter(i + 1, param);
        }
        if (hasType) {
            query.setParameter("types", typesList);
        }
        if (count > 0) {
            query.setMaxResults(count);
        }

        List<Item> resultList = query.getResultList();
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("subtree", subtree);
        resultMap.put("items", resultList);
        if (subtree) {
            jsonResult = GsonUtil.getSubtreeGson().toJson(resultMap, HashMap.class);
        }
        else {
            jsonResult = GsonUtil.getIdOnlyGson().toJson(resultMap, HashMap.class);
        }

        return jsonResult;
    }
    
    /**
     * Run this after inserting, updating or deleting
     * @param* @return number of items updated from query
     */
    public int fixEnabledStatus() {
        int status = -1;
        EntityTransaction transaction = em.getTransaction();
        try {
            transaction.begin();
            Query update = em.createNativeQuery("UPDATE item SET enabled=\n" +
                    "CASE \n" +
                    "	WHEN item.id IN(WITH RECURSIVE subtree(id, child, depth) AS (\n" +
                    "			SELECT a.aggregation_id, a.item_id, 1\n" +
                    "			FROM aggregation_children a\n" +
                    "			WHERE a.aggregation_id=(SELECT item.id FROM item WHERE item.item_type = 'uber')\n" +
                    "		UNION ALL\n" +
                    "			SELECT a.aggregation_id, a.item_id, s.depth+1\n" +
                    "			FROM aggregation_children a, subtree s\n" +
                    "			WHERE a.aggregation_id = s.child\n" +
                    "		)\n" +
                    "			SELECT DISTINCT(foo.child) FROM (SELECT * FROM subtree) AS foo UNION (SELECT item.id as child FROM item WHERE item.item_type = 'uber'))\n" +
                    "		THEN TRUE\n" +
                    "	ELSE FALSE\n" +
                    "END");
            status = update.executeUpdate();
            transaction.commit();
        } catch (Exception ex) {
            log.debug("Transaction failed on update enabled", ex);
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
        return status;
    }

    private boolean isEmpty(List<String> args) {
        boolean result = false;
        if (args != null) {
            for (String str : args) {
                if (StringUtils.isNotBlank(str)) {
                    result = true;
                }
            }
        }
        return result;
    }
    
    @Override
    public void close() {
        JPAHelper.close(em);
    }

}
