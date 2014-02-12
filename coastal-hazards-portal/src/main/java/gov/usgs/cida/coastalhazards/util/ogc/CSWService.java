package gov.usgs.cida.coastalhazards.util.ogc;

import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.net.URL;

/**
 * Using the full url rather than endpoint/params as in wfs and wms
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CSWService implements Serializable {

    private static final long serialVersionUID = 1L;
    
    private String url;
    
    public CSWService() {
        // empty constructor, must call setters
    }
    
    public CSWService(Service service) {
        if (service != null && service.getType() == ServiceType.csw) {
            url = service.getEndpoint();
        } else {
            throw new IllegalArgumentException("Service must be of CSW type");
        }
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
    
    public URL fetchUrl() throws MalformedURLException {
        return new URL(getUrl());
    }
    
}
