package gov.usgs.cida.coastalhazards.rest.security;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.coastalhazards.AuthenticationUtil;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationPath("/authentication")
public class AuthenticationApplication extends ResourceConfig {

	private static final Logger LOG = LoggerFactory.getLogger(AuthenticationApplication.class);

	public AuthenticationApplication() {
		//security
		if (!AuthClientSingleton.isInitialized()) {
			AuthenticationUtil.initCCHAuthClient();
		}
		register(CoastalHazardsAuthTokenService.class);
	}
}
