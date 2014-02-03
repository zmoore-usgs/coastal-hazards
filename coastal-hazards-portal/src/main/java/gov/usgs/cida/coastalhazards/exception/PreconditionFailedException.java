package gov.usgs.cida.coastalhazards.exception;

import javax.ws.rs.WebApplicationException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class PreconditionFailedException extends WebApplicationException {
    
    @Override
    public String getMessage() {
        return "Precondition for operation failed";
    }
    
}
