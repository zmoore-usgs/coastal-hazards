package gov.usgs.cida.coastalhazards.model.summary;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Embeddable
public class Tiny implements Serializable {

    private String text;

    @Column(name="tiny_text", length = 512)
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
    
}
