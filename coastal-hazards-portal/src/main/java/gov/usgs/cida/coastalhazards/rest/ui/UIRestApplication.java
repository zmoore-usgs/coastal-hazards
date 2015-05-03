package gov.usgs.cida.coastalhazards.rest.ui;

import javax.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.mvc.jsp.JspMvcFeature;

/**
 * TODO come up with good rest path
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath("/ui")
public class UIRestApplication extends ResourceConfig {

	public UIRestApplication() {
		packages(this.getClass().getPackage().getName());
		register(JspMvcFeature.class);
	}
}
