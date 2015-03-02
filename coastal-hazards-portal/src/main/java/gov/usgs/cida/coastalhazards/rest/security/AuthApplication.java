package gov.usgs.cida.coastalhazards.rest.security;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.auth.client.CachingAuthClient;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;

@ApplicationPath("/security")
public class AuthApplication extends ResourceConfig {
		public AuthApplication() {
			//security
			AuthClientSingleton.initAuthClient(CachingAuthClient.class);
			register(CoastalHazardsAuthTokenService.class);
		}
}
