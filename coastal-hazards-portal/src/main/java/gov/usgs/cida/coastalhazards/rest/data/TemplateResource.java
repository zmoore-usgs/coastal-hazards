package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.jpa.LayerManager;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Layer;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.coastalhazards.util.ogc.OGCService;
import gov.usgs.cida.utilities.IdGenerator;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.parsers.ParserConfigurationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.TEMPLATE_PATH)
public class TemplateResource {
	
	private static final Logger log = LoggerFactory.getLogger(TemplateResource.class);
	
	@POST
	@Path("/item/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response instantiateTemplate(@Context HttpServletRequest request, @PathParam("id") String id, String content) {
		Response response = null;
		try (ItemManager itemMan = new ItemManager(); LayerManager layerMan = new LayerManager()) {
			Item template = itemMan.load(id);
			if (template.getItemType() != Item.ItemType.template) {
				throw new UnsupportedOperationException("Only template items may be instantiated");
			}

			List<String> childItems = template.proxiedChildren();
			
			JsonParser parser = new JsonParser();
			JsonObject parsed = parser.parse(content).getAsJsonObject();
			// TODO only supporting one level for now, bring in aggs later
			JsonArray children = parsed.get("children").getAsJsonArray();
			Iterator<JsonElement> iterator = children.iterator();
			List<Item> newItemList = new LinkedList<>();
			while (iterator.hasNext()) {
				String newId = IdGenerator.generate();
				String attr = "";
				Layer layer = null;
				
				JsonObject child = iterator.next().getAsJsonObject();
				JsonElement childId = child.get("id");
				JsonElement attrElement = child.get("attr");
				JsonElement layerId = child.get("layerId");
			
				// Generate item JSON from metadata
				if (layerId != null) {
					layer = layerMan.load(layerId.getAsString());
					if (childId != null) {
						// Replace the existing item in this place
						String replaceId = childId.getAsString();
						if (childItems.contains(replaceId)) {
							Item item = itemMan.load(replaceId);
							childItems.remove(replaceId);
							attr = item.getAttr();
						} else {
							throw new BadRequestException("Specified invalid child to replace");
						}
					} else if (attrElement != null) {
						attr = attrElement.getAsString();
					} else {
						throw new BadRequestException("Must specify child or attribute to replace/use");
					}
				} else {
					throw new BadRequestException("Layer does not exist");
				}
				OGCService cswService = Service.ogcHelper(Service.ServiceType.csw, layer.getServices());
				String cswEndpoint = cswService.getEndpoint();
				String summaryJson = null;
				try {
					summaryJson = MetadataUtil.getSummaryFromWPS(cswEndpoint, attr);
				}
				catch (IOException | ParserConfigurationException | SAXException | URISyntaxException ex) {
					log.error("Problem getting summary from item", ex);
				}
				Gson gson = GsonUtil.getDefault();
				Summary summary = gson.fromJson(summaryJson, Summary.class);
				Item newItem = new Item();
				newItem.setAttr(attr);
				List<Service> services = layer.getServices();
				Bbox bbox = layer.getBbox();
				List<Service> serviceCopies = new LinkedList<>();
				for (Service service : services) {
					serviceCopies.add(Service.copyValues(service, null));
				}
				newItem.setServices(serviceCopies);
				newItem.setItemType(Item.ItemType.data);
				newItem.setSummary(summary);
				newItem.setId(newId);
				newItem.setBbox(Bbox.copyValues(bbox, new Bbox()));
				newItemList.add(newItem);
			}

			itemMan.persistAll(newItemList);
			template.setChildren(newItemList);
			itemMan.merge(template);
			response = Response.ok().build();
		}
		return response;
	}
	
}
