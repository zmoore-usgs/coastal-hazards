package gov.usgs.cida.coastalhazards.rest;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.session.io.SessionIO;
import gov.usgs.cida.coastalhazards.session.io.SessionIOException;
import gov.usgs.cida.coastalhazards.jpa.SessionManager;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.util.HashMap;
import java.util.Map;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("/ui/view")
public class SessionResource {
    
    private static final DynamicReadOnlyProperties props = JNDISingleton.getInstance();
    private static final SessionIO sessionIo = new SessionManager();
    
    @GET
    @Path("{sid}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSession(@PathParam("sid") String sid) throws SessionIOException {
        String jsonSession = sessionIo.load(sid);
        Response response;
        if (null == jsonSession) {
            response = Response.status(Response.Status.NOT_FOUND).build();
        } else {
            response = Response.ok(jsonSession, MediaType.APPLICATION_JSON_TYPE).build();
        }
        return response;
    }
    
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response postSession(String content) throws SessionIOException {
        final String sid = sessionIo.save(content);
        Response response = null;
        if (null == sid) {
            response = Response.status(Response.Status.BAD_REQUEST).build();
        } else {
            Map<String, Object> ok = new HashMap<String, Object>() {{put("sid", sid);}};
            response = Response.ok(new Gson().toJson(ok, HashMap.class), MediaType.APPLICATION_JSON_TYPE).build();
        }
        return response;
    }
}
