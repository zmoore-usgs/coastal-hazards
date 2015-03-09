package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.coastalhazards.util.ogc.CSWService;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Iterator;
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
import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.SAXException;


/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.TEMPLATE_PATH)
public class TemplateResource {
	
	@POST
	@Path("/item/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response instantiateTemplate(@Context HttpServletRequest request, @PathParam("id") String id, String content) {
		Response response = null;
		try (ItemManager manager = new ItemManager()) {
			Item template = manager.load(id);
			if (template.getItemType() != Item.ItemType.template) {
				throw new UnsupportedOperationException("Only template items may be instantiated");
			}

			List<String> childItems = template.proxiedChildren();
			CSWService metadata = template.fetchCswService();
			
			JsonParser parser = new JsonParser();
			JsonObject parsed = parser.parse(content).getAsJsonObject();
			// TODO only supporting one level for now, bring in aggs later
			JsonArray children = parsed.get("children").getAsJsonArray();
			Iterator<JsonElement> iterator = children.iterator();
			while (iterator.hasNext()) {
				JsonObject child = iterator.next().getAsJsonObject();
				JsonElement childId = child.get("id");
				String attr = child.get("attr").getAsString();
				JsonElement serviceId = child.get("serviceId");
				
				String summaryJson = MetadataUtil.getSummaryFromWPS(metadata.getEndpoint(), attr);
				
				if (childId != null) {
					String replaceId = childId.getAsString();
					if (childItems.contains(replaceId)) {
						
					} else {
						// bad request
					}
				} else {
					// generate id for attr
					
				}
			}
//			if (added.size() > 0) {
//				Item newItem = template.instantiateTemplate(added);
//				manager.persist(newItem);
//
//				List<Item> instances = template.getChildren();
//				if (instances == null) {
//					instances = new LinkedList<>();
//				}
//				instances.add(newItem);
//				template.setChildren(instances);
//				manager.merge(template);
//
//				response = Response.created(itemURI(newItem)).build();
//			}
		} catch (IOException ex) {
			// do something with this exception
		}
		catch (ParserConfigurationException ex) {
			
		}
		catch (SAXException ex) {
			
		}
		catch (URISyntaxException ex) {
			
		}
		return response;
	}
	
}
