package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.download.DownloadManager;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import java.io.File;
import java.io.IOException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("download")
public class DownloadResource {
    
    private static ItemManager itemManager = new ItemManager();

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
        Item item = itemManager.loadItem(id, true);
        
        File stagingDir = DownloadManager.createDownloadStagingArea();
        DownloadManager.stageItemDownload(item, stagingDir);
        File zipFile = DownloadManager.zipStagingAreaForDownload(stagingDir);
        
		Response response = Response.ok(zipFile, "application/zip").build();
		return response;
	}
    
}
