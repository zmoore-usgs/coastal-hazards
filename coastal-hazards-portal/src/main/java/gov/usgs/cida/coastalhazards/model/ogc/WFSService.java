package gov.usgs.cida.coastalhazards.model.ogc;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Embeddable
public class WFSService implements Serializable {

    private static final long serialVersionUID = 1L;
    
    private String endpoint;
    private String typeName;
    
    @Column(name="wfs_endpoint")
    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    @Column(name="wfs_typename")
    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }
}
