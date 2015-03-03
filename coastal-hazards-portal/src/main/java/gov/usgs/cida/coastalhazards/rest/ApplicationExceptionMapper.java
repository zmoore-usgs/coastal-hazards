package gov.usgs.cida.coastalhazards.rest;

import gov.usgs.cida.coastalhazards.exception.BadRequestException;
import gov.usgs.cida.coastalhazards.exception.CycleIntroductionException;
import gov.usgs.cida.coastalhazards.exception.DownloadStagingUnsuccessfulException;
import gov.usgs.cida.coastalhazards.exception.PreconditionFailedException;
import gov.usgs.cida.coastalhazards.exception.UnauthorizedException;

import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.ext.ExceptionMapper;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ApplicationExceptionMapper implements ExceptionMapper<Exception>  {

    @Override
    public Response toResponse(Exception exception) {
        Response response = null;
        if (exception instanceof DownloadStagingUnsuccessfulException) {
            response = Response.status(Status.SERVICE_UNAVAILABLE).entity(exception).build();
        } else if (exception instanceof NotFoundException) {
            response = Response.status(Status.NOT_FOUND).build();
        } else if (exception instanceof UnauthorizedException) {
            response = Response.status(Status.UNAUTHORIZED).build();
        } else if (exception instanceof PreconditionFailedException) {
            response = Response.status(Status.PRECONDITION_FAILED).build();
        } else if (exception instanceof CycleIntroductionException) {
            response = Response.status(Status.CONFLICT).entity("{\"status\":\"" + exception.getMessage() + "\"}")
                        .type(MediaType.APPLICATION_JSON_TYPE).build();
        } else if (exception instanceof BadRequestException) {
            response = Response.status(Status.BAD_REQUEST).build();
        } else {
            response = Response.status(Status.INTERNAL_SERVER_ERROR).build();
        }
        return response;
    }
}
