package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.rest.data.util.GeoserverUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.utilities.IdGenerator;
import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import static gov.usgs.cida.coastalhazards.rest.data.ItemResource.itemURI;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.TEMPLATE_PATH)
public class TemplateResource {
	
	@POST
	@Path("/item/{id}")
	@Consumes(MediaType.APPLICATION_OCTET_STREAM)
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response instantiateTemplate(@Context HttpServletRequest request, @PathParam("id") String id, InputStream postBody) {
		Response response = null;
		try (ItemManager manager = new ItemManager()) {
			Item template = manager.load(id);
			if (template.getItemType() != Item.ItemType.template) {
				throw new UnsupportedOperationException("Only template items may be instantiated");
			}
			String newId = IdGenerator.generate();
			List<Service> added = GeoserverUtil.addLayer(postBody, newId);
			if (added.size() > 0) {
				Item newItem = template.instantiateTemplate(added);
				manager.persist(newItem);

				List<Item> instances = template.getChildren();
				if (instances == null) {
					instances = new LinkedList<>();
				}
				instances.add(newItem);
				template.setChildren(instances);
				manager.merge(template);

				response = Response.created(itemURI(newItem)).build();
			}
		}
		return response;
	}
	
}
