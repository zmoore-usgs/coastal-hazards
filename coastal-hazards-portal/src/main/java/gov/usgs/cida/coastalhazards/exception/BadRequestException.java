package gov.usgs.cida.coastalhazards.exception;

import javax.ws.rs.WebApplicationException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class BadRequestException extends WebApplicationException {
    
    private static final long serialVersionUID = 1L;

    @Override
    public String getMessage() {
        return "Request was unable to be performed: bad";
    }
    
}
