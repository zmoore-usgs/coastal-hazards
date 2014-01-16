package gov.usgs.cida.coastalhazards.model;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 * This class is meant to hold information about items that are members of sessions
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Embeddable
public class SessionItem implements Serializable {

    private String itemId;
    private boolean visible;
    
    @Column(name = "item_id")
    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }
    
}
