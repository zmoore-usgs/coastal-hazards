package gov.usgs.cida.coastalhazards.model;

import gov.usgs.cida.utilities.Cacheable;
import java.io.Serializable;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
public class Thumbnail implements Serializable, Cacheable {
    
    private static final long serialVersionUID = -4887617958825512425L;
    
    public static final String MIME_TYPE = "image/png";

    private String itemId;
    private String image;
    private Date lastModified;

    @Id
    @Column(name = "item_id")
    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
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
