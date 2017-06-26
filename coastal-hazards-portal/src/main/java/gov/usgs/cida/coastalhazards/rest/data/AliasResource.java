package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.exception.BadRequestException;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.AliasManager;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.jpa.StatusManager;
import gov.usgs.cida.coastalhazards.model.Alias;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.util.Status;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.utilities.HTTPCachingUtil;
import java.util.Date;
import java.util.List;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;

/**
 *
 * @author Zack Moore <zmoore@usgs.gov>
 */
@Path(DataURI.ALIAS_PATH)
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class AliasResource {
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAliasList(@PathParam("id") String id) {
		Response response = null;
		try (AliasManager manager = new AliasManager()) {
			List<Alias> aliases = manager.loadAll();
			Gson gson = GsonUtil.getDefault();
			
			if(aliases != null && aliases.size() > 0){
			    response = Response.ok(gson.toJson(aliases), MediaType.APPLICATION_JSON_TYPE).build();
			} else {
			    throw new NotFoundException();
			}
		}
		return response;
	}

	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAliasById(@PathParam("id") String id) {
		Response response = null;
		try (AliasManager manager = new AliasManager()) {
			Alias alias = manager.load(id);
			Gson gson = GsonUtil.getDefault();
			
			if(alias != null){
			    response = Response.ok(gson.toJson(alias), MediaType.APPLICATION_JSON_TYPE).build();
			} else {
			    throw new NotFoundException();
			}
		}
		return response;
	}
	
	@GET
	@Path("/item/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAliasesForItem(@PathParam("id") String itemId) {
		Response response = null;
		try (AliasManager manager = new AliasManager()) {
			List<Alias> aliasList = manager.getAliasesForItemId(itemId);
			Gson gson = GsonUtil.getDefault();
			response = Response.ok(gson.toJson(aliasList, List.class), MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}
	
	@GET
	@Path("/{id}/item")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getItemForAlias(@PathParam("id") String id,
			@DefaultValue("false") @QueryParam("subtree") boolean subtree,
			@Context Request request) {
		Response response = null;
		try (AliasManager aliasManager = new AliasManager();) {
			Alias alias = aliasManager.load(id);
			Item item = null;
			try (StatusManager statusMan = new StatusManager()) {
				try (ItemManager itemManager = new ItemManager()) {
					item = itemManager.load(alias.getItemId());
				}
				if (item == null) {
					throw new NotFoundException();
				} else {
					// Check when the item and/or structure was last modified, if at all.
					// - If both are null, use today's date. 
					// - If one of the two is not null, use that. 
					// - Else, if both are not null, use the latest between them.
					Status lastItemUpdate = statusMan.load(Status.StatusName.ITEM_UPDATE);
					Status lastStructureUpdate = statusMan.load(Status.StatusName.STRUCTURE_UPDATE);
					Date modified = new Date();
					if (lastItemUpdate != null && lastStructureUpdate != null) {
						// Both updates exist, so compare between them and choose the latest
						Date lastItemUpdateDate = lastItemUpdate.getLastUpdate();
						Date lastStructureUpdateDate = lastStructureUpdate.getLastUpdate();

						modified = lastItemUpdateDate.after(lastStructureUpdateDate) ? lastItemUpdateDate : lastStructureUpdateDate;
					} else {
						// At least one of the two do not exist, so find out if at 
						// least one exists and use that. 
						if (lastItemUpdate != null) {
							modified = lastItemUpdate.getLastUpdate();
						}
						if (lastStructureUpdate != null) {
							modified = lastStructureUpdate.getLastUpdate();
						}
					}

					Response unmodified = HTTPCachingUtil.checkModified(request, modified);
					if (unmodified != null) {
						response = unmodified;
					} else {
						String jsonResult = item.toJSON(subtree);
						response = Response.ok(jsonResult, MediaType.APPLICATION_JSON_TYPE).lastModified(modified).build();
					}
				}
			}			
		}
		return response;
	}
	
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	@DELETE
	@Path("/{id}")
	public Response deleteAlias(@Context HttpServletRequest request, @PathParam("id") String id) {
		Response response = null;
		try (AliasManager aliasManager = new AliasManager()) {
			if (aliasManager.delete(id)) {
				response = Response.ok().build();
			} else {
				throw new Error();
			}
		}
		return response;
	}
	
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	@DELETE
	@Path("/item/{id}")
	public Response deleteAliasesForItem(@Context HttpServletRequest request, @PathParam("id") String itemId) {
		Response response = null;
		try (AliasManager aliasManager = new AliasManager()) {			
			if (aliasManager.deleteAliasesForItemId(itemId)) {
				response = Response.ok().build();
			} else {
				throw new Error();
			}
		}
		return response;
	}
	
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response postAlias(String content, @Context HttpServletRequest request) {
		Response response;
		Alias alias = Alias.fromJSON(content);
		
		String aliasId;
		
		try (AliasManager aliasManager = new AliasManager()) {
			Alias savedAlias = aliasManager.load(alias.getId());
			
			if(savedAlias == null){
			    aliasId = aliasManager.save(alias);
			} else {
			    throw new BadRequestException();
			}
		}
		
		if (null == aliasId) {
			throw new BadRequestException();
		} else {
			response = Response.ok(GsonUtil.getDefault().toJson(alias, Alias.class), MediaType.APPLICATION_JSON_TYPE).build();
		}

		return response;
	}
	
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	@PUT
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response updateAlias(String content, @Context HttpServletRequest request) {
		Response response = null;
		Alias newAlias = Alias.fromJSON(content);
				
		response = updateAlias(newAlias.getId(), content, request);
		
		return response;
	}

	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	@PUT
	@Path("/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response updateAlias(@PathParam("id") String id, String content, @Context HttpServletRequest request) {
		Response response = null;
		Alias newAlias = Alias.fromJSON(content);
		
		try (AliasManager manager = new AliasManager()) {
			Alias alias = manager.load(id);

			if(alias != null){
			    alias.setItemId(newAlias.getItemId());
			    manager.update(alias);
			    response = Response.ok(GsonUtil.getDefault().toJson(alias, Alias.class), MediaType.APPLICATION_JSON_TYPE).build();
			} else {
			    throw new NotFoundException();
			}
		}
		
		return response;
	}
}
