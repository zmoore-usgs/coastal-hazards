package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.coastalhazards.AuthenticationUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import javax.ws.rs.ApplicationPath;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import org.glassfish.jersey.server.mvc.jsp.JspMvcFeature;
import org.glassfish.jersey.servlet.ServletProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath(DataURI.DATA_SERVICE_ENDPOINT)
public class DataRestApplication extends ResourceConfig {

	private static final Logger LOG = LoggerFactory.getLogger(DataRestApplication.class);	

	public DataRestApplication() {
		packages(this.getClass().getPackage().getName());
                property(JspMvcFeature.TEMPLATE_BASE_PATH, "/WEB-INF/jsp");
		property(ServletProperties.FILTER_STATIC_CONTENT_REGEX, "(/WEB-INF/jsp/*)");
		register(JspMvcFeature.class);
                register(MultiPartFeature.class);
		//security
		register(RolesAllowedDynamicFeature.class);
		if (!AuthClientSingleton.isInitialized()) {
			AuthenticationUtil.initCCHAuthClient();
		}
		register(CoastalHazardsTokenBasedSecurityFilter.class);
	}
}
