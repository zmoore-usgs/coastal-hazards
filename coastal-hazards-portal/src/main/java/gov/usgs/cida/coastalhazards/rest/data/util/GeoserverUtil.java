package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.URI;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import javax.ws.rs.core.UriBuilder;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class GeoserverUtil {
	
	private static final Logger log = LoggerFactory.getLogger(GeoserverUtil.class);
	
	private static final String geoserverEndpoint;
	private static final String geoserverUser;
	private static final String geoserverPass;
	private static final DynamicReadOnlyProperties props;
	
	// TODO move these centrally or into configuration
	private static final String PROXY_WORKSPACE = "proxied";
	private static final String PROXY_STORE = "proxied";

	static {
		props = JNDISingleton.getInstance();
		geoserverEndpoint = props.getProperty("coastal-hazards.portal.geoserver.endpoint");
		geoserverUser = props.getProperty("coastal-hazards.geoserver.username");
		geoserverPass = props.getProperty("coastal-hazards.geoserver.password");
	}
	
	/**
	 * 
	 * @param is InputStream representing a shapefile
	 * @param name Layer name to use
	 * @return List of services if successful, empty list otherwise
	 */
	public static List<Service> addLayer(InputStream is, String name) {
		List<Service> serviceList = new LinkedList<>();
		GeoServerRESTPublisher publisher = new GeoServerRESTPublisher(geoserverEndpoint, geoserverUser, geoserverPass);
		File tmpFile = shpZipToTmpFile(is);
		try {
			boolean published = publisher.publishShp(PROXY_WORKSPACE, PROXY_STORE, name, tmpFile);
			if (published) {
				serviceList.add(wfsService(name));
				serviceList.add(wmsService(name));
			}
		} catch (FileNotFoundException ex) {
			log.error("Unable to publish shapefile", ex);
		}
		finally {
			FileUtils.deleteQuietly(tmpFile);
		}
		return serviceList;
	}
	
	private static File shpZipToTmpFile(InputStream is) {
		File tempDirectory = FileUtils.getTempDirectory();
		UUID uuid = UUID.randomUUID();
		File tmpFile = new File(tempDirectory, uuid.toString() + ".zip");
		return tmpFile;
	}
	
	private static Service wfsService(String name) {
		Service service = new Service();
		URI uri = UriBuilder.fromUri(geoserverEndpoint).path(PROXY_WORKSPACE).path("wfs").build();
		service.setType(Service.ServiceType.proxy_wfs);
		service.setEndpoint(uri.toString());
		service.setServiceParameter(PROXY_WORKSPACE + ":" + name);
		return service;
	}
	
	private static Service wmsService(String name) {
		Service service = new Service();
		URI uri = UriBuilder.fromUri(geoserverEndpoint).path(PROXY_WORKSPACE).path("wms").build();
		service.setType(Service.ServiceType.proxy_wms);
		service.setEndpoint(uri.toString());
		service.setServiceParameter(PROXY_WORKSPACE + ":" + name);
		return service;
	}
}
