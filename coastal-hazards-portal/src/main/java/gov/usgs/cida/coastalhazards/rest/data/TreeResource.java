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
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map.Entry;
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
		Response response = null;
		JsonParser parser = new JsonParser();
		JsonElement parsed = null;
		try {
			parsed = parser.parse(content);
			JsonObject jsonObj = (JsonObject) parsed;

			if (jsonObj.has("children")) {
				JsonArray childrenArray = (JsonArray) jsonObj.get("children");

				try (ItemManager manager = new ItemManager()) {
					Item item = manager.load(id);
					List<Item> children = new LinkedList<>();
					Iterator<JsonElement> iterator = childrenArray.iterator();
					while (iterator.hasNext()) {
						String childId = iterator.next().getAsString();
						Item child = manager.load(childId);
						children.add(child);
					}
					item.setChildren(children);
					manager.merge(item);

					try (StatusManager statusMan = new StatusManager(); ThumbnailManager thumbMan = new ThumbnailManager()) {
						Status status = new Status();
						status.setStatusName(Status.StatusName.STRUCTURE_UPDATE);
						statusMan.save(status);

						thumbMan.updateDirtyBits(id);
					}
				}
				response = Response.ok().build();

			} else {
				log.error("Incoming JSON Object {} has no children", content);
				throw new BadRequestException();
			}
		} catch (JsonSyntaxException ex) {
			log.error("Could not parse incoming content: {}", content, ex);
			throw new BadRequestException();
		}

		return response;
	}

	@POST
	@Path("/item")
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response updateChildrenBulk(@Context HttpServletRequest request, String content) {
		Response response = null;
		JsonParser parser = new JsonParser();
		JsonElement parsed = parser.parse(content);
		try {
			parsed = parser.parse(content);
			JsonObject jsonObj = (JsonObject) parsed;

			if (jsonObj.has("children")) {
				try (ItemManager manager = new ItemManager()) {
					List<Item> itemList = new LinkedList<>();
					for (Entry<String, JsonElement> entry : jsonObj.entrySet()) {

						boolean success = updateItemChildren(entry.getKey(), (JsonObject) entry.getValue());

						Item parentItem = manager.load(entry.getKey());
						JsonObject obj = (JsonObject) entry.getValue();
						List<Item> children = new LinkedList<>();

						// Update the item's children
						if (obj.has("children")) {
							Iterator<JsonElement> iterator = obj.get("children").getAsJsonArray().iterator();
							while (iterator.hasNext()) {
								String childId = iterator.next().getAsString();
								Item child = manager.load(childId);
								children.add(child);
							}
							parentItem.setChildren(children);
						}

						// Update the displayedChildren
						if (obj.has("displayedChildren")) {
							Iterator<JsonElement> iterator = obj.get("displayedChildren").getAsJsonArray().iterator();
							List<String> displayedChildren = new ArrayList<>();
							while (iterator.hasNext()) {
								String childId = iterator.next().getAsString();
								displayedChildren.add(childId);
							}
							parentItem.setDisplayedChildren(displayedChildren);
						}

						itemList.add(parentItem);

						try (ThumbnailManager thumbMan = new ThumbnailManager()) {
							thumbMan.updateDirtyBits(parentItem.getId());
						}
					}
					manager.mergeAll(itemList);

					try (StatusManager statusMan = new StatusManager()) {
						Status status = new Status();
						status.setStatusName(Status.StatusName.STRUCTURE_UPDATE);
						statusMan.save(status);
					}
				}
			} else {
				log.error("Incoming JSON Object {} has no children", content);
				throw new BadRequestException();
			}
		} catch (JsonSyntaxException ex) {
			log.error("Could not parse incoming content: {}", content, ex);
			throw new BadRequestException();
		}
		if (parsed instanceof JsonObject) {
			JsonObject jsonObj = (JsonObject) parsed;

			response = Response.ok().build();
		}
		return response;
	}

	/**
	 *
	 * @param itemId
	 * @param updateData
	 * @return
	 */
	boolean updateItemChildren(String itemId, JsonObject updateData) {
		boolean success = false;

		if (updateData.has("children")) {
			try (ItemManager manager = new ItemManager()) {
				List<Item> itemList = new LinkedList<>();
				Item parentItem = manager.load(itemId);
				List<Item> children = new LinkedList<>();

				// Update the item's children
				if (updateData.has("children")) {
					Iterator<JsonElement> iterator = updateData.get("children").getAsJsonArray().iterator();
					while (iterator.hasNext()) {
						String childId = iterator.next().getAsString();
						Item child = manager.load(childId);
						children.add(child);
					}
					parentItem.setChildren(children);
				}

				// Update the displayedChildren
				if (updateData.has("displayedChildren")) {
					Iterator<JsonElement> iterator = updateData.get("displayedChildren").getAsJsonArray().iterator();
					List<String> displayedChildren = new ArrayList<>();
					while (iterator.hasNext()) {
						String childId = iterator.next().getAsString();
						displayedChildren.add(childId);
					}
					parentItem.setDisplayedChildren(displayedChildren);
				}

				itemList.add(parentItem);

				try (ThumbnailManager thumbMan = new ThumbnailManager()) {
					thumbMan.updateDirtyBits(parentItem.getId());
				}
				success = manager.mergeAll(itemList);

				try (StatusManager statusMan = new StatusManager()) {
					Status status = new Status();
					status.setStatusName(Status.StatusName.STRUCTURE_UPDATE);
					statusMan.save(status);
				}
			}
		} else {
			log.error("Incoming JSON Object {} has no children");
			throw new BadRequestException();
		}

		return success;
	}

}
