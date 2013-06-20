package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.rest.publish.*;
import com.sun.jersey.api.core.PackagesResourceConfig;
import com.sun.jersey.spi.container.servlet.ServletContainer;
import java.util.HashMap;
import javax.ws.rs.ApplicationPath;

/**
 * TODO come up with good rest path
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath("/data")
public class DataRestApplication extends PackagesResourceConfig {
     public DataRestApplication() {
         super(new HashMap<String, Object>() {{
           put(PackagesResourceConfig.PROPERTY_PACKAGES, this.getClass().getPackage().getName());
         }});
     }    
}
