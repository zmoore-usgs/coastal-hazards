package gov.usgs.cida.coastalhazards.rest.publish;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.coastalhazards.AuthenticationUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.coastalhazards.rest.security.DynamicRolesLoginRedirectFeature;
import gov.usgs.cida.coastalhazards.rest.security.MustLoginExceptionMapper;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
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
		register(DynamicRolesLoginRedirectFeature.class);
		if (!AuthClientSingleton.isInitialized()) {
			AuthenticationUtil.initCCHAuthClient();
		}
		register(CoastalHazardsTokenBasedSecurityFilter.class);
		register(MustLoginExceptionMapper.class);
	}
}
