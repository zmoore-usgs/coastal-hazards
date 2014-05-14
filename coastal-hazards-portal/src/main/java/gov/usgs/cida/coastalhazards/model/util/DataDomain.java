package gov.usgs.cida.coastalhazards.model.util;

import java.io.Serializable;
import java.util.Set;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Table;
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
public class DataDomain implements Serializable {
    
    private static final long serialVersionUID = 1966390157385346795L;
    private static final Logger log = LoggerFactory.getLogger(DataDomain.class);
    
    private int id;
    private String itemId;
    private String sessionId;
    private Set<String> domainValues;

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
    @Column(name = "value_id")
    public Set<String> getDomainValues() {
        return domainValues;
    }

    public void setDomainValues(Set<String> domainValues) {
        this.domainValues = domainValues;
    }

}
