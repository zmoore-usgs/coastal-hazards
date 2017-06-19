package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.exception.BadRequestException;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.AliasManager;
import gov.usgs.cida.coastalhazards.model.Alias;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.utilities.HTTPCachingUtil;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
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
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAlias(@PathParam("id") String id) {
		Response response = null;
		try (AliasManager manager = new AliasManager()) {
			Alias alias = manager.load(id);
			Gson gson = GsonUtil.getDefault();
			response = Response.ok(gson.toJson(alias), MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}
	
	@GET
	@Path("/item/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAliasForItem(@PathParam("id") String itemId) {
		Response response = null;
		try (AliasManager manager = new AliasManager()) {
			Alias alias = manager.getAliasForItemId(itemId);
			Gson gson = GsonUtil.getDefault();
			response = Response.ok(gson.toJson(alias), MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}
	
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response postItem(String content, @Context HttpServletRequest request) {
		Response response;
		Alias alias = Alias.fromJSON(content);
		
		String aliasId;
		
		try (AliasManager aliasManager = new AliasManager()) {
			aliasId = aliasManager.save(alias);
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
	@Path("/{id}")
	@Consumes(MediaType.TEXT_PLAIN)
	@Produces(MediaType.APPLICATION_JSON)
	public Response updateAlias(@PathParam("id") String id, String content, @Context HttpServletRequest request) {
		Response response = null;
		try (AliasManager manager = new AliasManager()) {
			Alias alias = manager.load(id);
			Gson gson = GsonUtil.getDefault();
			response = Response.ok(gson.toJson(alias), MediaType.APPLICATION_JSON_TYPE).build();
		}
		
		return response;
	}
}
