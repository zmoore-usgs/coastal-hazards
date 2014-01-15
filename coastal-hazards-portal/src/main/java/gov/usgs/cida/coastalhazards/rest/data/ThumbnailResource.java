package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.jpa.ThumbnailManager;
import gov.usgs.cida.coastalhazards.model.Thumbnail;
import gov.usgs.cida.coastalhazards.rest.publish.PublishResource;
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
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("thumbnail/item")
public class ThumbnailResource {
    
    private static final ThumbnailManager thumbnailManager = new ThumbnailManager();

    @GET
    @Path("{id}")
    @Produces("image/png")
    public Response getImage(@PathParam("id") String id) {
        Response response = null;
        InputStream image = thumbnailManager.load(id);
        if (image != null) {
            response = Response.ok(image, "image/png").build();
        } else {
            response = Response.status(Status.NOT_FOUND).build();
        }
        return response;
    }
    
    @PUT
    @Path("{id}")
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.APPLICATION_JSON)
    public Response putImage(@PathParam("id") String id, String content, @Context HttpServletRequest request) {
        Response response = null;
        if (PublishResource.isValidSession(request)) {
            Thumbnail thumb = new Thumbnail();
            thumb.setItemId(id);
            thumb.setImage(content);
            response = Response.ok(thumbnailManager.save(thumb), MediaType.APPLICATION_JSON_TYPE).build();
        } else {
            response = Response.status(Status.FORBIDDEN).build();
        }
        
        return response;
    }
}
