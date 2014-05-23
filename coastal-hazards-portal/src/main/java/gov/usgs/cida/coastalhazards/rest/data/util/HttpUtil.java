package gov.usgs.cida.coastalhazards.rest.data.util;

import java.util.Date;
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

}
