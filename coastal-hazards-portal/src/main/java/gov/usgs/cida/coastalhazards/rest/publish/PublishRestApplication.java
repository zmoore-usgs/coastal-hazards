package gov.usgs.cida.coastalhazards.rest.publish;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.auth.client.CachingAuthClient;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import org.glassfish.jersey.server.mvc.jsp.JspMvcFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath("/publish")
public class PublishRestApplication extends ResourceConfig {
    private static final Logger LOG = LoggerFactory.getLogger(PublishRestApplication.class);
    
	public PublishRestApplication() {
		packages(this.getClass().getPackage().getName());
		register(JspMvcFeature.class);
		
		//security
        register(RolesAllowedDynamicFeature.class);
        if ( !AuthClientSingleton.isInitialized() ) {
        	try {
        		AuthClientSingleton.initAuthClient(CachingAuthClient.class);
        	} catch (IllegalArgumentException e) {
        		LOG.warn("JNDI properties for CIDA Auth Webservice not set. Any secured endpoints will be restricted");
        	}
        }
		register(CoastalHazardsTokenBasedSecurityFilter.class);
	}
}
