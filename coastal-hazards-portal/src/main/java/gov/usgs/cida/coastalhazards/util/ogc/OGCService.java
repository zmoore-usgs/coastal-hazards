package gov.usgs.cida.coastalhazards.util.ogc;

import java.io.Serializable;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public interface OGCService extends Serializable {
    
    public String getEndpoint();
    
    public void setEndpoint(String endpoint);
}
