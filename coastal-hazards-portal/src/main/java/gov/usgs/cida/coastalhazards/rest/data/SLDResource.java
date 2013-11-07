package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.DataItem;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.sld.SLDGenerator;
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
@Path("sld")
public class SLDResource {

	@GET
	@Path("{id}")
	@Produces(MediaType.APPLICATION_XML + ";qs=2")
	public Response getSLD(@PathParam("id") String id) {
		Response response = null;

		ItemManager manager = new ItemManager();
		Item item = manager.loadItem(id);
		if (item == null) {
			response = Response.status(Response.Status.NOT_FOUND).build();
		} else {
            if (item instanceof DataItem) {
                DataItem dataItem = (DataItem)item;
                SLDGenerator generator = SLDGenerator.getGenerator(dataItem);
                if (generator != null) {
                    response = generator.generateSLD();
                }
            } else {
                throw new UnsupportedOperationException("SLD only works on Data Items");
            }
		}

		return response;
	}

	@GET
	@Path("{id}")
	@Produces(MediaType.APPLICATION_JSON + ";qs=1")
	public Response getSLDInfo(@PathParam("id") String id) {
		Response response;

		ItemManager manager = new ItemManager();
		Item item = manager.loadItem(id);
		if (item == null) {
			response = Response.status(Response.Status.NOT_FOUND).build();
		} else {
			if (item instanceof DataItem) {
                DataItem dataItem = (DataItem)item;
                SLDGenerator generator = SLDGenerator.getGenerator(dataItem);
                if (generator == null) {
                    response = Response.status(Response.Status.NOT_FOUND).build();
                } else {
                    response = generator.generateSLDInfo();
                }
            } else {
                throw new UnsupportedOperationException("SLD only works on Data Items");
            }
		}

		return response;
	}
}
