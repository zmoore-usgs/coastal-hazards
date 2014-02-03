package gov.usgs.cida.coastalhazards.model.summary;

import gov.usgs.cida.utilities.StringPrecondition;
import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Embeddable
public class Tiny implements Serializable {

    public static final int MAX_LENGTH = 105;
    
    private String text;
    
    @Column(name="tiny_text", length = MAX_LENGTH)
    public String getText() {
        return text;
    }

    public void setText(String text) {
        StringPrecondition.checkStringArgument(text, MAX_LENGTH);
        this.text = text;
    }
    
}
