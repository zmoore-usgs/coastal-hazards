package gov.usgs.cida.coastalhazards.rest.ui;

import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.glassfish.jersey.server.mvc.Viewable;

/**
 *
 * @author Zack Moore <zmoore@usgs.gov>
 */
@Path("/alias")
public class AliasRouter {

	@GET
	@Produces(MediaType.TEXT_HTML)
	@Path("{alias}")
	public Response useInfoJsp(@PathParam("alias") String alias) {
		Identifier identifier = new Identifier(alias, Identifier.IdentifierType.ALIAS);
		if (null == alias) {
			throw new NotFoundException();
		}
		return Response.ok(new Viewable("/WEB-INF/jsp/ui/front/index.jsp", identifier)).build();
	}

	@GET
	@Produces("text/html")
	@Path("{jspPath:.*/?.*\\..*}")
	public Response useResourceAtInfoPath(@PathParam("jspPath") String jspPath) {
		return Response.ok(new Viewable("/" + jspPath)).build();
	}
}
