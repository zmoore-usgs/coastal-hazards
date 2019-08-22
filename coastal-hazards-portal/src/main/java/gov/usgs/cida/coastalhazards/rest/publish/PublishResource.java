package gov.usgs.cida.coastalhazards.rest.publish;


import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.server.mvc.Viewable;

/**
 *
 * @author isuftin
 */
@Path("/")
public class PublishResource {
	
	@GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/tree/")
    public Response manageTreeAtHead(@Context HttpServletRequest req) throws URISyntaxException {
       return manageTree(req, "");
    }

    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/tree/{token}")
    public Response manageTree(@Context HttpServletRequest req, @PathParam("token") String token) throws URISyntaxException {
        Map<String, String> map = new HashMap<>(1);
        map.put("id", token);
        return Response.ok(new Viewable("/WEB-INF/jsp/publish/tree/index.jsp", map)).build();
    }

    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/item/")
    public Response viewBlankItem(@Context HttpServletRequest req) throws URISyntaxException {
       return Response.ok(new Viewable("/WEB-INF/jsp/publish/item/index.jsp", new HashMap<>(0))).build();
    }
    
    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/layer/raster")
    public Response createRasterItem(@Context HttpServletRequest req) throws URISyntaxException {
       return Response.ok(new Viewable("/WEB-INF/jsp/publish/item/raster.jsp", new HashMap<>(0))).build();
    }
	
    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/layer/vector")
    public Response createVectorItem(@Context HttpServletRequest req) throws URISyntaxException {
       return Response.ok(new Viewable("/WEB-INF/jsp/publish/item/vector.jsp", new HashMap<>(0))).build();
    }
    
    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/item/{token}")
    public Response viewItemById(@Context HttpServletRequest req, @PathParam("token") String token) throws URISyntaxException {
        Map<String, String> map = new HashMap<>(1);
        map.put("id", token);
        return Response.ok(new Viewable("/WEB-INF/jsp/publish/item/index.jsp", map)).build();
    }
}
