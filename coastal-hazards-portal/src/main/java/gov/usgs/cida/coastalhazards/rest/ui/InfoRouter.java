package gov.usgs.cida.coastalhazards.rest.ui;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import org.glassfish.jersey.server.mvc.Viewable;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("/info/item")
public class InfoRouter {

	@GET
	@Produces(MediaType.TEXT_HTML)
	@Path("{id}")
	public Response useInfoJsp(@PathParam("id") String id) {
		Item item = new ItemManager().load(id);
		if (item == null) {
			return Response.status(Status.NOT_FOUND).build();
		}
		return Response.ok(new Viewable("/WEB-INF/jsp/ui/back/index.jsp", item)).build();
	}

	@GET
	@Produces("text/html")
	@Path("{jspPath:.*/?.*\\..*}")
	public Response useResourceAtInfoPath(@PathParam("jspPath") String jspPath) {
		return Response.ok(new Viewable("/" + jspPath)).build();
	}
}
