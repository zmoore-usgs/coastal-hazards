package gov.usgs.cida.coastalhazards.rest.data;

import com.sun.jersey.api.core.PackagesResourceConfig;
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
			}
		});
	}
}
