package gov.usgs.cida.coastalhazards.model.summary;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.validation.constraints.Size;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Embeddable
public class Tiny implements Serializable {

    public static final int MAX_LENGTH = 105;
    
    private String text;
    
    @Column(name="tiny_text", length = 105)
    public String getText() {
        return text;
    }

    public void setText(@Size(max = MAX_LENGTH) String text) {
        this.text = text;
    }
    
}
