package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.exception.PreconditionFailedException;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.LayerManager;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Layer;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.rest.data.util.GeoserverUtil;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.IdGenerator;
import gov.usgs.cida.utilities.WFSIntrospector;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import javax.persistence.PersistenceException;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.glassfish.jersey.media.multipart.FormDataParam;
import static gov.usgs.cida.coastalhazards.rest.data.ItemResource.PUBLIC_URL;
import java.util.ArrayList;
import javax.servlet.annotation.MultipartConfig;
import javax.ws.rs.ServerErrorException;
import javax.ws.rs.core.Response.Status;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
/**
 * Works with ArcGIS and Geoserver services for service like importing layers
 *
 * @author isuftin
 */
@MultipartConfig
@Path(DataURI.LAYER_PATH)
public class LayerResource {

	private static final Logger log = LoggerFactory.getLogger(LayerResource.class);
	
	private static final String geoserverEndpoint;
	private static final String geoserverUser;
	private static final String geoserverPass;
	private static final DynamicReadOnlyProperties props;

	static {
		props = JNDISingleton.getInstance();
		geoserverEndpoint = props.getProperty("coastal-hazards.portal.geoserver.endpoint");
		geoserverUser = props.getProperty("coastal-hazards.geoserver.username");
		geoserverPass = props.getProperty("coastal-hazards.geoserver.password");
	}

	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getLayer(@Context HttpServletRequest req, @PathParam("id") String id) {
		Response response = null;
		try (LayerManager manager = new LayerManager()) {
			Layer layer = manager.load(id);
			if (layer == null) {
				throw new NotFoundException();
			}
			response = Response.ok(GsonUtil.getDefault().toJson(layer), MediaType.APPLICATION_JSON).build();
		}
		return response;
	}
	
	@POST
	@Path("/")
	@Consumes(MediaType.APPLICATION_OCTET_STREAM)
	@Produces(MediaType.TEXT_PLAIN)
	public Response createVectorLayer(@Context HttpServletRequest req, InputStream postBody) {
		Response response = null;
		
		String newId = IdGenerator.generate();
		
		List<Service> added = null;

		//Upload data to GeoServer
		try {
			log.info("Vector layer upload - about to parseRequest");
			byte[] inmemory = IOUtils.toByteArray(postBody);
			try (ByteArrayInputStream bais = new ByteArrayInputStream(inmemory)) {
				log.info("Vector layer create - about to do GeoserverUtil.addVectorLayer with Id: " + newId);
				added = GeoserverUtil.addVectorLayer(bais, newId);
			} finally {
				inmemory = null; // just in case
			}
		} catch (IOException | IllegalArgumentException e) {
			log.error("An error occured while posting the layer data to GeoServer: ", e);
		} 

		//Create WFS Service, CCH Layer Object, and Response
		if (added != null && !added.isEmpty()) {
			WFSService wfs = (WFSService)Service.ogcHelper(Service.ServiceType.proxy_wfs, added);
			Bbox bbox = null;
			try {
				bbox = WFSIntrospector.getBbox(wfs);
			} catch (IOException ex) {
				log.debug("Error determining bounding box", ex);
			}
			
			Layer layer = new Layer();
			layer.setId(newId);
			layer.setServices(added);
			layer.setBbox(bbox);
			
			try (LayerManager manager = new LayerManager()) {
				manager.save(layer);
			}
			response = Response.created(layerURI(layer)).build();
		} else {
			response = Response.serverError().entity("Unable to create layer. Please contact us for support.").build();
		}

		return response;
	}
	
	@POST
	@Path("/")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces(MediaType.TEXT_PLAIN)
	public Response createVectorLayerForm(@Context HttpServletRequest req, @FormDataParam("file") InputStream postBody) {
		Response response = null;
		
		response = createVectorLayer(req, postBody);
		
		return response;
	}
	
	@POST
	@Path("/raster")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces(MediaType.TEXT_PLAIN)
	public Response createRasterLayer(
		@Context HttpServletRequest req, 
		@FormDataParam("file") InputStream zipFileStream,
		@FormDataParam("epsgCode") String epsgCode,
		@FormDataParam("bboxn") Double bboxNorth,
		@FormDataParam("bboxe") Double bboxEast,
		@FormDataParam("bboxs") Double bboxSouth,
		@FormDataParam("bboxw") Double bboxWest,
		@FormDataParam("file") FormDataContentDisposition fileDisposition
	) {
		List<Service> services = new ArrayList<>();
		
		log.info("Raster layer upload - about to parseRequest");
		String newId = IdGenerator.generate();

		if (epsgCode == null || epsgCode.isEmpty() || bboxNorth == null || bboxEast == null || bboxSouth == null || bboxWest == null) {
			log.error("BBox or EPSG code not provided with request.");
			throw new ServerErrorException("BBox or EPSG code not provided with request.", Status.BAD_REQUEST);
		}
		
		Bbox bbox = new Bbox();
		bbox.setBbox(bboxWest, bboxSouth, bboxEast, bboxNorth);

		log.info("Raster layer create - about to addRasterLayer to geoserver with an id of: " + newId); 
		log.info("Raster layer create - about to addRasterLayer to geoserver with an EPSG of: " + epsgCode);
		
		try {
			Service rasterService = GeoserverUtil.addRasterLayer(geoserverEndpoint, zipFileStream, newId, epsgCode);
			if(null == rasterService) {
				log.error("Unable to create a store and/or layer in GeoServer.");
				throw new ServerErrorException("Unable to create a store and/or layer in GeoServer.", Status.INTERNAL_SERVER_ERROR);
			} else {
				services.add(rasterService);
			}
		} catch(IOException e) {
			log.error("Unable to create a store and/or layer in GeoServer: " + e.getMessage());
			throw new ServerErrorException("Unable to create a store and/or layer in GeoServer.", Status.INTERNAL_SERVER_ERROR);
		}

		log.info("Raster layer create - about to create CCH layer object with an id of: " + newId);
		log.info("Raster layer create - about to create CCH layer object with " + services.size() + " services.");
		log.info("Raster layer create - about to create CCH layer object with a bbox of: " + bbox.getBbox());
	
		Layer layer = new Layer();
		layer.setId(newId); 
		layer.setServices(services);
		layer.setBbox(bbox);
		
		try (LayerManager manager = new LayerManager()) {
			manager.save(layer);
			log.info("Raster layer create - saved CCH layer object.");
		} catch(PersistenceException e) {
			log.error("Failed to save CCH Layer Object in database: " + e.getMessage());
			throw new ServerErrorException("Failed to save CCH Layer Object in database.", Status.INTERNAL_SERVER_ERROR);
		}

		log.info("Raster layer create - about to create response...");
		return Response.created(layerURI(layer)).build();
	}
			 
	@DELETE
	@Path("/{layer}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteLaterFromGeoserver(@Context HttpServletRequest req, @PathParam("layer") String layer) throws URISyntaxException {
		if (StringUtils.isBlank(layer)) {
			throw new PreconditionFailedException();
		}

		GeoServerRESTPublisher publisher = new GeoServerRESTPublisher(geoserverEndpoint, geoserverUser, geoserverPass);
		if (publisher.removeLayer("proxied", layer + "?recurse=true")) {
			return Response.status(Response.Status.OK).build();
		}
		else {
			throw new Error();
		}
	}
	
	public static URI layerURI(Layer layer) {
		UriBuilder fromUri = UriBuilder.fromUri(PUBLIC_URL);
		URI uri = fromUri.path(DataURI.DATA_SERVICE_ENDPOINT + DataURI.LAYER_PATH)
				.path(layer.getId()).build();
		return uri;
	}
}
