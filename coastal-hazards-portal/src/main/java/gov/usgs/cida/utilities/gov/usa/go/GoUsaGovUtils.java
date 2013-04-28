package gov.usgs.cida.utilities.gov.usa.go;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.MissingResourceException;
import org.apache.commons.lang.StringUtils;
import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.DefaultHttpClient;
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
	private static DynamicReadOnlyProperties props = null;
	private static final String loginParam = "login.go.usa.gov";
	private static final String apiKeyParam = "api.go.usa.gov";
	private static final String endpointyParam = "endpoint.go.usa.gov";

	static {
		props = JNDISingleton.getInstance();
		usagovEndpoint = props.getProperty(endpointyParam, "http://go.usa.gov/api/");
		login = props.getProperty(loginParam, "Ivan%20Suftin");
		apiKey = props.getProperty(apiKeyParam, "62222b5dac4cf691f6434bdcb2cd0c2e");
	}

	public static String minify(final String endpoint) throws IOException, URISyntaxException {
		String response = null;
		if (StringUtils.isBlank(usagovEndpoint)) {
			throw new MissingResourceException("Missing 'usagovEndpoint'", "GoUsaGovUtils", endpointyParam);
		}
		if (StringUtils.isBlank(login)) {
			throw new MissingResourceException("Missing 'login'", "GoUsaGovUtils", loginParam);
		}
		if (StringUtils.isBlank(apiKey)) {
			throw new MissingResourceException("Missing 'apiKey'", "GoUsaGovUtils", apiKeyParam);
		}
		
		HttpClient httpclient = new DefaultHttpClient();
        try {
			String serviceEndpoint = usagovEndpoint + "shorten.json?login=" + login + "&apiKey=" + apiKey + "&longUrl=" + endpoint;
			URI serviceEndpointUri = new URI(serviceEndpoint);
			HttpGet httpGet = new HttpGet(serviceEndpointUri);
			
            ResponseHandler<String> responseHandler = new BasicResponseHandler();
            response = httpclient.execute(httpGet, responseHandler);
		} finally {
            httpclient.getConnectionManager().shutdown();
        }
		
		return response;
	}

	public static String expand(final String endpoint) throws URISyntaxException, IOException {
		String response = null;
		if (StringUtils.isBlank(usagovEndpoint)) {
			throw new MissingResourceException("Missing 'usagovEndpoint'", "GoUsaGovUtils", endpointyParam);
		}
		if (StringUtils.isBlank(login)) {
			throw new MissingResourceException("Missing 'login'", "GoUsaGovUtils", loginParam);
		}
		if (StringUtils.isBlank(apiKey)) {
			throw new MissingResourceException("Missing 'apiKey'", "GoUsaGovUtils", apiKeyParam);
		}
		
		HttpClient httpclient = new DefaultHttpClient();
        try {
			String serviceEndpoint = usagovEndpoint + "expand.json?login=" + login + "&apiKey=" + apiKey + "&shortUrl=" + endpoint;
			URI serviceEndpointUri = new URI(serviceEndpoint);
			HttpGet httpGet = new HttpGet(serviceEndpointUri);
			
            ResponseHandler<String> responseHandler = new BasicResponseHandler();
            response = httpclient.execute(httpGet, responseHandler);
		} finally {
            httpclient.getConnectionManager().shutdown();
        }
		
		return response;
	}

	public static String clicks(final String endpoint) throws URISyntaxException, IOException {
		String response = null;
		if (StringUtils.isBlank(usagovEndpoint)) {
			throw new MissingResourceException("Missing 'usagovEndpoint'", "GoUsaGovUtils", endpointyParam);
		}
		if (StringUtils.isBlank(login)) {
			throw new MissingResourceException("Missing 'login'", "GoUsaGovUtils", loginParam);
		}
		if (StringUtils.isBlank(apiKey)) {
			throw new MissingResourceException("Missing 'apiKey'", "GoUsaGovUtils", apiKeyParam);
		}
		
		HttpClient httpclient = new DefaultHttpClient();
        try {
			String serviceEndpoint = usagovEndpoint + "clicks.json?login=" + login + "&apiKey=" + apiKey + "&shortUrl=" + endpoint;
			URI serviceEndpointUri = new URI(serviceEndpoint);
			HttpGet httpGet = new HttpGet(serviceEndpointUri);
			
            ResponseHandler<String> responseHandler = new BasicResponseHandler();
            response = httpclient.execute(httpGet, responseHandler);
		} finally {
            httpclient.getConnectionManager().shutdown();
        }
		
		return response;
	}
	
}
