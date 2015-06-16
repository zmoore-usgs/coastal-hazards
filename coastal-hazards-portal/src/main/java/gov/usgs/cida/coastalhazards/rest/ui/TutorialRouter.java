package gov.usgs.cida.coastalhazards.rest.ui;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.glassfish.jersey.server.mvc.Viewable;

/**
 *
 * @author isuftin
 */
@Path("/tutorial")
public class TutorialRouter {
	@GET
	@Produces(MediaType.TEXT_HTML)
	@Path("/{step}")
	public Response useInfoJsp(@PathParam("step") String step) {
		Identifier identifier = new Identifier(step, Identifier.IdentifierType.TOUR);
		return Response.ok(new Viewable("/WEB-INF/jsp/ui/front/index.jsp", identifier)).build();
	}
	
	@GET
	@Produces("text/html")
	public Response useJspAtPath() {
		Identifier identifier = new Identifier("1", Identifier.IdentifierType.TOUR);
		return Response.ok(new Viewable("/WEB-INF/jsp/ui/front/index.jsp", identifier)).build();
	}
}
