package gov.usgs.cida.coastalhazards.rest.publish;

import com.sun.jersey.api.core.PackagesResourceConfig;
import java.util.HashMap;
import javax.ws.rs.ApplicationPath;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath("/publish")
public class PublishRestApplication extends PackagesResourceConfig {

	public PublishRestApplication() {
		super(new HashMap<String, Object>() {
			private static final long serialVersionUID = 76876L;
			{
				put(PackagesResourceConfig.PROPERTY_PACKAGES, this.getClass().getPackage().getName());
			}
		});
	}
}
