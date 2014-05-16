package gov.usgs.cida.coastalhazards.util.ogc;

import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class WMSService implements OGCService {

    private static final long serialVersionUID = 1L;
    
    private String endpoint;
    private String layers;
    
    public WMSService() {
        // empty constructor, must call setters
    }
    
    public WMSService(Service service) {
        if (service != null && (service.getType() == ServiceType.source_wms ||
                service.getType() == ServiceType.proxy_wms)) {
            endpoint = service.getEndpoint();
            layers = service.getServiceParameter();
        } else {
            throw new IllegalArgumentException("Service must be of WMS type");
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

    public String getLayers() {
        return layers;
    }

    public void setLayers(String layers) {
        this.layers = layers;
    }
}
