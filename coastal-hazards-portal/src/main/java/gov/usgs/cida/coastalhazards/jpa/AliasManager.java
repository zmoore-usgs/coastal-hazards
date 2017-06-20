package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.Alias;
import gov.usgs.cida.coastalhazards.model.Item;
import java.util.List;
import javax.persistence.Query;
import org.apache.log4j.Logger;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;

/**
 *
 * @author Zack Moore <zmoore@usgs.gov>
 */
public class AliasManager implements AutoCloseable {

    private static final Logger log = Logger.getLogger(DataDomainManager.class);
    
    private static final String HQL_SELECT_BY_ID = "select a from Alias a where a.id = :id";
    private static final String HQL_SELECT_BY_ITEM_ID = "select a from Alias a where a.item_id = :item_id";
    private static final String HQL_DELETE_ALL= "DELETE FROM Alias";
    private static final String HQL_DELETE_BY_ID = "DELETE from Alias a where a.id = :id";
    private static final String HQL_DELETE_BY_ITEM_ID = "DELETE from Alias a where a.item_id = :item_id";
    
    private EntityManager em;

    public AliasManager() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
    }
    
    @Override
    public void close() {
        JPAHelper.close(em);
    }
        
    public Alias load(String id) {
        Alias alias = null;

        Query selectQuery = em.createQuery(HQL_SELECT_BY_ID);
        selectQuery.setParameter("id", id);
        List<Alias> resultList = selectQuery.getResultList();
        if (!resultList.isEmpty()) {
            alias = resultList.get(0);
        }
        return alias;
    }
    
    public String save(Alias alias) {
        EntityTransaction transaction = em.getTransaction();
	String aliasId;
	
        try {
            transaction.begin();
            em.persist(alias);
            transaction.commit();
	    aliasId = alias.getId();
        } catch (Exception ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
	    aliasId = null;
        }
	
	return aliasId;
    }
    
    /**
     * Delete all of the domains and values from the table so that they can be
     * re-generated based on the new tree layout.
     * @return Boolean Representing whether or not the delete executed successfully.
     */
    public boolean deleteAll() {
	boolean deleted = false;
	EntityTransaction transaction = em.getTransaction();
	Query deleteQuery = em.createQuery(HQL_DELETE_ALL);
	
	try {
	    transaction.begin();
	    deleteQuery.executeUpdate();
	    transaction.commit();
	    deleted = true;
	} catch (Exception ex) {
	    if(transaction.isActive()){
		transaction.rollback();
	    }
	}

	return deleted;
    }
    
    /**
     * Delete the data domain with the given ID
     * @param id The id of the data domain to delete
     * @return Boolean Representing whether or not the delete executed successfully.
     */
    public boolean delete(String id) {
	boolean deleted = false;
	EntityTransaction transaction = em.getTransaction();
	Query deleteQuery = em.createQuery(HQL_DELETE_BY_ID);
        deleteQuery.setParameter("id", id);
	
	try {
	    transaction.begin();
	    deleteQuery.executeUpdate();
	    transaction.commit();
	    deleted = true;
	} catch (Exception ex) {
	    if(transaction.isActive()){
		transaction.rollback();
	    }
	}

	return deleted;
    }
    
    /**
     * Delete the data domain associated with the given item
     * @param item The item to delete the associated data domain for
     * @return Boolean Representing whether or not the delete executed successfully.
     */
    public boolean deleteAliasesForItemId(String itemId) {
	if (itemId == null) {
            throw new IllegalArgumentException("Item ID must be valid data item ID");
        }
	
	boolean deleted = false;
	EntityTransaction transaction = em.getTransaction();
	Query deleteQuery = em.createQuery(HQL_DELETE_BY_ITEM_ID);
        deleteQuery.setParameter("item_id", itemId);
	
	try {
	    transaction.begin();
	    deleteQuery.executeUpdate();
	    transaction.commit();
	    deleted = true;
	} catch (Exception ex) {
	    if(transaction.isActive()){
		transaction.rollback();
	    }
	}
	
	return(deleted);
    }
    
    public boolean deleteAliasesForItem(Item item){
	if (item == null) {
            throw new IllegalArgumentException("Item must be valid data item");
        }
	
	return(deleteAliasesForItemId(item.getId()));
    }
        
    /**
     * Grab the domain of the item data and store it for later
     * TODO if Item has been modified, invalidate DB persisted entity
     * @param item Item for which domain to gather
     * @return DataDomain object making up the domain
     */
    public List<Alias> getAliasesForItemId(String itemId) {        
        if (itemId == null) {
            throw new IllegalArgumentException("Item must be valid data item");
        }
        
	Query selectQuery = em.createQuery(HQL_SELECT_BY_ITEM_ID);
        selectQuery.setParameter("item_id", itemId);
        List<Alias> resultList = selectQuery.getResultList();
        
        return resultList;
    }
    
    public List<Alias> getAliasesForItem(Item item) {        
        if (item == null) {
            throw new IllegalArgumentException("Item must be valid data item");
        }
        
	return getAliasesForItemId(item.getId());
    }
}
