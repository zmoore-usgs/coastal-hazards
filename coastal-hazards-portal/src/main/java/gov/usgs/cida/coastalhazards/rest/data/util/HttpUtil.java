package gov.usgs.cida.coastalhazards.rest.data.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Date;
import javax.ws.rs.core.UriBuilder;

import org.apache.http.client.utils.DateUtils;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 *
 * @author cschroed
 */
public class HttpUtil {
	private static final Logger log = LoggerFactory.getLogger(HttpUtil.class);
	
	/**
	 * Given a date, return a string representation of the data that conforms to
	 * RFC-1123
	 * @see http://tools.ietf.org/html/rfc1123
	 * 
	 * @param date
	 * @return String
	 */
	public static String getDateAsHttpDate(Date date){
		return DateUtils.formatDate(date);
	}

	public static String convertUriToHttps(String uri) throws URISyntaxException{
		URI sourceUri = new URI(uri);
		URI convertedUri = convertUriToHttps(sourceUri);
		String strConvertedUri = convertedUri.toString();
		return strConvertedUri;
	}
	
	public static URI convertUriToHttps(URI uri){
		URI convertedUri = UriBuilder.fromUri(uri).scheme("https").build();
		return convertedUri;
	}

	public static String fetchDataFromUri(String endpoint) {
		String data = null;

		try(CloseableHttpClient client = HttpClientBuilder.create().build()) {
			HttpUriRequest req = new HttpGet(endpoint);
			req.addHeader("Content-Type", "text/xml");
			HttpResponse resp = client.execute(req);
			StatusLine statusLine = resp.getStatusLine();
			if (statusLine.getStatusCode() != 200) {
				log.error("Failed to retrieve data from " + endpoint + ". Error code " + statusLine.getStatusCode() + ". Reason: " + statusLine.getReasonPhrase());
			} else {
				data = IOUtils.toString(resp.getEntity().getContent(), "UTF-8");
			}
		} catch (Exception e) {
			log.error("Failed to retireve data from " + endpoint + ". Error: " + e.getMessage() + ". Stack Trace: " + e.getStackTrace());
		}

		return data;
	}
}
