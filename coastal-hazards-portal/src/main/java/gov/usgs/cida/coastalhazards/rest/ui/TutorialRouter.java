package gov.usgs.cida.coastalhazards.rest.ui;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import java.util.HashMap;
import java.util.Map;
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

	/**
	 * Sends the client to the item info page with a header to notify the client
	 * to start a tour
	 *
	 * @param id
	 * @return
	 */
	@GET
	@Produces(MediaType.TEXT_HTML)
	@Path("/item/{itemId}")
	public Response showActionCenterTutorial(@PathParam("itemId") String id) {
		Response response;
		Map<String, Object> map;
		Item item;

		try (ItemManager mgr = new ItemManager()) {
			item = mgr.load(id);
		}

		if (item == null) {
			response = Response.status(Response.Status.NOT_FOUND).build();
		} else {
			map = new HashMap<>();
			map.put("item", item);
			map.put("tutorial", "true");
			response = Response.ok(new Viewable("/WEB-INF/jsp/ui/back/index.jsp", map)).build();
		}
		return response;
	}

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
