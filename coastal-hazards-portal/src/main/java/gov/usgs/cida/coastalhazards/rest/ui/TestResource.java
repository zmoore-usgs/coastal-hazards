package gov.usgs.cida.coastalhazards.rest.ui;

import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import com.sun.jersey.api.view.Viewable;

/**
 * REST Web Service
 *
 * @author jordan
 */
@Path("test")
public class TestResource {

    @Context
    private UriInfo context;

    /**
     * Creates a new instance of TestResource
     */
    public TestResource() {
    }

    /**
     * Retrieves representation of an instance of gov.usgs.cida.coastalhazards.rest.TestResource
     * @return an instance of java.lang.String
     */
    @GET
    @Produces("text/plain")
    public String getText() {
        return "hi";
    }
    
    @GET
    @Produces("text/html")
    @Path("{name}")
    public Response useJsp(@PathParam("name")String name) {
        return Response.ok(new Viewable("/test.jsp", name)).build();
    }
    
    @POST
    @Consumes("text/plain")
    @Produces("text/plain")
    public String echo(String content) {
        return content;
    }
    
    @POST
    @Consumes("text/plain")
    @Produces("text/html")
    public Response useJspPost(String content) {
        return Response.ok(new Viewable("/test.jsp", content)).build();
    }
}
