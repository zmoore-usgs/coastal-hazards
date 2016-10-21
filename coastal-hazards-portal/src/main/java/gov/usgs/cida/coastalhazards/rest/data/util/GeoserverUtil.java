package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.rest.data.DataURI;
import gov.usgs.cida.coastalhazards.rest.data.TempFileResource;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;
import it.geosolutions.geoserver.rest.encoder.GSResourceEncoder;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;
import javax.ws.rs.core.UriBuilder;
import org.apache.commons.codec.binary.Base64OutputStream;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.AbstractHttpEntity;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class GeoserverUtil {

	private static final Logger log = LoggerFactory.getLogger(GeoserverUtil.class);

	private static final String geoserverInternalEndpoint;
	private static final String geoserverExternalEndpoint;

	private static final String geoserverUser;
	private static final String geoserverPass;
	private static final DynamicReadOnlyProperties props;

	// TODO move these centrally or into configuration
	private static final String PROXY_WORKSPACE = "proxied";
	private static final String PROXY_STORE = "proxied";

	static {
		props = JNDISingleton.getInstance();
		geoserverInternalEndpoint = props.getProperty("coastal-hazards.portal.geoserver.endpoint");
		geoserverExternalEndpoint = props.getProperty("coastal-hazards.portal.geoserver.external.endpoint");
		geoserverUser = props.getProperty("coastal-hazards.geoserver.username");
		geoserverPass = props.getProperty("coastal-hazards.geoserver.password");
	}

	/**
	 *
	 * @param is InputStream representing a shapefile
	 * @param name Layer name to use
	 * @return List of services if successful, empty list otherwise
	 */
	public static List<Service> addVectorLayer(InputStream is, String name) {
		List<Service> serviceList = new LinkedList<>();

		try {
			String created = importUsingWPS(PROXY_WORKSPACE, PROXY_STORE, name, is);

			if (StringUtils.isNotBlank(created)) {
				serviceList.add(wfsService(created));
				serviceList.add(wmsService(created));
			}
		}
		catch (FileNotFoundException ex) {
			log.error("Unable to publish shapefile", ex);
		}
		catch (IOException ex) {
			log.error("Error reading stream", ex);
		}
		return serviceList;
	}

	/**
	 * Builds WFS Services
	 * Must use the external GeoServer url because after these are persisted, 
	 * they are retrieved by clients external to the network
	 * @param layer
	 * @return Service with a www-accessible url
	 */
	private static Service wfsService(String layer) {
		Service service = new Service();
		URI uri = UriBuilder.fromUri(geoserverExternalEndpoint).path(PROXY_WORKSPACE).path("wfs").build();
		service.setType(Service.ServiceType.proxy_wfs);
		service.setEndpoint(uri.toString());
		service.setServiceParameter(layer);
		return service;
	}

	/**
	 * Builds WMS Services
	 * Must use the external GeoServer url because after these are persisted, 
	 * they are retrieved by clients external to the network
	 * @param layer
	 * @return Service with a www-accessible url
	 */
	private static Service wmsService(String layer) {
		Service service = new Service();
		URI uri = UriBuilder.fromUri(geoserverExternalEndpoint).path(PROXY_WORKSPACE).path("wms").build();
		service.setType(Service.ServiceType.proxy_wms);
		service.setEndpoint(uri.toString());
		service.setServiceParameter(layer);
		return service;
	}

	private static String importUsingWPS(String workspaceName, String storeName, String layerName, InputStream shapefile) throws IOException {
		String layerCreated = "";
		String srsName = "EPSG:4326";
		String projectionPolicy = GSResourceEncoder.ProjectionPolicy.REPROJECT_TO_DECLARED.toString();

		FileOutputStream wpsRequestOutputStream = null;
		FileInputStream uploadedInputStream = null;

		File tempDirectory = FileUtils.getTempDirectory();
		UUID uuid = UUID.randomUUID();
		File wpsRequestFile = new File(tempDirectory, uuid.toString() + ".xml");
		
		try {

			wpsRequestOutputStream = new FileOutputStream(wpsRequestFile);

			wpsRequestOutputStream.write(new String(
					"<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
					+ "<wps:Execute service=\"WPS\" version=\"1.0.0\" "
					+ "xmlns:wps=\"http://www.opengis.net/wps/1.0.0\" "
					+ "xmlns:ows=\"http://www.opengis.net/ows/1.1\" "
					+ "xmlns:xlink=\"http://www.w3.org/1999/xlink\" "
					+ "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
					+ "xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 "
					+ "http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd\">"
					+ "<ows:Identifier>gs:Import</ows:Identifier>"
					+ "<wps:DataInputs>"
					+ "<wps:Input>"
					+ "<ows:Identifier>features</ows:Identifier>"
					+ "<wps:Data>"
					+ "<wps:ComplexData mimeType=\"application/zip\"><![CDATA[").getBytes());
			IOUtils.copy(shapefile, new Base64OutputStream(wpsRequestOutputStream, true, 0, null));
			wpsRequestOutputStream.write(new String(
					"]]></wps:ComplexData>"
					+ "</wps:Data>"
					+ "</wps:Input>"
					+ "<wps:Input>"
					+ "<ows:Identifier>workspace</ows:Identifier>"
					+ "<wps:Data>"
					+ "<wps:LiteralData>" + workspaceName + "</wps:LiteralData>"
					+ "</wps:Data>"
					+ "</wps:Input>"
					+ "<wps:Input>"
					+ "<ows:Identifier>store</ows:Identifier>"
					+ "<wps:Data>"
					+ "<wps:LiteralData>" + storeName + "</wps:LiteralData>"
					+ "</wps:Data>"
					+ "</wps:Input>"
					+ "<wps:Input>"
					+ "<ows:Identifier>name</ows:Identifier>"
					+ "<wps:Data>"
					+ "<wps:LiteralData>" + layerName + "</wps:LiteralData>"
					+ "</wps:Data>"
					+ "</wps:Input>"
					+ "<wps:Input>"
					+ "<ows:Identifier>srs</ows:Identifier>"
					+ "<wps:Data>"
					+ "<wps:LiteralData>" + srsName + "</wps:LiteralData>"
					+ "</wps:Data>"
					+ "</wps:Input>"
					+ "<wps:Input>"
					+ "<ows:Identifier>srsHandling</ows:Identifier>"
					+ "<wps:Data>"
					+ "<wps:LiteralData>" + projectionPolicy + "</wps:LiteralData>"
					+ "</wps:Data>"
					+ "</wps:Input>"
					+ "</wps:DataInputs>"
					+ "<wps:ResponseForm>"
					+ "<wps:RawDataOutput>"
					+ "<ows:Identifier>layerName</ows:Identifier>"
					+ "</wps:RawDataOutput>"
					+ "</wps:ResponseForm>"
					+ "</wps:Execute>").getBytes());
			
			layerCreated = postToWPS(geoserverInternalEndpoint + (geoserverInternalEndpoint.endsWith("/") ? "" : "/") +
					"wps/WebProcessingService", wpsRequestFile);
		}
		finally {
			IOUtils.closeQuietly(wpsRequestOutputStream);
			IOUtils.closeQuietly(uploadedInputStream);
			FileUtils.deleteQuietly(wpsRequestFile);
		}

		return layerCreated;
	}

	private static String postToWPS(String url, File wpsRequestFile) throws IOException {
		HttpPost post;
		HttpClient httpClient = new DefaultHttpClient();

		post = new HttpPost(url);

		FileInputStream wpsRequestInputStream = null;
		try {
			wpsRequestInputStream = new FileInputStream(wpsRequestFile);

			AbstractHttpEntity entity = new InputStreamEntity(wpsRequestInputStream, wpsRequestFile.length());

			post.setEntity(entity);

			HttpResponse response = httpClient.execute(post);

			return EntityUtils.toString(response.getEntity());

		}
		finally {
			IOUtils.closeQuietly(wpsRequestInputStream);
			FileUtils.deleteQuietly(wpsRequestFile);
		}
	}
    /**
     * 
     * @param token - the security token
     * @param zipUrl - the url that GeoServer will retrieve the file from
     * @return the absolute path to the file on GeoServer after `zipUrl` is retrieved and unzipped
     */
    public static String callFetchAndUnzip(String token, String zipUrl){
        //Do string templating
        return null;
    }
    public static Service addRasterLayer(String geoServerEndpoint, InputStream zipFileStream, String metadataId) {
        String fileId = UUID.randomUUID().toString();
        String realFileName = TempFileResource.getFileNameForId(fileId);
        //temp file must not include fileId, it should include the realFileName
        File tempFile = new File(TempFileResource.getTempFileSubdirectory(), realFileName);
        try {
            IOUtils.copy(zipFileStream, new FileOutputStream(tempFile));
        } catch (IOException ex) {
            throw new RuntimeException("Error writing zip to file '" + tempFile.getAbsolutePath() + "'.", ex);
        }
        String uri = props.getProperty("coastal-hazards.base.secure.url");
        uri += "/" + DataURI.TEMP_FILE_PATH + "/" + fileId;
        
        
        //String zipUrl <- create a url for the retrieval of the file
        String unzippedFilePath = null;
        try{
            //get the security token from DynamicReadOnlyProperties
            //String token = props.getProperty("something like gov.usgs.cida.coastal.hazards.wps.fetch.and.unzip.token"); //real value is defined in the FetchAndUnzip WPS Process
          
            //unzippedFilePath = call FetchAndUnzip wps proc with two arguments(token, uri)
        } finally{
            //regardless of success or failure of wps proc
            tempFile.delete();
        }
        File unzippedFile = new File(unzippedFilePath);
        GeoServerRESTPublisher publisher = new GeoServerRESTPublisher(geoServerEndpoint, geoserverUser, geoserverPass);
        //Then use the GeoServerRESTPublisher to create the stores and layers
        //publisher.publishExternalGeoTIFF(PROXY_WORKSPACE, metadataId, unzippedFile, metadataId, PROXY_STORE, GSResourceEncoder.ProjectionPolicy.NONE, metadataId)
        // or
        //publisher.publishGeoTIFF(PROXY_WORKSPACE, metadataId, metadataId, unzippedFile, PROXY_STORE, GSResourceEncoder.ProjectionPolicy.NONE, metadataId, bbox)
        Service rasterService = wmsService(metadataId);
        return rasterService;
    }

}
