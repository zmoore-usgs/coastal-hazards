package gov.usgs.cida.coastalhazards.login;

import com.sun.jersey.api.core.PackagesResourceConfig;
import java.util.HashMap;
import javax.ws.rs.ApplicationPath;

/**
 *
 * @author isuftin
 */
@ApplicationPath("/openid")
public class LoginRestApplication extends PackagesResourceConfig {
	public LoginRestApplication() {
		super(new HashMap<String, Object>() {
			private static final long serialVersionUID = 763254L;
			{
				put(PackagesResourceConfig.PROPERTY_PACKAGES, this.getClass().getPackage().getName());
			}
		});
	}
}
