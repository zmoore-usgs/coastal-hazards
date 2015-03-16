package gov.usgs.cida.coastalhazards.rest.security;

import java.net.URI;
import java.net.URISyntaxException;

import gov.usgs.cida.config.DynamicReadOnlyProperties;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Handlers and reports MustLoginException
 * @author thongsav
 *
 *
 */
@Provider
public class MustLoginExceptionMapper implements
		ExceptionMapper<MustLoginException> {
    private static final Logger LOG = LoggerFactory.getLogger(MustLoginExceptionMapper.class);
	

	private static String BASE_URL;
	{
		try {
			DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();
			props = props.addJNDIContexts(new String[0]);
			BASE_URL = props.getProperty("coastal-hazards.base.url", ""); //TODO really should build this dynamically
		} catch (Exception e) {
			LOG.warn("Failed to load JNDI coastal-hazards.base.url");
		}
	}
	
	public Response toResponse(MustLoginException ex) {
		try {
			return Response.temporaryRedirect(new URI(BASE_URL + "/security/auth/login")).build();
		} catch (URISyntaxException e) {
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error redirecting to login page").encoding(MediaType.TEXT_PLAIN).build();
		}
	}
}
