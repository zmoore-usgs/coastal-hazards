package gov.usgs.cida.coastalhazards.rest.ui;

import com.sun.jersey.api.core.PackagesResourceConfig;
import com.sun.jersey.spi.container.servlet.ServletContainer;
import java.util.HashMap;
import javax.ws.rs.ApplicationPath;

/**
 * TODO come up with good rest path
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath("/ui")
public class UIRestApplication extends PackagesResourceConfig {
     public UIRestApplication() {
         super(new HashMap<String, Object>() {{
           put(PackagesResourceConfig.PROPERTY_PACKAGES, this.getClass().getPackage().getName());
         }});
     }    
}
