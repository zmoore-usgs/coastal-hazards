package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.exception.PreconditionFailedException;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.LayerManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Layer;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.rest.data.util.GeoserverUtil;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.IdGenerator;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response createLayer(@Context HttpServletRequest req, InputStream postBody) {
		Response response = null;
		
		String newId = IdGenerator.generate();
		
		List<Service> added = null;
		try {
			byte[] inmemory = IOUtils.toByteArray(postBody);
			ByteArrayInputStream bais = new ByteArrayInputStream(inmemory);
			String metadataId = MetadataUtil.doCSWInsertFromString(MetadataUtil.extractMetadataFromShp(bais));
			bais.reset();
			added = GeoserverUtil.addLayer(bais, newId);
			
			added.add(MetadataUtil.makeCSWServiceForUrl(MetadataUtil.getMetadataByIdUrl(metadataId)));
		} catch (IOException | ParserConfigurationException | SAXException e) {
			log.error("Problem creating services from input", e);
		}
		if (added != null && !added.isEmpty()) {
			Layer layer = new Layer();
			layer.setId(newId);
			layer.setServices(added);
			try (LayerManager manager = new LayerManager()) {
				manager.save(layer);
			}
			response = Response.created(layerURI(layer)).build();
		} else {
			response = Response.serverError().entity("Unable to create layer").build();
		}
		return response;
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
