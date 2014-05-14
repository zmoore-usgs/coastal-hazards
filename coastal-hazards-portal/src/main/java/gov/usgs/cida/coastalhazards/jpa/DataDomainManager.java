package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.domain.DataDomainUtility;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Session;
import gov.usgs.cida.coastalhazards.model.util.DataDomain;
import java.util.List;
import java.util.Set;
import java.util.SortedSet;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Query;
import org.apache.log4j.Logger;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DataDomainManager implements AutoCloseable {
    
    private static final Logger log = Logger.getLogger(DataDomainManager.class);
    private static final String HQL_SELECT_BY_ID = "select d from DataDomain d where d.itemId = :id or d.sessionId = :id";
    
    private EntityManager em;

    public DataDomainManager() {
        em = JPAHelper.getEntityManagerFactory().createEntityManager();
    }
    
    @Override
    public void close() {
        JPAHelper.close(em);
    }
    
    public boolean isPersisted(String id) {
        boolean isPersisted = false;

        Query selectQuery = em.createQuery(HQL_SELECT_BY_ID);
        selectQuery.setParameter("id", id);
        List<DataDomain> resultList = selectQuery.getResultList();
        if (!resultList.isEmpty()) {
            isPersisted = true;
        }
        return isPersisted;
    }
    
    public DataDomain load(String id) {
        DataDomain domain = null;

        Query selectQuery = em.createQuery(HQL_SELECT_BY_ID);
        selectQuery.setParameter("id", id);
        List<DataDomain> resultList = selectQuery.getResultList();
        if (!resultList.isEmpty()) {
            domain = resultList.get(0);
        }
        return domain;
    }
    
    public void save(DataDomain domain) {
        EntityTransaction transaction = em.getTransaction();
        try {
            transaction.begin();
            em.persist(domain);
            transaction.commit();
        } catch (Exception ex) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
    }
    
    public DataDomain getDomainForItem(Item item) {
        DataDomain domain = new DataDomain();
        
        if (item == null) {
            throw new IllegalArgumentException("Item must be valid data item");
        } else if (isPersisted(item.getId())) {
            log.debug("Found domain in database, return it");
            domain = load(item.getId());
        } else {
            log.debug("No domain found in database, get it from WFS");
            SortedSet<String> domainVals = DataDomainUtility.retrieveDomainFromWFS(item);
            // only using this for years for now, separated out for future endeavors though
            SortedSet<String> domainAsYears = DataDomainUtility.getDomainAsYears(domainVals);
            domain.setItemId(item.getId());
            domain.setDomainValues(domainAsYears);
            save(domain);
        }
        
        return domain;
    }
    
    public DataDomain getDomainForSession(Session session) {
        throw new UnsupportedOperationException("Not yet implemented, need to think about how this would work");
    }
    
}
