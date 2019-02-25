package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.rest.data.DataURI;
import gov.usgs.cida.coastalhazards.rest.data.TempFileResource;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;
import it.geosolutions.geoserver.rest.decoder.RESTCoverageStore;
import it.geosolutions.geoserver.rest.encoder.GSLayerEncoder;
import it.geosolutions.geoserver.rest.encoder.GSResourceEncoder;
import it.geosolutions.geoserver.rest.encoder.coverage.GSCoverageEncoder;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Base64;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import javax.ws.rs.core.UriBuilder;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.AbstractHttpEntity;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicHeader;
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
	private static final String PROXY_STORE = "proxied";
	private static final String PROXY_WORKSPACE = "proxied";
	private static final String DEFAULT_RASTER_STYLE = "raster";

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
			log.info("addVectorLayer - Attempting WPS import with name: " + name);
			String created = importUsingWPS(PROXY_WORKSPACE, PROXY_STORE, name, is);

			if (StringUtils.isNotBlank(created)) {
				log.info("addVectorLayer - WPS import succeeded, creating services with data: " + created);
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
		log.info("createWfsService using layer: " + layer);
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
		log.info("createWmsService using layer: " + layer);
		Service service = new Service();
		URI uri = UriBuilder.fromUri(geoserverExternalEndpoint).path(PROXY_WORKSPACE).path("wms").build();
		service.setType(Service.ServiceType.proxy_wms);
		service.setEndpoint(uri.toString());
		service.setServiceParameter(layer);
		return service;
	}

	private static String importUsingWPS(String workspaceName, String storeName, String layerName, InputStream shapefile) throws IOException {
		log.debug("Sending WPS to import {} into {}/{}", layerName, workspaceName, storeName);
		String layerCreated = "";
		String srsName = "EPSG:4326";
		String projectionPolicy = GSResourceEncoder.ProjectionPolicy.REPROJECT_TO_DECLARED.toString();

		FileOutputStream wpsRequestOutputStream = null;
		FileInputStream uploadedInputStream = null;

		File tempDirectory = FileUtils.getTempDirectory();
		UUID uuid = UUID.randomUUID();
		File wpsRequestFile = new File(tempDirectory, uuid.toString() + ".xml");
		
		String fileId = UUID.randomUUID().toString();
		String realFileName = TempFileResource.getFileNameForId(fileId);
		//temp file must not include fileId, it should include the realFileName. We don't hand out the realFileName.
		File tempFile = new File(TempFileResource.getTempFileSubdirectory(), realFileName);
		FileOutputStream fileOut = null;
		try {
			fileOut = new FileOutputStream(tempFile);
			IOUtils.copy(shapefile, fileOut);  // this is the renamed zip file (the raster tif)
		} catch (IOException ex) {
			throw new RuntimeException("Error writing zip to file '" + tempFile.getAbsolutePath() + "'.", ex);
		} finally {
			IOUtils.closeQuietly(shapefile);
			IOUtils.closeQuietly(fileOut);
		}
		// tempFile should now have all the data transferred to it
		log.info("Data should now have been copied to the tempFile located here:" + tempFile.getAbsoluteFile()); //this puts it under <tomcat>/temp/cch-temp<randomkeyA>/<randomkeyB>  without the .zip ext
		log.info("The file id is: " + fileId);
		String uri = props.getProperty("coastal-hazards.base.url"); 
		log.info("The uri from the props is: " + uri);
		uri += DataURI.DATA_SERVICE_ENDPOINT + DataURI.TEMP_FILE_PATH + "/" + fileId;
		
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
					+ "<wps:Reference xlink:href=\""+ uri + "\" mimeType=\"application/zip\"/>"
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
					"wps/WebProcessingService", geoserverUser, geoserverPass, wpsRequestFile);
		}
		finally {
			IOUtils.closeQuietly(wpsRequestOutputStream);
			IOUtils.closeQuietly(uploadedInputStream);
			FileUtils.deleteQuietly(wpsRequestFile);
			FileUtils.deleteQuietly(tempFile);
		}

		return layerCreated;
	}

	private static String postToWPS(String url, String username, String password, File wpsRequestFile) throws IOException {
		HttpPost post;
		HttpClient httpClient = HttpClientBuilder.create()
				  .build();

		post = new HttpPost(url);

		FileInputStream wpsRequestInputStream = null;
		try {
			log.info("About to perform wps post request at URL: " + url);
			wpsRequestInputStream = new FileInputStream(wpsRequestFile);
			AbstractHttpEntity entity = new InputStreamEntity(wpsRequestInputStream, wpsRequestFile.length());
			post.setEntity(entity);

			String userPass = username + ":" + password;
			post.addHeader(new BasicHeader("Authorization", "Basic " + Base64.getEncoder().encodeToString(userPass.getBytes())));
			HttpResponse response = httpClient.execute(post);
			String responseString = EntityUtils.toString(response.getEntity());
			log.info("WPS Response Recieved: " + responseString);
			return responseString;
		} finally {
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
        public static String importRasterUsingWps(String token, String zipUrl) throws IOException{
                String absPath = null;
                try {
                    // create a version of the xml needed to post to geoserver so that it will unzip the file and place it on its data location                   
                        log.info("importRasterUsingWps ... about to post to wps to transfer raster with zipUrl: " + zipUrl);
                        absPath = postRasterWpsXml(token, zipUrl);
                } catch (IOException ex) {
                        log.error("Unable to post wps request. Error creating xml request.");
                        throw ex;
                }

            return absPath;
        }
    
            private static String postRasterWpsXml(String token, String zipUrl) throws FileNotFoundException, IOException {
                    String urlString = null;

                    FileOutputStream wpsRequestOutputStream = null;
                    FileInputStream uploadedInputStream = null;

                    // create a dir for the request xml file location which is needed to call the post
                    File tempDirectory = FileUtils.getTempDirectory();
                    log.info("The Raster request xml temp dir abs path is : " + tempDirectory.getAbsolutePath());
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
                                            + "<ows:Identifier>gs:FetchAndUnzip</ows:Identifier>"
                                            + "<wps:DataInputs>"
                                            + "<wps:Input>"
                                            + "<ows:Identifier>zipUrl</ows:Identifier>"
                                            + "<wps:Data>"
                                            + "<wps:LiteralData>" + zipUrl + "</wps:LiteralData>"
                                            + "</wps:Data>"
                                            + "</wps:Input>"
                                            + "<wps:Input>"
                                            + "<ows:Identifier>token</ows:Identifier>"
                                            + "<wps:Data>"
                                            + "<wps:LiteralData>" + token + "</wps:LiteralData>"
                                            + "</wps:Data>"
                                            + "</wps:Input>"
                                            + "</wps:DataInputs>"
                                            + "<wps:ResponseForm>"
                                            + "<wps:RawDataOutput>"
                                            + "<ows:Identifier>filePath</ows:Identifier>"
                                            + "</wps:RawDataOutput>"
                                            + "</wps:ResponseForm>"
                                            + "</wps:Execute>").getBytes());
                                                       
                            urlString = postToWPS(geoserverInternalEndpoint + (geoserverInternalEndpoint.endsWith("/") ? "" : "/") +
                                            "wps/WebProcessingService", geoserverUser, geoserverPass, wpsRequestFile);
                    }
                    finally {
                            IOUtils.closeQuietly(wpsRequestOutputStream);
                            IOUtils.closeQuietly(uploadedInputStream);
                            FileUtils.deleteQuietly(wpsRequestFile);
                    }
                    return urlString;
            }
                                            
            public static Service addRasterLayer(String geoServerEndpoint, InputStream zipFileStream, String layerId, String EPSGcode) throws FileNotFoundException, IOException {                   
                    Service rasterService = null;
                    String fileId = UUID.randomUUID().toString();
                    String realFileName = TempFileResource.getFileNameForId(fileId);
                    //temp file must not include fileId, it should include the realFileName. We don't hand out the realFileName.
                    File tempFile = new File(TempFileResource.getTempFileSubdirectory(), realFileName);
                    FileOutputStream fileOut = null;
                    try {
                        fileOut = new FileOutputStream(tempFile);
                        IOUtils.copy(zipFileStream, fileOut);  // this is the renamed zip file (the raster tif)
                    } catch (IOException ex) {
                        throw new RuntimeException("Error writing zip to file '" + tempFile.getAbsolutePath() + "'.", ex);
                    } finally {
                        IOUtils.closeQuietly(zipFileStream);
                        IOUtils.closeQuietly(fileOut);
                    }
                    // tempFile should now have all the data transferred to it
                    log.info("Data should now have been copied to the tempFile located here:" + tempFile.getAbsoluteFile()); //this puts it under <tomcat>/temp/cch-temp<randomkeyA>/<randomkeyB>  without the .zip ext
                    log.info("The file id is: " + fileId);
                    String uri = props.getProperty("coastal-hazards.base.url"); 
                    log.info("The uri from the props is: " + uri);
                    uri += DataURI.DATA_SERVICE_ENDPOINT + DataURI.TEMP_FILE_PATH + "/" + fileId;

                    //String zipUrl <- create a url for the retrieval of the file  ... this is now coastal-hazards-portal/temp-file/<randommonkey>
                    String unzippedFilePath = null;
                    try{
                        //get the security token from DynamicReadOnlyProperties
                            String token = props.getProperty("gov.usgs.cida.coastalhazards.wps.fetch.and.unzip.process.token"); 
                            unzippedFilePath = importRasterUsingWps(token, uri); // call the wps process
                    } finally{
                        //regardless of success or failure of wps proc
                        tempFile.delete(); 
                        log.info("Deleted contents of temp file");
                    }
                    if (unzippedFilePath == null || unzippedFilePath.isEmpty()){
                        log.error("File path to unzipped geotiff returned null. Is the Geoserver wps fetchAndUnzip call working? ");
                        throw new RuntimeException("Error attempting to call wps process '" + tempFile.getAbsolutePath() + "'.");
                    }
                    
                    log.info("______File path to unzipped raster on the portal is: " + unzippedFilePath);                    
                    File unzippedFile = new File(unzippedFilePath);
                    String fileName = unzippedFile.getName();
                                        
                    // Publish the raster tiff as a layer on Geoserver  
                    GeoServerRESTPublisher publisher = new GeoServerRESTPublisher(geoServerEndpoint, geoserverUser, geoserverPass);
                    //Then use the GeoServerRESTPublisher to create the stores and layers. 
                    
                    GSCoverageEncoder coverageEncoder = new GSCoverageEncoder();
                        //potential todo: set coverageEncoder description here based on text from the metadata file, or from a service parameter
                        //this would provide descriptive info for a user browsing our GeoServer with a generic WMS client
                        coverageEncoder.setName(fileName);//(fileName);  //BUG noted below : goeserver v2.4 requires the file name match the coverage name
                        coverageEncoder.setNativeName(fileName);
                        coverageEncoder.setTitle(fileName);
                        coverageEncoder.setSRS(EPSGcode);
                        coverageEncoder.setProjectionPolicy(GSResourceEncoder.ProjectionPolicy.FORCE_DECLARED);    
                                             
                    GSLayerEncoder layerEncoder = new GSLayerEncoder();
                        layerEncoder.setDefaultStyle(DEFAULT_RASTER_STYLE);
                
                    // Geoserver Manager BUG Alert for v2.4 ...Creating a GeoTIFF coverage via REST works if the coverage's name is the same as the store name, but fails otherwise. Setting nativeName or nativeCoverageName does not help. Changing the name after creating the coverage works fine.    
                    RESTCoverageStore store = publisher.publishExternalGeoTIFF(PROXY_WORKSPACE, fileName, unzippedFile, coverageEncoder, layerEncoder); // #TODO# what to do if the workspace:fileName is already in use?

                    if (null == store) {
                            //if store or layer creation failed
                            log.info("Error publishing GeoTiff in GeoServer.");
                            rasterService = null;
                    } else {
                            String newLayerName = store.getWorkspaceName() + ":" + fileName;
                            log.info("Published GeoTiff!!!");
                            log.info("In GeoserverUtil, about to add wmsService with layer name: " + layerId);
                            rasterService = wmsService(newLayerName);
                            log.info("Added layer to wms service.");
                    }
                    return rasterService;
            }
            
}
