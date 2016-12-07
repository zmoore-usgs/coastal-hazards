package gov.usgs.cida.coastalhazards.rest.data.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Date;
import javax.ws.rs.core.UriBuilder;
import org.apache.http.impl.cookie.DateUtils;


/**
 *
 * @author cschroed
 */
public class HttpUtil {
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
}
