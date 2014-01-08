package gov.usgs.cida.coastalhazards.model.ogc;

import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import org.apache.commons.lang.StringUtils;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Embeddable
public class WFSService implements Serializable {

    private static final long serialVersionUID = 1L;
    
    private String endpoint;
    private String typeName;
    
    public WFSService() {
        // default constructor, must call setters
    }
    
    public WFSService(Service service) {
        if (service != null && (service.getType() == ServiceType.source_wfs ||
                service.getType() == ServiceType.proxy_wfs)) {
            endpoint = service.getEndpoint();
            typeName = service.getServiceParameter();
        } else {
            throw new IllegalArgumentException("Service must be WFS type");
        }
    }
    
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
    
    @Override
    public boolean equals(Object o) {
        boolean equality;
        if (o == null) {
            equality = false;
        } else if (getClass() != o.getClass()) {
            equality = false;
        } else {
            try {
                WFSService b = (WFSService)o;
                URL urlA = new URL(this.getEndpoint());
                URL urlB = new URL(b.getEndpoint());
                equality = urlA.getHost().equals(urlB.getHost()) &&
                    urlA.getPort() == urlB.getPort() &&
                    urlA.getPath().equals(urlB.getPath()) &&
                    this.getTypeName().equals(b.getTypeName());
            } catch (MalformedURLException | ClassCastException ex) {
                equality = false;
            }
        }
        return equality;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 97 * hash + Objects.hashCode(this.endpoint);
        hash = 97 * hash + Objects.hashCode(this.typeName);
        return hash;
    }
    
    public boolean checkValidity() {
        return !(StringUtils.isBlank(this.getEndpoint()) || StringUtils.isBlank(this.getTypeName()));
    }
}
