package gov.usgs.cida.coastalhazards;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.auth.client.CachingAuthClient;
import gov.usgs.cida.auth.client.NullAuthClient;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class AuthenticationUtil {

	private static final Logger log = LoggerFactory.getLogger(AuthenticationUtil.class);
	
	public static void initCCHAuthClient() {
		try {
			DynamicReadOnlyProperties props = JNDISingleton.getInstance();
			String nullRoles = props.getProperty(NullAuthClient.AUTH_ROLES_JNDI_NAME);
			if (StringUtils.isNotBlank(nullRoles)) {
				AuthClientSingleton.initAuthClient(NullAuthClient.class);
			} else {
				AuthClientSingleton.initAuthClient(CachingAuthClient.class);
			}
		} catch (IllegalArgumentException e) {
			log.warn("JNDI properties for CIDA Auth Webservice not set. Any secured endpoints will be restricted", e);
		}
	}
	
}
