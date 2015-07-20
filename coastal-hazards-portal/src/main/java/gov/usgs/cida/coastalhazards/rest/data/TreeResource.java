package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import gov.usgs.cida.coastalhazards.exception.BadRequestException;
import gov.usgs.cida.coastalhazards.gson.adapter.ItemTreeAdapter;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.jpa.StatusManager;
import gov.usgs.cida.coastalhazards.jpa.ThumbnailManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.util.Status;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.TREE_PATH)
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class TreeResource {

	private static final Logger log = LoggerFactory.getLogger(TreeResource.class);

	@GET
	@Path("/item")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getRootTrees(@Context Request request) {
		Response response = null;
		try (ItemManager itemManager = new ItemManager()) {
			List<Item> items = itemManager.loadRootItems();
			Gson treeGson = new GsonBuilder().registerTypeAdapter(Item.class, new ItemTreeAdapter()).create();
			JsonObject root = new JsonObject();
			JsonArray rootItems = new JsonArray();

			for (Item item : items) {
				rootItems.add(treeGson.toJsonTree(item));
			}

			root.add("items", rootItems);
			response = Response.ok(root.toString(), MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}

	@GET
	@Path("/item/orphans")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getOrphans(@Context Request request) {
		Response response = null;
		try (ItemManager itemManager = new ItemManager()) {
			List<Item> items = itemManager.loadRootItems();
			Gson treeGson = new GsonBuilder().registerTypeAdapter(Item.class, new ItemTreeAdapter()).create();
			JsonObject root = new JsonObject();
			JsonArray orphans = new JsonArray();

			for (Item item : items) {
				if (!item.getId().equals(Item.UBER_ID)) {
					orphans.add(treeGson.toJsonTree(item));
				}
			}

			root.add("items", orphans);
			response = Response.ok(root.toString(), MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}

	@GET
	@Path("/item/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getTree(@PathParam("id") String id, @Context Request request) {
		Response response = null;
		Item item = null;
		try (ItemManager itemManager = new ItemManager()) {
			item = itemManager.load(id);
		}

		if (item == null) {
			throw new NotFoundException();
		} else {
			Gson treeGson = new GsonBuilder().registerTypeAdapter(Item.class, new ItemTreeAdapter()).create();
			String jsonResult = treeGson.toJson(item);
			response = Response.ok(jsonResult, MediaType.APPLICATION_JSON_TYPE).build();
		}

		return response;
	}

	@PUT
	@Path("/item/{id}")
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response updateChildren(@Context HttpServletRequest request, @PathParam("id") String id, String content) {
		Response response;
		if (StringUtils.isNotBlank(id) && StringUtils.isNotBlank(content)) {
			try {
				JsonObject jsonObj = (JsonObject) new JsonParser().parse(content);
				Map<String, JsonObject> itemMap = new HashMap<>(1);
				itemMap.put(id, jsonObj);

				if (updateItemChildren(itemMap)) {
					response = Response.ok().build();
				} else {
					response = Response.serverError().build();
				}

			} catch (JsonSyntaxException ex) {
				log.error("Could not parse incoming content: {}", content, ex);
				response = Response.status(Response.Status.BAD_REQUEST).build();
			}
		} else {
			log.error("Incoming ID or content was empty");
			response = Response.status(Response.Status.BAD_REQUEST).build();
		}

		return response;
	}

	@POST
	@Path("/item")
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response updateChildrenBulk(@Context HttpServletRequest request, String content) {
		Response response;
		if (StringUtils.isNotBlank(content)) {
			try {
				JsonObject jsonObj = (JsonObject) new JsonParser().parse(content);
				
				Set<Entry<String, JsonElement>> entrySet = jsonObj.entrySet();
				int itemCount = entrySet.size();
				if (itemCount > 0) {
					// Create the map that the updating function expects 
					Map<String, JsonObject> itemMap = new HashMap<>();
					for (Entry<String, JsonElement> entry : entrySet) {
						itemMap.put(entry.getKey(), (JsonObject) entry.getValue());
					}

					// Now that I have the map, update the items
					if (updateItemChildren(itemMap)) {
						response = Response.ok().build();
					} else {
						response = Response.serverError().build();
					}
				} else {
					log.error("Incoming content had no items");
					response = Response.status(Response.Status.BAD_REQUEST).build();
				}

			} catch (JsonSyntaxException ex) {
				log.error("Could not parse incoming content: {}", content, ex);
				response = Response.status(Response.Status.BAD_REQUEST).build();
			}
		} else {
			log.error("Incoming content was empty");
			response = Response.status(Response.Status.BAD_REQUEST).build();
		}

		return response;
	}

	/**
	 * Updates one or more items for children and displayed children
	 *
	 * @return whether items were updated in the database or not
	 */
	private boolean updateItemChildren(Map<String, JsonObject> items) {
		List<Item> itemList = new LinkedList<>();
		boolean updated = false;
		for (Entry<String, JsonObject> entry : items.entrySet()) {
			String itemId = entry.getKey();
			JsonObject updateData = entry.getValue();
			if (updateData.has("children")) {
				Item parentItem;
				List<Item> children;
				try (ItemManager manager = new ItemManager()) {
					parentItem = manager.load(itemId);
					children = new LinkedList<>();

					// Update the item's children
					Iterator<JsonElement> iterator = updateData.get("children").getAsJsonArray().iterator();
					while (iterator.hasNext()) {
						String childId = iterator.next().getAsString();
						Item child = manager.load(childId);
						children.add(child);
					}
					parentItem.setChildren(children);

					// Update the item's displayedChildren
					if (updateData.has("displayedChildren")) {
						Iterator<JsonElement> displayedIterator = updateData.get("displayedChildren").getAsJsonArray().iterator();
						List<String> displayedChildren = new ArrayList<>();
						while (displayedIterator.hasNext()) {
							String childId = displayedIterator.next().getAsString();
							displayedChildren.add(childId);
						}
						parentItem.setDisplayedChildren(displayedChildren);
					}
				}
				itemList.add(parentItem);

			} else {
				log.error("Incoming JSON Object {} has no children");
				throw new BadRequestException();
			}
		}

		// Updating the Items list complete. Now it's time to update that list
		// in the database
		if (!itemList.isEmpty()) {
			
			// Update the children
			try (ItemManager manager = new ItemManager()) {
				updated = manager.mergeAll(itemList);
			}

			if (updated) {
				log.info("Updated {} items", itemList.size());
				// Update the thumbnails
				try (ThumbnailManager thumbMan = new ThumbnailManager()) {
					for (Item item : itemList) {
						thumbMan.updateDirtyBits(item.getId());
					}
					log.debug("Updated thumbs for {} items", itemList.size());
				}

				// Update the status manager
				try (StatusManager statusMan = new StatusManager()) {
					Status status = new Status();
					status.setStatusName(Status.StatusName.STRUCTURE_UPDATE);
					if (statusMan.save(status)) {
						log.debug("Status Manager updated structure status after items were updated.");
					} else {
						log.warn("Status Manager did not update the structure status after updating items. This could lead to inconsistencies in the data");
					}
				}
			} else {
				log.warn("Could not update {} items.", itemList.size());
			}
		}

		return updated;
	}

}
