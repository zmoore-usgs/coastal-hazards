package gov.usgs.cida.coastalhazards.model.summary;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 *
 * @author Kathryn Schoephoester <kmschoep@usgs.gov>
 */
@Embeddable
public class Legend implements Serializable {

    private String title;

    @Column(name="legend_title")
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
    
}
