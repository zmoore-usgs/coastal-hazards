package gov.usgs.cida.coastalhazards.model.summary;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 *
 * @author Zackary Moore <zmoore@usgs.gov>
 */
@Embeddable
public class Download implements Serializable {

    private static final long serialVersionUID = 1L;
    private String link;

    @Column(name="download_link")
    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
    
}
