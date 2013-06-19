package gov.usgs.cida.coastalhazards.model.ogc;

import java.io.Serializable;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
//@Entity
//@Table(name="wfs_service")
public class WMSService implements OGCService, Serializable {

    private static final long serialVersionUID = 1L;
    
//    private int id;
    private String endpoint;
    private String layers;
    
//    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO)
//    public int getId() {
//        return id;
//    }
//
//    public void setId(int id) {
//        this.id = id;
//    }
    
    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getLayers() {
        return layers;
    }

    public void setLayers(String layers) {
        this.layers = layers;
    }
}
