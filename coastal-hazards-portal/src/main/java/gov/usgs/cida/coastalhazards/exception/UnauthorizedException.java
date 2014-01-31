package gov.usgs.cida.coastalhazards.exception;

import javax.ws.rs.WebApplicationException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class UnauthorizedException extends WebApplicationException {
    
    @Override
    public String getMessage() {
        return "Authorization failed when accessing resource";
    }
    
}
