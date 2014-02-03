package gov.usgs.cida.coastalhazards.exception;

import javax.ws.rs.WebApplicationException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class BadRequestException extends WebApplicationException {
    
    @Override
    public String getMessage() {
        return "Request was unable to be performed: bad";
    }
    
}
