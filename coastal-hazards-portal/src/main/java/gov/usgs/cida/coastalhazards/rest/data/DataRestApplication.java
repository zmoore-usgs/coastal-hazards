package gov.usgs.cida.coastalhazards.rest.data;

import javax.ws.rs.ApplicationPath;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.mvc.jsp.JspMvcFeature;
import org.glassfish.jersey.servlet.ServletProperties;

import gov.usgs.cida.coastalhazards.rest.security.ConfiguredRolesAllowedDynamicFeature;

/**
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath(DataURI.DATA_SERVICE_ENDPOINT)
public class DataRestApplication extends ResourceConfig {

	public DataRestApplication() {
		packages(this.getClass().getPackage().getName());
		property(JspMvcFeature.TEMPLATE_BASE_PATH, "/WEB-INF/jsp");
		property(ServletProperties.FILTER_STATIC_CONTENT_REGEX, "(/WEB-INF/jsp/*)");
		register(JspMvcFeature.class);
		register(MultiPartFeature.class);

		//security
		register(ConfiguredRolesAllowedDynamicFeature.class);
	}
}
