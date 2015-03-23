package gov.usgs.cida.coastalhazards.rest.security;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.auth.client.CachingAuthClient;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationPath("/authentication")
public class AuthenticationApplication extends ResourceConfig {
    private static final Logger LOG = LoggerFactory.getLogger(AuthenticationApplication.class);
	
	public AuthenticationApplication() {
		//security
        if ( !AuthClientSingleton.isInitialized() ) {
        	try {
        		AuthClientSingleton.initAuthClient(CachingAuthClient.class);
        	} catch (IllegalArgumentException e) {
        		LOG.warn("JNDI properties for CIDA Auth Webservice not set. Any secured endpoints will be restricted", e);
        	}
        }
		register(CoastalHazardsAuthTokenService.class);
	}
}
