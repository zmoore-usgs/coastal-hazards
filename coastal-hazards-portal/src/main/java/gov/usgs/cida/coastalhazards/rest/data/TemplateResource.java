package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import gov.usgs.cida.coastalhazards.Attributes;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.jpa.LayerManager;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Layer;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.summary.Full;
import gov.usgs.cida.coastalhazards.model.summary.Publication;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.coastalhazards.util.ogc.OGCService;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import gov.usgs.cida.utilities.IdGenerator;
import gov.usgs.cida.utilities.WFSIntrospector;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
import jersey.repackaged.com.google.common.collect.Lists;
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

			List<Item> childItems = template.getChildren();
			List<Item> newItemList = null;
			
			JsonParser parser = new JsonParser();
			JsonObject parsed = parser.parse(content).getAsJsonObject();
			// TODO only supporting one level for now, bring in aggs later
			boolean allAttributes = parseAllAttribute(parsed);
			if (allAttributes) {
				JsonElement layer = parsed.get("layerId");
				if (layer != null) {
					String layerId = layer.getAsString();
					try {
						newItemList = makeItemsFromLayer(template, layerId, layerMan);
					} catch (IOException ex) {
						log.error("Cannot create items", ex);
					}
				}
			} else {
				JsonArray children = parsed.get("children").getAsJsonArray();
				newItemList = makeItemsFromDocument(template, children, childItems, itemMan, layerMan);
			}
			List<String> displayed = makeDisplayedChildren(newItemList);
			itemMan.persistAll(newItemList);
			template.setChildren(newItemList);
			template.setDisplayedChildren(displayed);
			template.setSummary(gatherTemplateSummary(template.getSummary(), newItemList));
			String mergeId = itemMan.merge(template);
			if (mergeId != null) {
				response = Response.ok().build();
			} else {
				response = Response.serverError().build();
			}
		}
		return response;
	}
	
	private boolean parseAllAttribute(JsonObject parent) {
		boolean result = false;
		JsonElement allAttributes = parent.get("allAttributes");
		if (allAttributes != null) {
			result = allAttributes.getAsBoolean();
		}
		return result;
	}
	
	private List<Item> makeItemsFromDocument(Item template, JsonArray children, List<Item> childItems, ItemManager itemMan, LayerManager layerMan) {
		Map<String, Item> childMap = makeChildItemMap(childItems);
		Iterator<JsonElement> iterator = children.iterator();

		while (iterator.hasNext()) {
			
			String attr = "";
			Layer layer = null;

			JsonObject child = iterator.next().getAsJsonObject();
			JsonElement childId = child.get("id");
			JsonElement attrElement = child.get("attr");
			JsonElement layerId = child.get("layerId");
			String replaceId = null;
			// Generate item JSON from metadata
			if (layerId != null) {
				layer = layerMan.load(layerId.getAsString());
				if (childId != null) {
					// Replace the existing item in this place
					replaceId = childId.getAsString();
					if (childMap.containsKey(replaceId)) {
						Item item = itemMan.load(replaceId);
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
			Summary summary = makeSummary(layer, attr);
			Item newItem = templateItem(template, attr, layer, summary);
			childMap.put(replaceId, newItem);
		}
		return new LinkedList<>(childMap.values());
	}
	
	private List<Item> makeItemsFromLayer(Item template, String layerId, LayerManager layerMan) throws IOException {
		List<Item> items = new LinkedList<>();
		
		Layer layer = layerMan.load(layerId);
		WFSService wfs = (WFSService) Service.ogcHelper(Service.ServiceType.proxy_wfs, layer.getServices());
		List<String> attrs = WFSIntrospector.getAttrs(wfs);
		for (String attr : attrs) {
			if (Attributes.contains(attr)) {
				Summary summary = makeSummary(layer, attr);
				Item item = templateItem(template, attr, layer, summary);
				items.add(item);
			}
		}
		
		return items;
	}

	private Item templateItem(Item template, String attr, Layer layer, Summary summary) {
		String newId = IdGenerator.generate();
		Item newItem = new Item();
		newItem.setAttr(attr);
		boolean isRibbonable = Attributes.getRibbonableAttrs().contains(attr);
		
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
		newItem.setActiveStorm(template.isActiveStorm());
		newItem.setRibbonable(isRibbonable);
		newItem.setType(template.getType());
		newItem.setName(template.getName());
		return newItem;
	}

	private Summary makeSummary(Layer layer, String attr) throws JsonSyntaxException {
		OGCService cswService = Service.ogcHelper(Service.ServiceType.csw, layer.getServices());
		String cswEndpoint = cswService.getEndpoint();
		String summaryJson = null;
		try {
			summaryJson = MetadataUtil.getSummaryFromWPS(cswEndpoint, attr);
		} catch (IOException | ParserConfigurationException | SAXException | URISyntaxException ex) {
			log.error("Problem getting summary from item", ex);
		}
		Gson gson = GsonUtil.getDefault();
		Summary summary = gson.fromJson(summaryJson, Summary.class);
		return summary;
	}
	
	private Map<String, Item> makeChildItemMap(List<Item> children) {
		Map<String, Item> result = new LinkedHashMap<>();
		for (Item item : children) {
			result.put(item.getId(), item);
		}
		return result;
	}
	
	// TODO make this more configurable, right now just using PCOI
	private List<String> makeDisplayedChildren(List<Item> children) {
		List<String> displayed = new LinkedList<>();
		for (Item child : children) {
			String attr = child.getAttr();
			boolean isDisplayed = Attributes.getPCOIAttrs().contains(attr);
			if (isDisplayed) {
				displayed.add(child.getId());
			}
		}
		return displayed;
	}
	
	protected Summary gatherTemplateSummary(Summary previousSummary, List<Item> children) {
		Summary newSummary = Summary.copyValues(previousSummary, null);

		String keywords = previousSummary.getKeywords();
		Set<String> keywordSet = keywordsFromString(keywords);
		Set<Publication> publicationSet = new LinkedHashSet<>();
		
		Full full = previousSummary.getFull();
		List<Publication> publications = full.getPublications();
		publicationSet.addAll(publications);
		if (children != null) {
			for (Item item : children) {
				Set<String> childKeywords = keywordsFromString(item.getSummary().getKeywords());
				keywordSet.addAll(childKeywords);
				List<Publication> childPubs = item.getSummary().getFull().getPublications();
				for (Publication pub : childPubs) {
					publicationSet.add(Publication.copyValues(pub, null));
				}
			}
		}
		String newKeywords = String.join("|", keywordSet);
		newSummary.setKeywords(newKeywords);
		newSummary.getFull().setPublications(Lists.newArrayList(publicationSet));

		return newSummary;
	}
	
	protected Set<String> keywordsFromString(String keywords) {
		Set<String> keywordSet = new LinkedHashSet<>();
		if (keywords != null) {
			String[] splitKeywords = keywords.split("\\|");
			if (splitKeywords != null) {
				keywordSet.addAll(Arrays.asList(splitKeywords));
			}
		}
		return keywordSet;
	}
}
