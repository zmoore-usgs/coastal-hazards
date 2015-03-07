package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.auth.client.CachingAuthClient;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import javax.ws.rs.ApplicationPath;
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
		property(JspMvcFeature.TEMPLATES_BASE_PATH, "/WEB-INF/jsp");
		property(ServletProperties.FILTER_STATIC_CONTENT_REGEX, "(/WEB-INF/jsp/*)");
		register(JspMvcFeature.class);

		//security
		register(RolesAllowedDynamicFeature.class);
		if (!AuthClientSingleton.isInitialized()) {
			try {
				AuthClientSingleton.initAuthClient(CachingAuthClient.class);
			}
			catch (IllegalArgumentException e) {
				LOG.warn("JNDI properties for CIDA Auth Webservice not set. Any secured endpoints will be restricted", e);
			}
		}
		register(CoastalHazardsTokenBasedSecurityFilter.class);
	}
}
