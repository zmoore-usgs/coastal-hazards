package gov.usgs.cida.utilities.gov.usa.go;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.HttpClientSingleton;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.MissingResourceException;
import org.apache.commons.lang.StringUtils;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.BasicResponseHandler;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public class GoUsaGovUtils {

	private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(GoUsaGovUtils.class);
	private static String usagovEndpoint = null;
	private static String login = null;
	private static String apiKey = null;
	private static final DynamicReadOnlyProperties props;
	private static final String loginParam = "coastal-hazards.go.usa.gov.login";
	private static final String apiKeyParam = "coastal-hazards.go.usa.gov.apikey";
	private static final String endpointyParam = "coastal-hazards.go.usa.gov.endpoint";

	static {
		props = JNDISingleton.getInstance();
		usagovEndpoint = props.getProperty(endpointyParam, "http://go.usa.gov/api/");
		login = props.getProperty(loginParam);
		apiKey = props.getProperty(apiKeyParam);
	}

	public static String minify(final String endpoint) throws IOException, URISyntaxException {
		return executeCall("minify", endpoint);
	}

	public static String expand(final String endpoint) throws URISyntaxException, IOException {
		return executeCall("expand", endpoint);
	}

	public static String clicks(final String endpoint) throws URISyntaxException, IOException {
		return executeCall("cilck", endpoint);
	}

	private static String executeCall(String command, String endpoint) throws URISyntaxException, IOException {
		if (StringUtils.isBlank(usagovEndpoint)) {
			throw new MissingResourceException("Missing 'usagovEndpoint'", "GoUsaGovUtils", endpointyParam);
		}
		if (StringUtils.isBlank(login)) {
			throw new MissingResourceException("Missing 'login'", "GoUsaGovUtils", loginParam);
		}
		if (StringUtils.isBlank(apiKey)) {
			throw new MissingResourceException("Missing 'apiKey'", "GoUsaGovUtils", apiKeyParam);
		}

		String serviceEndpoint = "";
		if (command.equals("minify")) {
			serviceEndpoint = usagovEndpoint + "shorten.json?login=" + login + "&apiKey=" + apiKey + "&longUrl=" + endpoint;
		} else if (command.equals("expand")) {
			serviceEndpoint = usagovEndpoint + "expand.json?login=" + login + "&apiKey=" + apiKey + "&shortUrl=" + endpoint;
		} else if (command.equals("click")) {
			serviceEndpoint = usagovEndpoint + "clicks.json?login=" + login + "&apiKey=" + apiKey + "&shortUrl=" + endpoint;
		}

		HttpGet httpGet = new HttpGet(new URI(serviceEndpoint));
		HttpClient httpClient = HttpClientSingleton.getInstance();
		return httpClient.execute(httpGet, new BasicResponseHandler());
	}
}
