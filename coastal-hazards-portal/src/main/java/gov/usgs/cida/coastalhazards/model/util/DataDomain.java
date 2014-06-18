package gov.usgs.cida.coastalhazards.model.util;

import gov.usgs.cida.utilities.Cacheable;
import java.io.Serializable;
import java.util.Date;
import java.util.SortedSet;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import org.hibernate.annotations.Sort;
import org.hibernate.annotations.SortType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "domains")
public class DataDomain implements Serializable, Cacheable {
    
    private static final long serialVersionUID = 1966390157385346795L;
    private static final Logger log = LoggerFactory.getLogger(DataDomain.class);
    
    private int id;
    private String itemId;
    private String sessionId;
    private SortedSet<String> domainValues;
    private Date lastModified;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Column(name = "item_id")
    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    @Column(name = "session_id")
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "domain_values",
            joinColumns = @JoinColumn(name = "domain_id"))
    @Sort(type = SortType.NATURAL)
    @Column(name = "domain_value")
    public SortedSet<String> getDomainValues() {
        return domainValues;
    }

    public void setDomainValues(SortedSet<String> domainValues) {
        this.domainValues = domainValues;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "last_modified")
    @Override
    public Date getLastModified() {
        return lastModified;
    }

    public void setLastModified(Date lastModified) {
        this.lastModified = lastModified;
    }
    
    @PrePersist
	@PreUpdate
    protected void timestamp() {
        this.lastModified = new Date();
    }

}
