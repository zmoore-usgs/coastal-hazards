package gov.usgs.cida.coastalhazards.model.ogc;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Embeddable
public class WMSService implements Serializable {

    private static final long serialVersionUID = 1L;
    
    private String endpoint;
    private String layers;
    
    @Column(name="wms_endpoint")
    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    @Column(name="wms_layers")
    public String getLayers() {
        return layers;
    }

    public void setLayers(String layers) {
        this.layers = layers;
    }
}
