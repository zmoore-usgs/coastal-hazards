package gov.usgs.cida.coastalhazards.rest;

import com.sun.jersey.api.core.PackagesResourceConfig;
import com.sun.jersey.spi.container.servlet.ServletContainer;
import java.util.HashMap;
import javax.ws.rs.ApplicationPath;

/**
 * TODO come up with good rest path
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath("/rest")
public class RestApplication extends PackagesResourceConfig {
     public RestApplication() {
         super(new HashMap<String, Object>() {{
           put(PackagesResourceConfig.PROPERTY_PACKAGES, "gov.usgs.cida.coastalhazards.rest");
           put(ServletContainer.JSP_TEMPLATES_BASE_PATH, "/WEB-INF/jsp");
           put(ServletContainer.PROPERTY_WEB_PAGE_CONTENT_REGEX, "(/WEB-INF/jsp/*)");
         }});
     }    
}
