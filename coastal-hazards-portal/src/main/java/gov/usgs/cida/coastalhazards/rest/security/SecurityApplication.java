package gov.usgs.cida.coastalhazards.rest.security;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.coastalhazards.AuthenticationUtil;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import org.glassfish.jersey.server.mvc.jsp.JspMvcFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationPath("/security")
public class SecurityApplication extends ResourceConfig {

	private static final Logger LOG = LoggerFactory.getLogger(SecurityApplication.class);

	public SecurityApplication() {
		register(JspMvcFeature.class);

		//security
		register(RolesAllowedDynamicFeature.class);
		if (!AuthClientSingleton.isInitialized()) {
			AuthenticationUtil.initCCHAuthClient();
		}
		register(CoastalHazardsTokenBasedSecurityFilter.class);
		register(SecurityResources.class);
	}
}
