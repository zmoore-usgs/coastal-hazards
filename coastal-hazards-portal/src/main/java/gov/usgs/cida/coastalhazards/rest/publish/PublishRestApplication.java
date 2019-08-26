package gov.usgs.cida.coastalhazards.rest.publish;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.mvc.jsp.JspMvcFeature;

import gov.usgs.cida.coastalhazards.rest.security.ConfiguredRolesAllowedDynamicFeature;

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
		register(ConfiguredRolesAllowedDynamicFeature.class);
	}
}
