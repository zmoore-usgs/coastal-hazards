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
    
    private static final String HQL_SELECT_ALL = "select a from Alias a";
    private static final String HQL_SELECT_BY_ID = "select a from Alias a where a.id = :id";
    private static final String HQL_SELECT_BY_ITEM_ID = "select a from Alias a where a.itemId = :item_id";
    private static final String HQL_DELETE_ALL= "DELETE FROM Alias";
    private static final String HQL_DELETE_BY_ID = "DELETE from Alias a where a.id = :id";
    private static final String HQL_DELETE_BY_ITEM_ID = "DELETE from Alias a where a.itemId = :item_id";
    
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
    
    public List<Alias> loadAll() {
	Query selectAllQuery = em.createQuery(HQL_SELECT_ALL);
        List<Alias> resultList = selectAllQuery.getResultList();
	return(resultList);
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
			throw ex;
        }
	
	return aliasId;
    }
    
    public String update(Alias alias) {
	EntityTransaction transaction = em.getTransaction();
	String aliasId;
	
        try {
            transaction.begin();
	    em.merge(alias);
	    transaction.commit();
	    aliasId = alias.getId();
        } catch (Exception ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
			aliasId = null;
			throw ex;
        }
	
	return aliasId;
    }
    
    /**
     * Delete all of the aliases from the alias table
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
		throw ex;
	}

	return deleted;
    }
    
    /**
     * Delete the alias with the given ID
     * @param id The id of the alias to delete
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
		throw ex;
	}

	return deleted;
    }
    
    /**
     * Delete all of the aliases associated with the given item id
     * @param item The item to delete the associated aliases for
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
		throw ex;
	}
	
	return(deleted);
    }
    
    /**
     * Delete all of the aliases associated with the given item
     * @param item The item to delete the associated aliases for
     * @return Boolean Representing whether or not the delete executed successfully.
     */
    public boolean deleteAliasesForItem(Item item){
	if (item == null) {
            throw new IllegalArgumentException("Item must be valid data item");
        }
	
	return(deleteAliasesForItemId(item.getId()));
    }
        
    /**
     * Grab all of the aliases associated with the provided item ID
     * @return The list of related aliases
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
    
    /**
     * Grab all of the aliases associated with the provided item ID
     * @return The list of related aliases
     */
    public List<Alias> getAliasesForItem(Item item) {        
        if (item == null) {
            throw new IllegalArgumentException("Item must be valid data item");
        }
        
	return getAliasesForItemId(item.getId());
    }
}
