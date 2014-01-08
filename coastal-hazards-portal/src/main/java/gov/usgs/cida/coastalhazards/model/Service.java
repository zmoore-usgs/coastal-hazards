package gov.usgs.cida.coastalhazards.model;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name="service")
public class Service implements Serializable {

    private static final long serialVersionUID = 1L;
    
    private transient int id;
    private ServiceType type;
    private transient String itemId;
    private String endpoint;
    private String serviceParameter;
    
    public enum ServiceType {
        source_wfs,
        source_wms,
        esri_rest,
        proxy_wfs,
        proxy_wms,
        csw;
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    @Column(name="service_endpoint")
    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    @Column(name="service_type")
    @Enumerated(EnumType.STRING)
    public ServiceType getType() {
        return type;
    }

    public void setType(ServiceType type) {
        this.type = type;
    }

    @Column(name="item_id")
    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    @Column(name="service_parameter")
    public String getServiceParameter() {
        return serviceParameter;
    }

    public void setServiceParameter(String serviceParameter) {
        this.serviceParameter = serviceParameter;
    }

}
