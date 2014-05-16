package gov.usgs.cida.coastalhazards.util.ogc;

import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import java.net.MalformedURLException;
import java.net.URL;

/**
 * Using the full url rather than endpoint/params as in wfs and wms
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CSWService implements OGCService {

    private static final long serialVersionUID = 1L;
    
    private String endpoint;
    
    public CSWService() {
        // empty constructor, must call setters
    }
    
    public CSWService(Service service) {
        if (service != null && service.getType() == ServiceType.csw) {
            endpoint = service.getEndpoint();
        } else {
            throw new IllegalArgumentException("Service must be of CSW type");
        }
    }

    @Override
    public String getEndpoint() {
        return endpoint;
    }

    @Override
    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }
    
    public URL fetchUrl() throws MalformedURLException {
        return new URL(getEndpoint());
    }
    
}
