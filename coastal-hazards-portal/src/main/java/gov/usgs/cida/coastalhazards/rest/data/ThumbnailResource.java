package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.ThumbnailManager;
import gov.usgs.cida.coastalhazards.model.Thumbnail;
import gov.usgs.cida.coastalhazards.rest.security.ConfiguredRolesAllowed;
import gov.usgs.cida.coastalhazards.rest.security.ConfiguredRolesAllowedDynamicFeature;
import gov.usgs.cida.utilities.HTTPCachingUtil;
import java.io.InputStream;
import java.util.List;
import javax.annotation.security.PermitAll;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
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
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.THUMBNAIL_PATH)
@PermitAll
public class ThumbnailResource {

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getList(@QueryParam("dirty") @DefaultValue("false") boolean dirty) {
		Response response = null;
		try (ThumbnailManager manager = new ThumbnailManager()) {
			List<Thumbnail> thumbnails = manager.loadAll(dirty);
			Gson gson = GsonUtil.getDefault();
			response = Response.ok(gson.toJson(thumbnails, List.class), MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}

	@GET
	@Path("/item/{id}")
	@Produces(Thumbnail.MIME_TYPE)
	public Response getImage(@PathParam("id") String id, @Context Request request) {
		Response response = null;
		try (ThumbnailManager manager = new ThumbnailManager()) {
			Thumbnail thumb = manager.load(id);
			if (thumb != null) {
				Response modified = HTTPCachingUtil.checkModified(request, thumb);
				if (modified != null) {
					response = modified;
				} else {
					InputStream image = manager.loadStream(thumb);
					if (image != null) {
						response = Response.ok(image, Thumbnail.MIME_TYPE).lastModified(thumb.getLastModified()).build();
					} else {
						throw new NotFoundException();
					}
				}
			} else {
				throw new NotFoundException();
			}
		}
		return response;
	}

	@PUT
	@Path("/item/{id}")
	@Consumes(MediaType.TEXT_PLAIN)
	@Produces(MediaType.APPLICATION_JSON)
	@ConfiguredRolesAllowed(ConfiguredRolesAllowedDynamicFeature.CCH_ADMIN_USER_PROP)
	public Response putImage(@PathParam("id") String id, String content, @Context HttpServletRequest request) {
		Response response = null;
		Thumbnail thumb = new Thumbnail();
		thumb.setItemId(id);
		thumb.setImage(content);
		thumb.setDirty(false);
		try (ThumbnailManager manager = new ThumbnailManager()) {
			response = Response.ok(manager.save(thumb), MediaType.APPLICATION_JSON_TYPE).build();
			manager.updateDirtyBits(id);
		}
		return response;
	}
}
