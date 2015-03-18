package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.sld.SLDGenerator;
import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.SLD_PATH)
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class SLDResource {

	/**
	 * XML representation of the SLD document related to a specific item ;qs=1
	 * is required to make this the default response when no accepts header is
	 * given
	 *
	 * @param id item ID
	 * @param ribbon which ribbon to represent (not required)
	 * @return response with SLD XML representation
	 */
	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_XML + ";qs=1")
	public Response getSLD(@PathParam("id") String id, @QueryParam("ribbon") Integer ribbon) {
		Response response = null;

		try (ItemManager manager = new ItemManager()) {
			Item item = manager.load(id);
			if (item == null) {
				response = Response.status(Response.Status.NOT_FOUND).build();
			}
			else {
				SLDGenerator generator = SLDGenerator.getGenerator(item, ribbon);
				if (generator != null) {
					response = generator.generateSLD();
				}
			}
		}

		return response;
	}

	/**
	 * JSON representation of the contents of the SLD, this is primarily for
	 * building a UI legend ;qs=0 is to make this a lower priority than the xml
	 * document, must say accepts=application/json to get this document
	 *
	 * @param id item ID
	 * @param ribbon Not used currently, but represents which ribbon to
	 * represent
	 * @return JSON document with SLD info
	 */
	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON + ";qs=0")
	public Response getSLDInfo(@PathParam("id") String id, @QueryParam("ribbon") Integer ribbon) {
		Response response;

		try (ItemManager manager = new ItemManager()) {
			Item item = manager.load(id);
			if (item == null) {
				response = Response.status(Response.Status.NOT_FOUND).build();
			}
			else {
				SLDGenerator generator = SLDGenerator.getGenerator(item, ribbon);
				if (generator == null) {
					response = Response.status(Response.Status.NOT_FOUND).build();
				}
				else {
					response = generator.generateSLDInfo();
				}
			}
		}

		return response;
	}
}
