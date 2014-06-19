package gov.usgs.cida.coastalhazards.rest.ui;

import com.sun.jersey.api.NotFoundException;
import com.sun.jersey.api.view.Viewable;
import gov.usgs.cida.coastalhazards.model.Item;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("/item")
public class ItemRouter {
    
    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("{id}")
    public Response useInfoJsp(@PathParam("id") String id) {
        Response response = null;
        Identifier identifier = new Identifier(id, Identifier.IdentifierType.ITEM);
        if (null == id || id.equals(Item.UBER_ID)) {
            throw new NotFoundException();
        }
        response = Response.ok(new Viewable("/index.jsp", identifier)).build();
        
        return response;
    }
    
    @GET
	@Produces("text/html")
	@Path("{jspPath:.*/?.*\\..*}")
	public Response useResourceAtInfoPath(@PathParam("jspPath") String jspPath) {
		return Response.ok(new Viewable("/" + jspPath)).build();
	}
}
