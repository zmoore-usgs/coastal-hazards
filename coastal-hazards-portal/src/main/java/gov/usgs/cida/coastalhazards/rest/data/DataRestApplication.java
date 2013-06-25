package gov.usgs.cida.coastalhazards.rest.data;

import com.sun.jersey.api.core.PackagesResourceConfig;
import com.sun.jersey.spi.container.servlet.ServletContainer;
import java.util.HashMap;
import javax.ws.rs.ApplicationPath;

/**
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath("/data")
public class DataRestApplication extends PackagesResourceConfig {

	public DataRestApplication() {
		super(new HashMap<String, Object>() {
			private static final long serialVersionUID = 763254L;
			{
				put(PackagesResourceConfig.PROPERTY_PACKAGES, this.getClass().getPackage().getName());
                put(ServletContainer.JSP_TEMPLATES_BASE_PATH, "/WEB-INF/jsp");
                put(ServletContainer.PROPERTY_WEB_PAGE_CONTENT_REGEX, "(/WEB-INF/jsp/*)");
			}
		});
	}
}
