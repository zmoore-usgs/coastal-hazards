package gov.usgs.cida.coastalhazards.rest.publish;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.auth.client.CachingAuthClient;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import org.glassfish.jersey.server.mvc.jsp.JspMvcFeature;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath("/publish")
public class PublishRestApplication extends ResourceConfig {
	public PublishRestApplication() {
		packages(this.getClass().getPackage().getName());
		register(JspMvcFeature.class);
		
		//security
        register(RolesAllowedDynamicFeature.class);
        if ( !AuthClientSingleton.isInitialized() ) {
        	AuthClientSingleton.initAuthClient(CachingAuthClient.class);
        }
		register(CoastalHazardsTokenBasedSecurityFilter.class);
	}
}
