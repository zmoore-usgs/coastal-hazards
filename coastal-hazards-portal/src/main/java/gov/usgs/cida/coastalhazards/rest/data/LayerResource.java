package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.exception.PreconditionFailedException;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.LayerManager;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Layer;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.rest.data.util.GeoserverUtil;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
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
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
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
import javax.xml.parsers.ParserConfigurationException;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import static gov.usgs.cida.coastalhazards.rest.data.ItemResource.PUBLIC_URL;
import java.util.ArrayList;
import javax.ws.rs.ServerErrorException;
import javax.ws.rs.core.Response.Status;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.lang3.tuple.Pair;

/**
 * Works with ArcGIS and Geoserver services for service like importing layers
 *
 * @author isuftin
 */
@Path(DataURI.LAYER_PATH)
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class LayerResource {

	private static final Logger log = LoggerFactory.getLogger(LayerResource.class);
	
	private static final String geoserverEndpoint;
	private static final String geoserverUser;
	private static final String geoserverPass;
        static final String RASTER_METADATA_FORM_FIELD_NAME = "metadata";
        static final String RASTER_FILE_FORM_FIELD_NAME = "data";
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
	@Path("/vector")
	@Consumes(MediaType.APPLICATION_OCTET_STREAM)
	@Produces(MediaType.TEXT_PLAIN)
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response createVectorLayer(@Context HttpServletRequest req, InputStream postBody) {
		Response response = null;
		
		String newId = IdGenerator.generate();
		
		List<Service> added = null;
		try {
			byte[] inmemory = IOUtils.toByteArray(postBody);
			try (ByteArrayInputStream bais = new ByteArrayInputStream(inmemory)) {
				String metadataId = MetadataUtil.doCSWInsertFromString(MetadataUtil.extractMetadataFromShp(bais));
				bais.reset();
				added = GeoserverUtil.addVectorLayer(bais, newId);

				added.add(MetadataUtil.makeCSWServiceForUrl(MetadataUtil.getMetadataByIdUrl(metadataId)));
			} finally {
				inmemory = null; // just in case
			}
		} catch (IOException | ParserConfigurationException | SAXException e) {
			log.error("Problem creating services from input", e);
		} 
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
			response = Response.serverError().entity("Unable to create layer").build();
		}
		return response;
	}
	
        @POST
	@Path("/raster")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces(MediaType.TEXT_PLAIN)
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response createRasterLayer(@Context HttpServletRequest req) {
            DiskFileItemFactory fileItemFactory = new DiskFileItemFactory();
            ServletFileUpload fileUpload = new ServletFileUpload(fileItemFactory);
            List<Service> services = new ArrayList<>();
            
            try{
                List<FileItem> items = fileUpload.parseRequest(req);
                Pair<String, InputStream> pair = getMetadataAndZippedRaster(items);
                String metadata = pair.getLeft();
                InputStream zipFileStream = pair.getRight();
                String metadataId;
                try {
                    metadataId = MetadataUtil.doCSWInsertFromString(metadata);
                } catch (IOException | ParserConfigurationException | SAXException ex) {
                    throw new ServerErrorException("Error inserting metadata to the CSW server.", Status.INTERNAL_SERVER_ERROR, ex);
                }
                services.add(MetadataUtil.makeCSWServiceForUrl(MetadataUtil.getMetadataByIdUrl(metadataId)));
                Bbox bbox = MetadataUtil.getBoundingBoxFromFgdcMetadata(metadata);
                Service rasterService = GeoserverUtil.addRasterLayer(geoserverEndpoint, zipFileStream, metadataId);
                services.add(rasterService);
                if (!services.isEmpty()) {
			Layer layer = new Layer();
			layer.setId(metadataId);
			layer.setServices(services);
			layer.setBbox(bbox);
			
			try (LayerManager manager = new LayerManager()) {
				manager.save(layer);
			}
			return Response.created(layerURI(layer)).build();
		} else {
			throw new ServerErrorException("Unable to create layer", Status.INTERNAL_SERVER_ERROR);
		}
                
                
            } catch (FileUploadException ex) {
                throw new ServerErrorException("Error parsing upload request", Status.INTERNAL_SERVER_ERROR, ex);
            } 
        }
        
        Pair<String, InputStream> getMetadataAndZippedRaster(List<FileItem> items){
            String metadata = null;
            InputStream zippedTiff = null;
                if(items != null && !items.isEmpty()) {
                    for (FileItem item : items) {
                        String name = item.getName().toLowerCase();
                        if(RASTER_FILE_FORM_FIELD_NAME.equals(name)) {
                            try {
                                zippedTiff = item.getInputStream();
                            } catch (IOException ex) {
                                throw new ServerErrorException("Error reading zipped TIFF", Status.INTERNAL_SERVER_ERROR, ex);
                            }
                        } else if(RASTER_METADATA_FORM_FIELD_NAME.equals(name)) {
                            metadata = item.getString();
                        } else {
                            log.warn("ignoring extra parameter on raster layer creation: '" + name + "'.");
                        }
                    }
                    if(null == metadata){
                        throw new ServerErrorException("No metadata file found for field '" + RASTER_METADATA_FORM_FIELD_NAME + "'.", Status.INTERNAL_SERVER_ERROR);
                    }
                    if(null == zippedTiff){
                        throw new ServerErrorException("No zipped TIFF file found for field" + RASTER_FILE_FORM_FIELD_NAME + "'.", Status.INTERNAL_SERVER_ERROR);
                    }
                } else {
                    throw new ServerErrorException("Could not find any files to iterate over. Were files uploaded?", Status.INTERNAL_SERVER_ERROR);
                }
            return Pair.of(metadata, zippedTiff);
        }
        
	@DELETE
	@Path("/{layer}")
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
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
