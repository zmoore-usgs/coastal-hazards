package gov.usgs.cida.coastalhazards.rest;

import gov.usgs.cida.coastalhazards.session.io.SessionIO;
import gov.usgs.cida.coastalhazards.session.io.SessionIOException;
import gov.usgs.cida.coastalhazards.session.io.SessionJPAIO;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.File;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.commons.io.FileUtils;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("sessions")
public class SessionResource {
    
    private static final DynamicReadOnlyProperties props = JNDISingleton.getInstance();
    private static final SessionIO sessionIo = new SessionJPAIO();
    
    @GET
    @Path("{sid}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSession(@PathParam("sid") String sid) throws SessionIOException {
        String jsonSession = sessionIo.load(sid);
        Response response = null;
        if (null == jsonSession) {
            response = Response.status(Response.Status.NOT_FOUND).build();
        }
        else {
            response = Response.ok(jsonSession, MediaType.APPLICATION_JSON_TYPE).build();
        }
        return response;
    }
    
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    public Response postSession(String content) throws SessionIOException {
        String saved = sessionIo.save(content);
        Response response = null;
        if (null == saved) {
            response = Response.status(Response.Status.BAD_REQUEST).build();
        }
        else {
            response = Response.ok(saved, MediaType.TEXT_PLAIN_TYPE).build();
        }
        return response;
    }
}
