package gov.usgs.cida.coastalhazards.model.summary;

import gov.usgs.cida.utilities.StringPrecondition;
import java.io.Serializable;
import java.util.LinkedList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Name full_publications is holdout from when this was embedded, didn't want to
 * change too many things at once.
 * 
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "full_publications")
public class Publication implements Serializable {
    
    public enum PublicationType {
        data,
        publications,
        resources;
    }
    
    public static final int TITLE_MAX_LENGTH = 255;
    public static final int LINK_MAX_LENGTH = 255;
    
    public static final String ID = "id";
    public static final String TITLE = "title";
    public static final String LINK = "link";

    private transient long id;
    private transient long fullId;
    private String title;
    private String link;
    private transient PublicationType type;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    @Column(name = "full_id")
    public long getFullId() {
        return fullId;
    }

    public void setFullId(long fullId) {
        this.fullId = fullId;
    }

    @Column(name = "title", length = TITLE_MAX_LENGTH)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        StringPrecondition.checkStringArgument(title, TITLE_MAX_LENGTH);
        this.title = title;
    }

    @Column(name = "link", length = LINK_MAX_LENGTH)
    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        StringPrecondition.checkStringArgument(link, LINK_MAX_LENGTH);
        this.link = link;
    }

    @Enumerated(EnumType.STRING)
    public PublicationType getType() {
        return type;
    }

    public void setType(PublicationType type) {
        this.type = type;
    }
    
    public static List<Publication> getTypedPublications(List<Publication> pubList, PublicationType type) {
        List<Publication> typedPubs = new LinkedList<>();
        if (pubList == null) { throw new IllegalArgumentException("pubList must not be null"); }
        
        for (Publication pub : pubList) {
            if (pub.getType() == type) {
                typedPubs.add(pub);
            }
        }
        return typedPubs;
    }
    
}
