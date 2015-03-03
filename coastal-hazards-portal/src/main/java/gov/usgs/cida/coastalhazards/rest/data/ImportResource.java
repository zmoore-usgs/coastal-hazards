package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.exception.PreconditionFailedException;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;

import java.net.URISyntaxException;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DELETE;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

import org.apache.commons.lang.StringUtils;

/**
 * Works with ArcGIS and Geoserver services for service like importing layers
 * 
 * @author isuftin
 */
@Path("/layer")
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class ImportResource {
	
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

    @RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CIDA_AUTHORIZED_ROLE})
	@DELETE
	@Path("/{layer}")
	public Response deleteLaterFromGeoserver(@Context HttpServletRequest req, @PathParam("layer") String layer) throws URISyntaxException {
		if (StringUtils.isBlank(layer)) {
			throw new PreconditionFailedException();
		}
		
		GeoServerRESTPublisher publisher = new GeoServerRESTPublisher(geoserverEndpoint, geoserverUser, geoserverPass);
		if (publisher.removeLayer("proxied", layer + "?recurse=true")) {
			return Response.status(Response.Status.OK).build();
		} else {
			throw new Error();
		}
	}
}
