package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.GeoserverHandler;
import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.file.FileHelper;
import gov.usgs.cida.coastalhazards.metadata.MetadataValidator;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public class PublishService extends HttpServlet {

	private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(PublishService.class);
	private static DynamicReadOnlyProperties props = null;
	private static GeoserverHandler geoserverHandler = null;
	private static String geoserverEndpoint = null;
	private static String geoserverUsername = null;
	private static String geoserverPassword = null;
	private static String publishedWorkspaceName = null;
	private static String GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.endpoint";
	private static String GEOSERVER_USER_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.username";
	private static String GEOSERVER_PASS_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.password";
	private static String PUBLISHED_WS_PARAM_CONFIG_KEY = "coastal-hazards.workspace.published";
	private static final long serialVersionUID = 1L;

	@Override
	public void init() throws ServletException {
		super.init();
		props = JNDISingleton.getInstance();
		geoserverEndpoint = props.getProperty(GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY);
		geoserverUsername = props.getProperty(GEOSERVER_USER_PARAM_CONFIG_KEY);
		geoserverPassword = props.getProperty(GEOSERVER_PASS_PARAM_CONFIG_KEY);
		publishedWorkspaceName = props.getProperty(PUBLISHED_WS_PARAM_CONFIG_KEY, "published");
		geoserverHandler = new GeoserverHandler(geoserverEndpoint, geoserverUsername, geoserverPassword);
	}

	/**
	 * Processes requests for both HTTP
	 * <code>GET</code> and
	 * <code>POST</code> methods.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	protected void processRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/html;charset=UTF-8");
		File tempFile = File.createTempFile("metadata", ".xml");
		String layer = ""; //request.getParameter("md-layers-select");
        
		Map<String, String> responseMap = new HashMap<String, String>();
		if (tempFile.exists()) {
			tempFile.delete();
		}
		try {
            if (ServletFileUpload.isMultipartContent(request)) {
                FileItemFactory factory = new DiskFileItemFactory();
                ServletFileUpload upload = new ServletFileUpload(factory);
                FileItemIterator iter = upload.getItemIterator(request);
                while (iter.hasNext()) {
                    FileItemStream item = iter.next();
                    if (item.isFormField()) {
                        if ("md-layers-select".equals(item.getFieldName())) {
                            layer = IOUtils.toString(item.openStream());
                        }
                    } else {
                        FileHelper.saveFileFromInputStream(item.openStream(), tempFile);
                    }
                }
            }
            // Do you stuff here
            MetadataValidator validator = new MetadataValidator(tempFile);
			// Validate ...
			// Do CSW stuff here ...
			
			// Time to publish ...
			String workspaceName = layer.split(":")[0];
			String layerName = layer.split(":")[1];
			String storeName = layerName.toLowerCase().contains("result") ? "ch-output" : "ch-input";
			HttpResponse wpsResponse = geoserverHandler.sendWPSRequest(createPublishRequest(workspaceName, storeName, layerName));

			String httpResponse = IOUtils.toString(wpsResponse.getEntity().getContent());

			responseMap.put("response", httpResponse);
			if (httpResponse.toLowerCase().contains("exception")) {
				RequestResponseHelper.sendErrorResponse(response, responseMap);
			} else {
				RequestResponseHelper.sendSuccessResponse(response, responseMap);
			}

		} catch (FileUploadException ex) {
			responseMap.put("message", ex.getMessage());
			RequestResponseHelper.sendErrorResponse(response, responseMap);
		} finally {
			FileUtils.deleteQuietly(tempFile);
		}


	}

	private String createPublishRequest(String workspace, String store, String layer) {
		StringBuilder response = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")
				.append("<wps:Execute version=\"1.0.0\" service=\"WPS\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.opengis.net/wps/1.0.0\" xmlns:wfs=\"http://www.opengis.net/wfs\" xmlns:wps=\"http://www.opengis.net/wps/1.0.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:gml=\"http://www.opengis.net/gml\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:wcs=\"http://www.opengis.net/wcs/1.1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd\">")
				.append("<ows:Identifier>gs:CopyLayer</ows:Identifier>")
				.append("<wps:DataInputs>")
				.append("<wps:Input>")
				.append("<ows:Identifier>source-workspace</ows:Identifier>")
				.append("<wps:Data>")
				.append("<wps:LiteralData>").append(workspace).append("</wps:LiteralData>")
				.append("</wps:Data>")
				.append("</wps:Input>")
				.append("<wps:Input>")
				.append("<ows:Identifier>source-store</ows:Identifier>")
				.append("<wps:Data>")
				.append("<wps:LiteralData>").append(store).append("</wps:LiteralData>")
				.append("</wps:Data>")
				.append("</wps:Input>")
				.append("<wps:Input>")
				.append("<ows:Identifier>source-layer</ows:Identifier>")
				.append("<wps:Data>")
				.append("<wps:LiteralData>").append(layer).append("</wps:LiteralData>")
				.append("</wps:Data>")
				.append("</wps:Input>")
				.append("<wps:Input>")
				.append("<ows:Identifier>target-workspace</ows:Identifier>")
				.append("<wps:Data>")
				.append("<wps:LiteralData>").append(publishedWorkspaceName).append("</wps:LiteralData>")
				.append("</wps:Data>")
				.append("</wps:Input>")
				.append("<wps:Input>")
				.append("<ows:Identifier>target-store</ows:Identifier>")
				.append("<wps:Data>")
				.append("<wps:Data>")
				.append("<wps:LiteralData>").append(store.equals("ch-input") ? "Coastal Hazards Input" : "Coastal Hazards Output").append("</wps:LiteralData>")
				.append("</wps:Data>")
				.append("</wps:Input>")
				.append("</wps:DataInputs>")
				.append("<wps:ResponseForm>")
				.append("<wps:RawDataOutput>")
				.append("<ows:Identifier>String</ows:Identifier>")
				.append("</wps:RawDataOutput>")
				.append("</wps:ResponseForm>")
				.append("</wps:Execute>");
		return response.toString();
	}

	// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
	/**
	 * Handles the HTTP
	 * <code>GET</code> method.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		processRequest(request, response);
	}

	/**
	 * Handles the HTTP
	 * <code>POST</code> method.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		processRequest(request, response);
	}

	/**
	 * Returns a short description of the servlet.
	 *
	 * @return a String containing servlet description
	 */
	@Override
	public String getServletInfo() {
		return "Short description";
	}// </editor-fold>
}
