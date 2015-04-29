package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.download.DownloadUtility;
import gov.usgs.cida.coastalhazards.exception.DownloadStagingUnsuccessfulException;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.DownloadManager;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.jpa.SessionManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Session;
import gov.usgs.cida.coastalhazards.model.util.Download;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HEAD;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.DOWNLOAD_PATH)
@PermitAll
public class DownloadResource {

	private static final Logger log = LoggerFactory.getLogger(DownloadResource.class);

	private static final SessionManager sessionManager = new SessionManager();

	@HEAD
	@Path("/item/{id}")
	public Response checkItemAvailability(@PathParam("id") String id) throws IOException {
		Response response;

		try (ItemManager itemManager = new ItemManager(); DownloadManager downloadManager = new DownloadManager()) {
			Item item = itemManager.load(id);
			if (item == null) {
				response = Response.status(404).build();
			} else {
				Download download = downloadManager.load(id);
				if (download != null && download.getPersistanceURI() != null) {
					response = Response.status(200).build();
				} else {
					DownloadUtility.stageAsyncItemDownload(id);
					response = Response.status(202).build();
				}
			}
		}

		return response;
	}

	/**
	 * Downloads a zip file containing the contents of
	 * gov.usgs.cida.coastalhazards.model.Item
	 *
	 * @param id identifier of requested item
	 * @return JSON representation of the item(s)
	 * @throws java.io.IOException
	 * @throws java.lang.InterruptedException
	 * @throws java.util.concurrent.ExecutionException
	 */
	@GET
	@Path("/item/{id}")
	@Produces("application/zip")
	public Response downloadItem(@PathParam("id") String id) throws IOException, InterruptedException, ExecutionException {
		Response response = null;
		try (ItemManager itemManager = new ItemManager(); DownloadManager downloadManager = new DownloadManager()) {
			Item item = itemManager.load(id);
			if (item == null) {
				throw new NotFoundException();
			} else {
				File zipFile = null;

				try {
					Download download = downloadManager.load(id);
					if (download != null && download.getPersistanceURI() != null) {
						// if we switch this to external file server or S3,
						// redirect to this uri as a url
						zipFile = download.fetchZipFile();
						if (zipFile == null || !zipFile.exists()) {
							throw new FileNotFoundException();
						}
					} else if (download != null) {
						response = Response.status(Response.Status.ACCEPTED).build();
					} else {
						Future<Download> future = DownloadUtility.stageAsyncItemDownload(id);
						download = future.get();
						if (download.isProblem()) {
							throw new DownloadStagingUnsuccessfulException();
						}
						zipFile = download.fetchZipFile();
					}
					if (zipFile != null) {
						String contentDisposition = "attachment; filename=\"" + id + ".zip\"";
						response = Response.ok(zipFile, "application/zip").header("Content-Disposition", contentDisposition).build();
					}
				} catch (URISyntaxException ex) {
					log.error("Problem getting persisted download", ex);
				}
			}
		}
		return response;
	}

	/**
	 * TODO this is in need of refactor to get it in line with item download
	 * Retrieves representation of an instance of
	 * gov.usgs.cida.coastalhazards.model.Item
	 *
	 * @param id identifier of requested item
	 * @return JSON representation of the item(s)
	 * @throws java.io.IOException
	 */
	@GET
	@Path("/view/{id}")
	@Produces("application/zip")
	public Response getSession(@PathParam("id") String id) throws IOException, NoSuchAlgorithmException {
		Response response = null;
		String sessionJSON = sessionManager.load(id);
		try (DownloadManager downloadManager = new DownloadManager()) {
			if (sessionJSON == null) {
				throw new NotFoundException();
			} else {

				File zipFile = null;
				Download download = null;
				try {
					download = downloadManager.load(id);
					if (download != null && download.getPersistanceURI() != null) {
						zipFile = new File(new URI(download.getPersistanceURI()));
						if (zipFile == null || !zipFile.exists()) {
							throw new FileNotFoundException();
						}
					} else {
						throw new FileNotFoundException();
					}
				} catch (FileNotFoundException | URISyntaxException ex) {
					Session session = Session.fromJSON(sessionJSON);
					File stagingDir = DownloadUtility.createDownloadStagingArea();
					boolean staged = DownloadUtility.stageSessionDownload(session, stagingDir);
					if (staged) {
						download = new Download();
						download = DownloadUtility.zipStagingAreaForDownload(stagingDir, download);
						download.setSessionId(id);
						try {
							zipFile = download.fetchZipFile();
						} catch (URISyntaxException ex2) {
							throw new DownloadStagingUnsuccessfulException();
						}
						downloadManager.save(download);
					} else {
						throw new DownloadStagingUnsuccessfulException();
					}
				}
				String contentDisposition = "attachment; filename=\"" + id + ".zip\"";
				response = Response.ok(zipFile, "application/zip").header("Content-Disposition", contentDisposition).build();
			}
		}
		return response;
	}

	@GET
	@Produces("application/json")
	public Response displayStagedItems() {
		String downloadJson = null;
		try (DownloadManager downloadManager = new DownloadManager()) {
			List<Download> allStagedDownloads = downloadManager.getAllStagedDownloads();
			Gson serializer = GsonUtil.getDefault();
			downloadJson = serializer.toJson(allStagedDownloads, ArrayList.class);
		}
		return Response.ok(downloadJson, MediaType.APPLICATION_JSON_TYPE).build();
	}

	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	@DELETE
	@Produces("application/json")
	@Path("/item/{id}")
	public Response deleteStagedItem(@PathParam("id") String itemId, @Context HttpServletRequest request) {
		Response response = null;
		try (DownloadManager downloadManager = new DownloadManager()) {
			Download download = downloadManager.load(itemId);
			boolean deleted = false;
			try {
				if (download == null) {
					throw new NotFoundException();
				}
				File stagingFolder = download.fetchZipFile().getParentFile();
				deleted = FileUtils.deleteQuietly(stagingFolder);
			} catch (URISyntaxException e) {
				throw new RuntimeException(e);
			}
			downloadManager.delete(download);
			response = Response.ok("{\"deleted\":\"" + deleted + "\"}", MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}

}
