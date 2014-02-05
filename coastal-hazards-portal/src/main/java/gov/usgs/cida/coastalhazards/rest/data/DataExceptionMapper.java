package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.rest.ApplicationExceptionMapper;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Provider
public class DataExceptionMapper extends ApplicationExceptionMapper {

    @Override
    public Response toResponse(Exception exception) {
        return super.toResponse(exception);
    }
}
