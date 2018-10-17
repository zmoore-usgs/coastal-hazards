//package gov.usgs.cida.coastalhazards.rest.data;
//
//import com.google.gson.Gson;
//import gov.usgs.cida.coastalhazards.download.DownloadUtility;
//import gov.usgs.cida.coastalhazards.exception.DownloadStagingUnsuccessfulException;
//import gov.usgs.cida.coastalhazards.gson.GsonUtil;
//import gov.usgs.cida.coastalhazards.jpa.DownloadManager;
//import gov.usgs.cida.coastalhazards.jpa.ItemManager;
//import gov.usgs.cida.coastalhazards.jpa.SessionManager;
//import gov.usgs.cida.coastalhazards.model.Item;
//import gov.usgs.cida.coastalhazards.model.Session;
//import gov.usgs.cida.coastalhazards.model.util.Download;
//import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
//import gov.usgs.cida.coastalhazards.service.data.DownloadService;
//import java.io.File;
//import java.io.FileNotFoundException;
//import java.io.IOException;
//import java.net.URI;
//import java.net.URISyntaxException;
//import java.security.NoSuchAlgorithmException;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.concurrent.ExecutionException;
//import javax.annotation.security.PermitAll;
//import javax.annotation.security.RolesAllowed;
//import javax.servlet.http.HttpServletRequest;
//import javax.ws.rs.DELETE;
//import javax.ws.rs.GET;
//import javax.ws.rs.HEAD;
//import javax.ws.rs.NotFoundException;
//import javax.ws.rs.Path;
//import javax.ws.rs.PathParam;
//import javax.ws.rs.Produces;
//import javax.ws.rs.core.Context;
//import javax.ws.rs.core.MediaType;
//import javax.ws.rs.core.Response;
//import static javax.ws.rs.core.Response.Status.ACCEPTED;
//import static javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR;
//import static javax.ws.rs.core.Response.Status.NOT_FOUND;
//import static javax.ws.rs.core.Response.Status.NOT_IMPLEMENTED;
//import static javax.ws.rs.core.Response.Status.OK;
//import org.apache.commons.lang.StringUtils;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
///**
// *
// * @author Jordan Walker <jiwalker@usgs.gov>
// */
//@Path(DataURI.DOWNLOAD_PATH)
//@PermitAll
//public class DownloadResource {
//
//	private static final Logger LOG = LoggerFactory.getLogger(DownloadResource.class);
//
//	private static final SessionManager sessionManager = new SessionManager();
//
//	@HEAD
//	@Path("/item/{id}")
//	public Response checkItemAvailability(@PathParam("id") String id) throws IOException {
//		Response response;
//
//		Item item;
//		try (ItemManager itemManager = new ItemManager()) {
//			item = itemManager.load(id);
//		}
//
//		if (item == null) {
//			response = Response.status(NOT_FOUND).build();
//		} else {
//			Download download;
//
//			try (DownloadManager downloadManager = new DownloadManager()) {
//				download = downloadManager.load(id);
//			}
//
//			if (download != null) {
//				LOG.debug("Download manager found a download for item id {}", id);
//				String persistenceURI = download.getPersistanceURI();
//
//				// Check if the file location in the database 
//				// If it is null or blank, the download has been accepted
//				if (download.isProblem()) {
//					LOG.debug("Download manager found a problem with download for item id {}", id);
//					response = Response.status(INTERNAL_SERVER_ERROR).build();
//				} else if (StringUtils.isBlank(persistenceURI)) {
//					LOG.debug("Download manager found a download with no path id {}, Item is probably still being created", id);
//					response = Response.status(ACCEPTED).build();
//				} else {
//					// If it is has content, check whether the file exists on the server
//					// If it does not, that means this is a desynchronized entry in the datbase
//					// and it should be deleted and reinitialized. Otherwise, this is 
//					// is good to go and send an OK response
//					boolean existsOnFileSystem;
//
//					try (DownloadManager downloadManager = new DownloadManager()) {
//						existsOnFileSystem = downloadManager.downloadFileExistsOnFilesystem(download);
//					}
//
//					if (!existsOnFileSystem) {
//						LOG.debug("Download manager found a download path that doesn't exist for id {}. Will delete and re-stage", id);
//						try (DownloadService svc = new DownloadService()) {
//							svc.delete(id);
//						}
//						LOG.debug("Download path for item {} was deleted in the database. Will not attempt to re-stage", id);
//						DownloadUtility.stageAsyncItemDownload(id);
//						response = Response.status(ACCEPTED).build();
//					} else {
//						LOG.debug("Download manager found the download for item {}", id);
//						response = Response.status(OK).build();
//					}
//				}
//			} else {
//				LOG.debug("Download manager could not find download for item {}. A download will be staged for this item.", id);
//				DownloadUtility.stageAsyncItemDownload(id);
//				response = Response.status(ACCEPTED).build();
//			}
//		}
//
//		return response;
//	}
//
//	/**
//	 * Downloads a zip file containing the contents of
//	 * gov.usgs.cida.coastalhazards.model.Item
//	 *
//	 * @param id identifier of requested item
//	 * @return JSON representation of the item(s)
//	 * @throws java.io.IOException
//	 * @throws java.lang.InterruptedException
//	 * @throws java.util.concurrent.ExecutionException
//	 */
//	@GET
//	@Path("/item/{id}")
//	@Produces("application/zip")
//	public Response downloadItem(@PathParam("id") String id) throws IOException, InterruptedException, ExecutionException {
//		Response response;
//		Item item;
//
//		try (ItemManager itemManager = new ItemManager()) {
//			item = itemManager.load(id);
//		}
//
//		if (item == null) {
//			response = Response.status(NOT_FOUND).build();
//		} else {
//			Download download;
//			try (DownloadManager downloadManager = new DownloadManager()) {
//				download = downloadManager.load(id);
//			}
//
//			if (download == null) {
//				// Download was null, so we it was not previously staged. Do so now.
//				LOG.debug("Download manager could not find download for item {}. A download will be staged for this item.", id);
//				DownloadUtility.stageAsyncItemDownload(id);
//				response = Response.status(ACCEPTED).build();
//			} else {
//				LOG.debug("Download manager found a download for item id {}", id);
//				if (download.isProblem()) {
//					LOG.debug("Download manager found a problem with download for item id {}", id);
//					response = Response.status(NOT_IMPLEMENTED).build();
//				} else if (StringUtils.isBlank(download.getPersistanceURI())) {
//					LOG.debug("Download manager found a download with no path id {}, Item is still being created", id);
//					response = Response.status(ACCEPTED).build();
//				} else {
//					boolean downloadFileExists;
//					try (DownloadManager downloadManager = new DownloadManager()) {
//						downloadFileExists = downloadManager.downloadFileExistsOnFilesystem(download);
//					}
//
//					// Download should be on the file system. Check that it does exist
//					if (!downloadFileExists) {
//						LOG.debug("Download manager found a download path that doesn't exist for id {}. Will delete and re-stage", id);
//						try (DownloadService svc = new DownloadService()) {
//							svc.delete(id);
//						}
//						DownloadUtility.stageAsyncItemDownload(id);
//						response = Response.status(ACCEPTED).build();
//					} else {
//						// File was found. Load the zip file 
//						File zipFile = download.fetchZipFile();
//						if (zipFile == null) {
//							LOG.debug("Download manager found could not find the zip file that was indicated in the database for item {}. Will attempt to re-stage", id);
//							try (DownloadService svc = new DownloadService()) {
//								svc.delete(id);
//							}
//							DownloadUtility.stageAsyncItemDownload(id);
//							response = Response.status(ACCEPTED).build();
//						} else {
//							String contentDisposition = "attachment; filename=\"" + id + ".zip\"";
//							response = Response.status(OK).entity(zipFile).type("application/zip").header("Content-Disposition", contentDisposition).build();
//						}
//					}
//				}
//			}
//		}
//
//		return response;
//	}
//
//	/**
//	 * TODO this is in need of refactor to get it in line with item download
//	 * Retrieves representation of an instance of
//	 * gov.usgs.cida.coastalhazards.model.Item
//	 *
//	 * @param id identifier of requested item
//	 * @return JSON representation of the item(s)
//	 * @throws java.io.IOException
//	 * @throws java.security.NoSuchAlgorithmException
//	 */
//	@GET
//	@Path("/view/{id}")
//	@Produces("application/zip")
//	public Response getSession(@PathParam("id") String id) throws IOException, NoSuchAlgorithmException {
//		Response response = null;
//		String sessionJSON = sessionManager.load(id);
//		try (DownloadManager downloadManager = new DownloadManager()) {
//			if (sessionJSON == null) {
//				throw new NotFoundException();
//			} else {
//
//				File zipFile = null;
//				Download download;
//				try {
//					download = downloadManager.load(id);
//					if (download != null && download.getPersistanceURI() != null) {
//						zipFile = new File(new URI(download.getPersistanceURI()));
//						if (!zipFile.exists()) {
//							throw new FileNotFoundException();
//						}
//					} else {
//						throw new FileNotFoundException();
//					}
//				} catch (FileNotFoundException | URISyntaxException ex) {
//					Session session = Session.fromJSON(sessionJSON);
//					File stagingDir = DownloadUtility.createDownloadStagingArea();
//					boolean staged = DownloadUtility.stageSessionDownload(session, stagingDir);
//					if (staged) {
//						download = new Download();
//						download = DownloadUtility.zipStagingAreaForDownload(stagingDir, download);
//						download.setSessionId(id);
//						zipFile = download.fetchZipFile();
//
//						if (zipFile == null) {
//							throw new DownloadStagingUnsuccessfulException();
//						}
//
//						downloadManager.save(download);
//					} else {
//						throw new DownloadStagingUnsuccessfulException();
//					}
//				}
//				String contentDisposition = "attachment; filename=\"" + id + ".zip\"";
//				response = Response.ok(zipFile, "application/zip").header("Content-Disposition", contentDisposition).build();
//			}
//		}
//		return response;
//	}
//
//	@GET
//	@Produces("application/json")
//	public Response displayStagedItems() {
//		String downloadJson;
//		try (DownloadManager downloadManager = new DownloadManager()) {
//			List<Download> allStagedDownloads = downloadManager.getAllStagedDownloads();
//			Gson serializer = GsonUtil.getDefault();
//			downloadJson = serializer.toJson(allStagedDownloads, ArrayList.class);
//		}
//		return Response.ok(downloadJson, MediaType.APPLICATION_JSON_TYPE).build();
//	}
//
//	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
//	@DELETE
//	@Produces("application/json")
//	@Path("/item/{id}")
//	public Response deleteStagedItem(@PathParam("id") String itemId, @Context HttpServletRequest request) {
//		Response response = null;
//		try (DownloadService downloadService = new DownloadService()) {
//			Download download = downloadService.get(itemId);
//			if (download == null) {
//				throw new NotFoundException();
//			}
//			boolean deleted = downloadService.delete(itemId);
//			response = Response.ok("{\"deleted\":\"" + deleted + "\"}", MediaType.APPLICATION_JSON_TYPE).build();
//		}
//		return response;
//	}
//
//}
