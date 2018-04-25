package gov.usgs.cida.utilities.communication;

import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.PoolingClientConnectionManager;

/**
 *
 * @author isuftin
 */
public class HttpClientSingleton {

	private static HttpClient httpclient = new  DefaultHttpClient(new PoolingClientConnectionManager());

	private HttpClientSingleton() {
	}

	public static HttpClient getInstance() {
		if (null == httpclient) {
			httpclient = new  DefaultHttpClient(new PoolingClientConnectionManager());
		}
		return httpclient;
	}
	
	
}
