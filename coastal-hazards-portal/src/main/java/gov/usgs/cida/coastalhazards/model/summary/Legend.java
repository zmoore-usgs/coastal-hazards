package gov.usgs.cida.coastalhazards.model.summary;

import gov.usgs.cida.utilities.StringPrecondition;
import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 *
 * @author Kathryn Schoephoester <kmschoep@usgs.gov>
 */
@Embeddable
public class Legend implements Serializable {

    public static final int TITLE_MAX_LENGTH = 40;

    private String title;

    @Column(name="legend_title", length = TITLE_MAX_LENGTH)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        StringPrecondition.checkStringArgument(title, TITLE_MAX_LENGTH);
        this.title = title;
    }
    
}
