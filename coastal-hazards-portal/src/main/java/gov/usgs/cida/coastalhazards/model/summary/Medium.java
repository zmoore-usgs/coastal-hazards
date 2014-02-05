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
public class Medium implements Serializable {

    public static final int TITLE_MAX_LENGTH = 1024;
    public static final int TEXT_MAX_LENGTH = 2048;

    private String title;
    private String text;

    @Column(name="medium_title", length = TITLE_MAX_LENGTH)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        StringPrecondition.checkStringArgument(title, TITLE_MAX_LENGTH);
        this.title = title;
    }

    @Column(name="medium_text", length = TEXT_MAX_LENGTH)
    public String getText() {
        return text;
    }

    public void setText(String text) {
        StringPrecondition.checkStringArgument(text, TEXT_MAX_LENGTH);
        this.text = text;
    }
    
}
