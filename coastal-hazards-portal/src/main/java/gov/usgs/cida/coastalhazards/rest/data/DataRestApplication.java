package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.auth.client.CachingAuthClient;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import org.glassfish.jersey.server.mvc.jsp.JspMvcFeature;
import org.glassfish.jersey.servlet.ServletProperties;

/**
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath("/data")
public class DataRestApplication extends ResourceConfig {

	public DataRestApplication() {
		packages(this.getClass().getPackage().getName());
		property(JspMvcFeature.TEMPLATES_BASE_PATH, "/WEB-INF/jsp");
		property(ServletProperties.FILTER_STATIC_CONTENT_REGEX, "(/WEB-INF/jsp/*)");
		register(JspMvcFeature.class);	
		
		//security
        register(RolesAllowedDynamicFeature.class);
		AuthClientSingleton.initAuthClient(CachingAuthClient.class);
		register(CoastalHazardsTokenBasedSecurityFilter.class);
	}
}
