package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import gov.usgs.cida.coastalhazards.exception.BadRequestException;
import gov.usgs.cida.coastalhazards.gson.adapter.ItemTreeAdapter;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;

import javax.ws.rs.NotFoundException;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map.Entry;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("/tree")
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class TreeResource {

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

			root.add("rootItems", rootItems);
			response = Response.ok(root.toString(), MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}

	@GET
	@Path("/item/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getTree(@PathParam("id") String id, @Context Request request) {
		Response response = null;
		try (ItemManager itemManager = new ItemManager()) {
			Item item = itemManager.load(id);
			if (item == null) {
				throw new NotFoundException();
			}
			else {
				Gson treeGson = new GsonBuilder().registerTypeAdapter(Item.class, new ItemTreeAdapter()).create();
				String jsonResult = treeGson.toJson(item);
				response = Response.ok(jsonResult, MediaType.APPLICATION_JSON_TYPE).build();
			}
		}
		return response;
	}

    @RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CIDA_AUTHORIZED_ROLE})
	@PUT
	@Path("/item/{id}")
	public Response updateChildren(@Context HttpServletRequest request, @PathParam("id") String id, String content) {
		Response response = null;
		JsonParser parser = new JsonParser();
		JsonElement parsed = parser.parse(content);
		if (parsed instanceof JsonObject) {
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
				}
				response = Response.ok().build();
			}
			else {
				throw new BadRequestException();
			}
		}
		else {
			throw new BadRequestException();
		}
		return response;
	}

    @RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CIDA_AUTHORIZED_ROLE})
	@POST
	@Path("/item")
	public Response updateChildrenBulk(@Context HttpServletRequest request, String content) {
		Response response = null;
		JsonParser parser = new JsonParser();
		JsonElement parsed = parser.parse(content);
		if (parsed instanceof JsonObject) {
			JsonObject jsonObj = (JsonObject) parsed;

			try (ItemManager manager = new ItemManager()) {
				List<Item> itemList = new LinkedList<>();
				for (Entry<String, JsonElement> entry : jsonObj.entrySet()) {
					Item parentItem = manager.load(entry.getKey());
					List<Item> children = new LinkedList<>();
					Iterator<JsonElement> iterator = ((JsonArray) entry.getValue()).iterator();
					while (iterator.hasNext()) {
						String childId = iterator.next().getAsString();
						Item child = manager.load(childId);
						children.add(child);
					}
					parentItem.setChildren(children);
					itemList.add(parentItem);
				}
				manager.persistAll(itemList);
			}
			response = Response.ok().build();
		}
		return response;
	}

}
