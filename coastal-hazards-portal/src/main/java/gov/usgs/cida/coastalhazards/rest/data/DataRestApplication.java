package gov.usgs.cida.coastalhazards.rest.data;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
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
	}
}
