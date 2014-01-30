package gov.usgs.cida.coastalhazards.model.summary;

import gov.usgs.cida.utilities.properties.JNDISingleton;
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
    private static final String MAX_LENGTH_KEY = "twitter.maxlength";
    public static final int MAX_LENGTH = Integer.parseInt(JNDISingleton.getInstance().getProperty(MAX_LENGTH_KEY, "140"));;

    @Column(name="tiny_text", length = 512)
    public String getText() {
        return text;
    }

    public void setText(String text) {
        if (null == text || text.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("Max length exceeded");
        }
        this.text = text;
    }
    
}
