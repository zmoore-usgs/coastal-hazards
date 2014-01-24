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
        return item;
    }

    public synchronized String persist(String item) {
        String id = null;

        EntityTransaction transaction = em.getTransaction();
		try {
			transaction.begin();
			Item itemObj = Item.fromJSON(item);
			em.persist(itemObj);
			id = itemObj.getId();
			transaction.commit();
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
        } catch (Exception ex) {
            log.debug("Transaction failed on merge", ex);
            if (transaction.isActive()) {
                transaction.rollback();
            }
            id = null;
        }
        return id;
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
     * @return JSON result of items
     */
    public String query(List<String> queryText, List<String> types, String sortBy, int count, String bbox, boolean subtree) {
        StringBuilder builder = new StringBuilder();
        List<String> queryParams = new LinkedList<>();
        int paramIndex = 1;
        builder.append("select i from Item i where i.enabled = true");
        boolean hasQueryText = isEmpty(queryText);
        boolean hasType = isEmpty(types);
        List<Item.Type> typesList = new LinkedList<>();
        if (hasQueryText || hasType) {
            if (hasQueryText) {
                builder.append(" and ");
				List<String> likes = new ArrayList<String>();
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
