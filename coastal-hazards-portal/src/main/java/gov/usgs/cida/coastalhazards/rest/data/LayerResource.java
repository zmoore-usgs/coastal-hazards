package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.exception.PreconditionFailedException;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.rest.data.util.GeoserverUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.IdGenerator;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.commons.lang.StringUtils;

/**
 * Works with ArcGIS and Geoserver services for service like importing layers
 *
 * @author isuftin
 */
@Path(DataURI.LAYER_PATH)
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class LayerResource {

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

	@POST
	@Path("/")
	@Consumes(MediaType.APPLICATION_OCTET_STREAM)
	@Produces(MediaType.APPLICATION_JSON)
	//@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response createLayer(@Context HttpServletRequest req, InputStream postBody) {
		Response response = null;
		Map<String, String> responseMap = new HashMap<>();
		
		String newId = IdGenerator.generate();
		// TODO metadata is ignored for now, would need to pull metadata out of zip
		List<Service> added = GeoserverUtil.addLayer(postBody, newId);
		if (!added.isEmpty()) {
			// just get the first (WFS) until we add to database TODO
			Service service = added.get(0);
			String endpoint = service.getEndpoint();
			String serviceParameter = service.getServiceParameter();
			responseMap.put("endpoint", endpoint);
			responseMap.put("serviceParameter", serviceParameter);
			response = Response.ok(GsonUtil.getDefault().toJson(responseMap, HashMap.class), MediaType.APPLICATION_JSON_TYPE).build();
		} else {
			response = Response.serverError().entity("Unable to create layer").build();
		}
		return response;
	}
	
	@DELETE
	@Path("/{layer}")
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
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
}
