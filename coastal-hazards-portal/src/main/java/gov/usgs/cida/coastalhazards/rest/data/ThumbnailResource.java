package gov.usgs.cida.coastalhazards.rest.data;

import com.sun.jersey.api.NotFoundException;
import gov.usgs.cida.coastalhazards.exception.UnauthorizedException;
import gov.usgs.cida.coastalhazards.jpa.ThumbnailManager;
import gov.usgs.cida.coastalhazards.model.Thumbnail;
import gov.usgs.cida.coastalhazards.oid.session.SessionResource;
import gov.usgs.cida.utilities.HTTPCachingUtil;
import java.io.InputStream;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
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
@Path("thumbnail/item")
public class ThumbnailResource {

    @GET
    @Path("{id}")
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
    @Path("{id}")
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.APPLICATION_JSON)
    public Response putImage(@PathParam("id") String id, String content, @Context HttpServletRequest request) {
        Response response = null;
        if (SessionResource.isValidSession(request)) {
            Thumbnail thumb = new Thumbnail();
            thumb.setItemId(id);
            thumb.setImage(content);
            try (ThumbnailManager manager = new ThumbnailManager()) {
                response = Response.ok(manager.save(thumb), MediaType.APPLICATION_JSON_TYPE).build();
            }
        } else {
            throw new UnauthorizedException();
        }
        
        return response;
    }
}
