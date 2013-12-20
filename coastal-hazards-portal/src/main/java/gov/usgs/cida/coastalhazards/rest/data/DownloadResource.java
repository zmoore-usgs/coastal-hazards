package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.download.DownloadManager;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.jpa.SessionManager;
import gov.usgs.cida.coastalhazards.model.Session;
import gov.usgs.cida.coastalhazards.session.io.SessionIOException;
import java.io.File;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.ConcurrentModificationException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("download")
public class DownloadResource {
    
    private static final ItemManager itemManager = new ItemManager();
    private static final SessionManager sessionManager = new SessionManager();

    /**
	 * Retrieves representation of an instance of gov.usgs.cida.coastalhazards.model.Item
	 *
	 * @param id identifier of requested item
	 * @return JSON representation of the item(s)
	 */
	@GET
	@Path("item/{id}")
    @Produces("application/zip")
	public Response getCard(@PathParam("id") String id) throws IOException {
        Item item = itemManager.loadItem(id);
        
        File stagingDir = DownloadManager.createDownloadStagingArea();
        DownloadManager.stageItemDownload(item, stagingDir);
        File zipFile = DownloadManager.zipStagingAreaForDownload(stagingDir);
        
		Response response = Response.ok(zipFile, "application/zip").build();
		return response;
	}
    
    /**
	 * Retrieves representation of an instance of gov.usgs.cida.coastalhazards.model.Item
	 *
	 * @param id identifier of requested item
	 * @return JSON representation of the item(s)
	 */
	@GET
	@Path("view/{id}")
    @Produces("application/zip")
	public Response getSession(@PathParam("id") String id) throws IOException {
        Response response = null;
        try {
            String sessionJSON = sessionManager.load(id);
            Session session = Session.fromJSON(sessionJSON);
            File stagingDir = DownloadManager.createDownloadStagingArea();
            DownloadManager.stageSessionDownload(session, stagingDir);
            File zipFile = DownloadManager.zipStagingAreaForDownload(stagingDir);
            response = Response.ok(zipFile, "application/zip").build();
        } catch (NoSuchAlgorithmException | SessionIOException ex) {
            response = Response.serverError().entity(ex).build();
        }
		return response;
	}
    
}
