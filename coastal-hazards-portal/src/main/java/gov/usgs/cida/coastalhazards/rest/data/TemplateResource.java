package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import gov.usgs.cida.coastalhazards.Attributes;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.AliasManager;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.jpa.LayerManager;
import gov.usgs.cida.coastalhazards.jpa.StatusManager;
import gov.usgs.cida.coastalhazards.model.Alias;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Layer;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.Item.ItemType;
import gov.usgs.cida.coastalhazards.model.Item.Type;
import gov.usgs.cida.coastalhazards.model.summary.Full;
import gov.usgs.cida.coastalhazards.model.summary.Publication;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.model.util.Status;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.coastalhazards.rest.data.util.StormUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.coastalhazards.util.ogc.OGCService;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import gov.usgs.cida.utilities.IdGenerator;
import gov.usgs.cida.utilities.WFSIntrospector;
import java.io.IOException;
import java.net.URISyntaxException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityNotFoundException;
import javax.persistence.PersistenceException;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.xml.parsers.ParserConfigurationException;
import jersey.repackaged.com.google.common.collect.Lists;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpStatus;
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

	@GET
	@Path("/item/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getTemplate(@PathParam("id") String id, @Context Request request) {
		return new ItemResource().getItem(id, false, request);
	}

	@POST
	@Path("/item/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response instantiateTemplate(@PathParam("id") String id, String content) {
		Response response = null;
		try (ItemManager itemMan = new ItemManager(); LayerManager layerMan = new LayerManager()) {
			Item template = itemMan.load(id);
			if (template.getItemType() != Item.ItemType.template) {
				throw new UnsupportedOperationException("Only template items may be instantiated");
			}

			List<Item> childItems = template.getChildren();
			List<Item> newItemList = null;
			List<Item> newAndOldList = null;
			List<Item> retainedItems = new LinkedList<>();
			List<String> displayed = new LinkedList<>();
			
			JsonParser parser = new JsonParser();
			JsonObject parsed = parser.parse(content).getAsJsonObject();
			// TODO only supporting one level for now, bring in aggs later
			boolean allAttributes = parseAllAttribute(parsed);
			boolean retainAggregations = retainAggregations(parsed);
			if (allAttributes) {
				JsonElement layer = parsed.get("layerId");
				if (layer != null) {
					String layerId = layer.getAsString();
					try {
						newItemList = makeItemsFromLayer(template, layerId, layerMan);
						retainedItems = findItemsToRetain(template, retainAggregations);
						newAndOldList = new LinkedList<>(retainedItems);
						newAndOldList.addAll(newItemList);
					} catch (IOException ex) {
						log.error("Cannot create items", ex);
					}
					for (Item retained : retainedItems) {
						displayed.add(retained.getId());
					}
					List<String> displayedIdByAttr = makeDisplayedChildren(newItemList);
					displayed.addAll(displayedIdByAttr);
				}
			} else {
				Map<String, Item> childMap = makeChildItemMap(childItems);
				JsonArray children = parsed.get("children").getAsJsonArray();
				newItemList = makeItemsFromDocument(template, children, childMap, itemMan, layerMan);
				List<String> visibleItems = visibleItems(children, newItemList, childMap);
				displayed.addAll(visibleItems);
				newAndOldList = newItemList;
			}
			
			itemMan.persistAll(newItemList);
			template.setChildren(newAndOldList);
			template.setDisplayedChildren(displayed);
			template.setSummary(gatherTemplateSummary(template.getSummary(), newItemList));
			String mergeId = itemMan.merge(template);
			if (mergeId == null) {
				response = Response.serverError().build();
			} else {
				response = Response.ok().build();
				
				try (StatusManager statusMan = new StatusManager();) {
					Status status = new Status();
					status.setStatusName(Status.StatusName.ITEM_UPDATE);
					statusMan.save(status);
				}
			}
		}
		return response;
	}

	/**
	 * Update an alias to point to an item. If the Alias did not exist,
	 * create it and point it to the item.
	 * @param alias
	 * @param aliasMan
	 * @param templateId the new templateId to associate the Alias with
	 * @return the original templateId, or null if no Alias existed
	 */
	protected String updateStormAlias(String alias, AliasManager aliasMan, String templateId) {
		if (StringUtils.isEmpty(alias)) {
			throw new IllegalArgumentException(String.format("Alias cannot be empty. Got %s", alias));
		} else {
			Alias fullAlias = aliasMan.load(alias);
			String originalTemplateId = null;
			if (fullAlias == null) {
				fullAlias = new Alias();
				fullAlias.setId(alias);
				fullAlias.setItemId(templateId);
				aliasMan.save(fullAlias);
			} else {
				originalTemplateId = fullAlias.getItemId();
				fullAlias.setItemId(templateId);
				aliasMan.update(fullAlias);
			}
			return originalTemplateId;
		}
	}
	
	protected Response instantiateStormAndHandleResponse(String templateId, String childJson, String alias, boolean active, AliasManager aliasMan, ItemManager itemMan){
		Response response;
		if (StringUtils.isEmpty(templateId)) {
			//this is the server's fault rather than the client's
			response = Response.status(500).build();
		} else {
			response = instantiateTemplate(templateId, childJson);

			if (response.getStatus() == HttpStatus.SC_OK) {
				if (active) {
					hoistNewTemplateToTopLevel(templateId, itemMan);
				}
				if (!StringUtils.isEmpty(alias)) {
					String originalTemplateId = updateStormAlias(alias, aliasMan, templateId);
					if (active) {
						//only orphan the item the alias initially pointed to if the new storm is active
						orphanOriginalStormTemplate(originalTemplateId, itemMan);
					}
				}
				
				Map<String, Object> ok = new HashMap<String, Object>() {
					private static final long serialVersionUID = 2398472L;
					{
						put("id", templateId);
					}
				};
				String responseText = GsonUtil.getDefault().toJson(ok, HashMap.class);
				response = Response.ok(responseText, MediaType.APPLICATION_JSON_TYPE).build();
			}
		}
		return response;
	}
	
	protected void hoistNewTemplateToTopLevel(String newTemplateId, ItemManager itemMan) {
		boolean success = itemMan.hoistItemToTopLevel(newTemplateId);
		if (!success) {
			throw new PersistenceException(String.format(
				"Could not hoist item with ID '%s'",
				newTemplateId
			));
		}
	}
	
	protected void orphanOriginalStormTemplate(String originalTemplateId, ItemManager itemMan) {
		//can only orphan the original if there was an original
		if (!StringUtils.isEmpty(originalTemplateId)) {
			Item originalTemplate = itemMan.load(originalTemplateId);
			if (null == originalTemplate) {
				throw new EntityNotFoundException(String.format(
					"Could not find template with ID '%s'. "
					+ "Perhaps the template Item was deleted "
					+ "between the time it was persisted and the time it was read?",
					originalTemplateId));
			} else {
				//only orphan original template if it was a storm template
				if (Type.storms.equals(originalTemplate.getType())) {
					boolean success = itemMan.orphan(originalTemplate);
					if (!success) {
						throw new PersistenceException(
							String.format(
								"Could not orphan template with ID '%s'",
								originalTemplateId
							)
						);
					}
				}
			}
		}
	}
	
	protected List<Service> getCopyOfServices(Layer layer) {
		List<Service> copies = layer.getServices().stream().map(
			(s) -> Service.copyValues(s, new Service())
		).collect(Collectors.toList());
		return copies;
	}
	
	@GET
	@Path("/storm")
	@Produces(MediaType.APPLICATION_JSON)
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response instantiateStormTemplate(@QueryParam("layerId") String layerId, @QueryParam("activeStorm") String active, @QueryParam("alias") String alias, @QueryParam("copyType") String copyType, @QueryParam("copyVal") String copyVal, @QueryParam("trackId") String trackId) {
		Response response;
		//validate parameters
		if (StringUtils.isEmpty(layerId) || StringUtils.isEmpty(active)) {
			response = Response.status(400).build();
			log.error("The client failed to specify values for layerId ({}) or active ({}).", layerId, active);
		} else {
			try (
				ItemManager itemMan = new ItemManager();
				LayerManager layerMan = new LayerManager();
				AliasManager aliasMan = new AliasManager()
			) {
				boolean isActive = Boolean.parseBoolean(active);
				Layer layer = layerMan.load(layerId);
				Gson gson = GsonUtil.getDefault();
				String childJson = gson.toJson(StormUtil.createStormChildMap(layerId, isActive, trackId));
				
				//validate that objects could be loaded/constructed based on the parameters to the web service
				if (null == layer || StringUtils.isEmpty(childJson)) {
					//probably the client's fault
					response = Response.status(400).build();
				} else {
					Summary summary;

					if ("item".equalsIgnoreCase(copyType) || "alias".equalsIgnoreCase(copyType)) {
						summary = copyExistingSummary(copyType, copyVal, itemMan, aliasMan);
					} else {
						summary = StormUtil.buildStormTemplateSummary(layer);
					}

					if (null == summary) {
						response = Response.status(400).build();
					} else {
						List<Service> serviceCopies = getCopyOfServices(layer);
						Item baseTemplate = baseTemplateItem(Boolean.parseBoolean(active), layer.getBbox(), serviceCopies, summary);
						String templateId = itemMan.persist(baseTemplate);
						response = instantiateStormAndHandleResponse(templateId, childJson, alias, isActive, aliasMan, itemMan);
					}
				}
			} catch (Exception e) {
				log.error(e.toString());
				response = Response.status(500).build();
			}
		}
		return response;
	}

	private Item baseTemplateItem(boolean active, Bbox bbox, List<Service> serviceCopies, Summary summary) {
		Item baseTemplate = new Item();
		baseTemplate.setType(Type.storms);
		baseTemplate.setRibbonable(true);
		baseTemplate.setShowChildren(true);
		baseTemplate.setName("storm_" + (new SimpleDateFormat("yyyyMMddHHmm").format(Date.from(Instant.now()))));
		baseTemplate.setId(IdGenerator.generate());
		baseTemplate.setItemType(ItemType.template);
		baseTemplate.setActiveStorm(active);
		baseTemplate.setBbox(Bbox.copyValues(bbox, new Bbox()));
		baseTemplate.setServices(serviceCopies);
		baseTemplate.setSummary(summary);

		return baseTemplate;
	}

	private Summary copyExistingSummary(String copyType, String copyVal, ItemManager itemMan, AliasManager aliasMan) {
		Summary newSummary = null;
		Item summaryItem = null;

		if ("item".equalsIgnoreCase(copyType)) {
			summaryItem = itemMan.load(copyVal);
		} else if ("alias".equalsIgnoreCase(copyType)) {
			summaryItem = itemMan.load(aliasMan.load(copyVal).getItemId());
		} else {
			log.error("Attempted to copy existing summary from invalid copy type: " + copyType);
		}

		if(summaryItem == null) {
			log.error("Item provided to copy summary from (" + copyType + " | " + copyVal + ") could not be loaded.");
		} else {
			newSummary = Summary.copyValues(summaryItem.getSummary(), new Summary());
		}

		return newSummary;
	}
	
	private boolean parseAllAttribute(JsonObject parent) {
		boolean result = false;
		JsonElement allAttributes = parent.get("allAttributes");
		if (allAttributes != null) {
			result = allAttributes.getAsBoolean();
		}
		return result;
	}
	
	private boolean retainAggregations(JsonObject parent) {
		boolean result = false;
		JsonElement retainAggregations = parent.get("retainAggregations");
		if (retainAggregations != null) {
			result = retainAggregations.getAsBoolean();
		}
		return result;
	}
	
	private List<Item> makeItemsFromDocument(Item template, JsonArray children, Map<String, Item> childMap, ItemManager itemMan, LayerManager layerMan) {
		Iterator<JsonElement> iterator = children.iterator();

		while (iterator.hasNext()) {
			
			String attr = "";
			Layer layer;

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
				Summary summary = makeSummary(layer, attr);
				Item newItem = templateItem(template, attr, layer, summary);
				if (replaceId == null) {
					replaceId = newItem.getId();
				}
				childMap.put(replaceId, newItem);
			} else if (childId != null) {
				String retainedChildId = childId.getAsString();
				Item retainedChild = itemMan.load(retainedChildId);
				if (retainedChild != null) {
					childMap.put(retainedChildId, retainedChild);
				}
			} else {
				throw new BadRequestException("Must specify childId if not including layerId");
			}
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
		log.debug("cswService {}", cswService);
		String cswEndpoint = cswService.getEndpoint();
		log.debug("cswEndpoint {}", cswEndpoint);
		String summaryJson = null;
		try {
			summaryJson = MetadataUtil.getSummaryFromWPS(cswEndpoint, attr);
			log.debug("summaryJsonMetadataUtil {}", summaryJson);
		} catch (IOException | ParserConfigurationException | SAXException | URISyntaxException ex) {
			log.error("Problem getting summary from item", ex);
		}
		Gson gson = GsonUtil.getDefault();
		log.debug(String.valueOf(gson));
		Summary summary = gson.fromJson(summaryJson, Summary.class);
		log.debug(String.valueOf(summary));
		return summary;
	}
	
	private Map<String, Item> makeChildItemMap(List<Item> children) {
		Map<String, Item> result = new LinkedHashMap<>(0);
		if (children != null) {
			 result = new LinkedHashMap<>(children.size());
			for (Item item : children) {
				result.put(item.getId(), item);
			}
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
		String newKeywords = StringUtils.join(keywordSet, "|");
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

	private List<Item> findItemsToRetain(Item template, boolean retainAggregations) {
		List<Item> items = new LinkedList<>();
		if (retainAggregations) {
			List<Item> children = template.getChildren();
			if (children != null) {
				for (Item child : children) {
					if (child.getItemType() == Item.ItemType.aggregation ||
							child.getItemType() == Item.ItemType.template) {
						items.add(child);
					}
				}
			}
		}
		return items;
	}

	private List<String> visibleItems(JsonArray children, List<Item> items, Map<String, Item> existing) {
		List<String> visibleChildren = new LinkedList<>();
		Iterator<JsonElement> iterator = children.iterator();

		while (iterator.hasNext()) {
			JsonObject child = iterator.next().getAsJsonObject();
			JsonElement childId = child.get("id");
			JsonElement attrElement = child.get("attr");
			JsonElement visibleElement = child.get("visible");
			String visibleId = "";
			if (childId != null) {
				String specified = childId.getAsString();
				if (existing.containsKey(specified)) {
					visibleId = existing.get(specified).getId();
				} else {
					visibleId = specified;
				}
			} else if (attrElement != null) {
				String attr = attrElement.getAsString();
				for (Item item : items) {
					String existingAttr = item.getAttr();
					if (null != existingAttr && attr.equals(existingAttr)) {
						visibleId = item.getId();
					}
				}
			}
			if (visibleElement != null && StringUtils.isNotBlank(visibleId)) {
				boolean visible = visibleElement.getAsBoolean();
				if (visible) {
					visibleChildren.add(visibleId);
				}
			}
		}
		return visibleChildren;
	}

}
