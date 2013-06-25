package gov.usgs.cida.coastalhazards.oid.session;

import com.sun.jersey.api.core.PackagesResourceConfig;
import java.util.HashMap;
import javax.ws.rs.ApplicationPath;

/**
 *
 * @author isuftin
 */
@ApplicationPath("/app")
public class SessionRestApplication extends PackagesResourceConfig {

	public SessionRestApplication() {
		super(new HashMap<String, Object>() {
			private static final long serialVersionUID = 7613254L;
			{
				put(PackagesResourceConfig.PROPERTY_PACKAGES, this.getClass().getPackage().getName());
			}
		});
	}
}
