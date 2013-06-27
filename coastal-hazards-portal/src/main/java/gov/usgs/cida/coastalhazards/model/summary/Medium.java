package gov.usgs.cida.coastalhazards.model.summary;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Embeddable
public class Medium implements Serializable {


    private String title;
    private String text;

    @Column(name="medium_title", length = 1024)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @Column(name="medium_text", length = 2048)
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
    
}
