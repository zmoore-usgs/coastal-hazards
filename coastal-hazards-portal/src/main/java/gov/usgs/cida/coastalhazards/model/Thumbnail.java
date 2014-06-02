package gov.usgs.cida.coastalhazards.model;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
public class Thumbnail implements Serializable {
    
    private static final long serialVersionUID = -4887617958825512425L;

    private String itemId;
    private String image;

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

}
