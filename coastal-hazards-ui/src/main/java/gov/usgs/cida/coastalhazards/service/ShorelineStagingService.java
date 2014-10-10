package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.coastalhazards.service.util.Property;
import gov.usgs.cida.coastalhazards.service.util.PropertyUtil;
import gov.usgs.cida.coastalhazards.shoreline.exception.ShorelineFileFormatException;
import gov.usgs.cida.coastalhazards.shoreline.file.IShorelineFile;
import gov.usgs.cida.coastalhazards.shoreline.file.ShorelineFile;
import gov.usgs.cida.coastalhazards.shoreline.file.ShorelineFileFactory;
import gov.usgs.cida.coastalhazards.shoreline.file.TokenToShorelineFileSingleton;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.owsutils.commons.communication.RequestResponse;
import gov.usgs.cida.owsutils.commons.communication.RequestResponse.ResponseType;
import gov.usgs.cida.owsutils.commons.properties.JNDISingleton;
import gov.usgs.cida.utilities.service.ServiceHelper;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import javax.naming.NamingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.lang.StringUtils;
import org.geotools.feature.SchemaException;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.LoggerFactory;

/**
 * Receives a shapefile from the client, reads the featuretype from it and sends
 * back a file token which will later be used to read in the shoreline file,
 * rename columns and finally import it into the geospatial server as a resource
 *
 * @author isuftin
 */
public class ShorelineStagingService extends HttpServlet {

	private static final long serialVersionUID = 2377995353146379768L;
	private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(ShorelineStagingService.class);
	private static final Integer defaultMaxFileSize = Integer.MAX_VALUE;
	private static Map<String, String> tokenMap = new HashMap<>();
	private final static String TOKEN_STRING = "token";
	private final static String ACTION_STRING = "action";
	private final static String SUCCESS_STRING = "success";
	private final static String ERROR_STRING = "error";
	private final static String STAGE_ACTION_STRING = "stage";
	private final static String IMPORT_ACTION_STRING = "import";
	private final static String READDBF_ACTION_STRING = "read-dbf";
	/**
	 * Used for lidar read-dbf call, we always fake that a lidar file is a valid
	 * shape file
	 */
	private String applicationName = null;
	private Integer maxFileSize;
	private String jndiDbConnName;

	@Override
	public void init(ServletConfig servletConfig) throws ServletException {
		super.init();

		applicationName = servletConfig.getInitParameter("application.name");

		// The maximum upload file size allowd by this server, 0 = Integer.MAX_VALUE
		String mfsJndiProp = PropertyUtil.getProperty(Property.FILE_UPLOAD_MAX_SIZE);
		if (StringUtils.isNotBlank(mfsJndiProp)) {
			maxFileSize = Integer.parseInt(mfsJndiProp);
		} else {
			maxFileSize = defaultMaxFileSize;
		}
		if (maxFileSize == 0) {
			maxFileSize = defaultMaxFileSize;
		}
		LOGGER.debug("Maximum allowable file size set to: " + maxFileSize + " bytes");

		String jndiDbInitParam = servletConfig.getInitParameter("jndi.dbconn.name.param");
		if (StringUtils.isNotBlank(jndiDbInitParam)) {
			jndiDbConnName = "jdbc/" + jndiDbInitParam;
		} else {
			jndiDbConnName = "jdbc/dsas";
		}

	}

	/**
	 * Handles the HTTP <code>POST</code> method.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException {
		boolean success = false;
		Map<String, String> responseMap = new HashMap<>();
		ResponseType responseType = ServiceHelper.getResponseType(request);

		String action = request.getParameter(ACTION_STRING);

		if (StringUtils.isBlank(action)) {
			ServiceHelper.sendNotEnoughParametersError(response, new String[]{ACTION_STRING}, responseType);
		} else if (action.equalsIgnoreCase(STAGE_ACTION_STRING)) {
			// Client is uploading a file. I want to stage the file and return a token
			ShorelineFile shorelineFile = null;
			try {
				ShorelineFileFactory shorelineFactory = new ShorelineFileFactory(request, jndiDbConnName, applicationName);
				shorelineFile = shorelineFactory.buildShorelineFile();
				String token = TokenToShorelineFileSingleton.addShorelineFile(shorelineFile);
				responseMap.put(TOKEN_STRING, token);
				success = true;
			} catch (FileUploadException | IOException | ShorelineFileFormatException ex) {
				if (shorelineFile != null) {
					shorelineFile.clear();
				}
				sendException(response, "Could not stage file", ex, responseType);
			}
		} else if (action.equalsIgnoreCase(IMPORT_ACTION_STRING)) {
			// Client is requesting to import a file associated with a token
			String token = request.getParameter(TOKEN_STRING);
			if (StringUtils.isNotBlank(token)) {
				IShorelineFile shorelineFile = null;

				try {
					shorelineFile = TokenToShorelineFileSingleton.getShorelineFile(token);
					if (null == shorelineFile || !shorelineFile.exists()) {
						throw new FileNotFoundException();
					}
					String viewName = shorelineFile.importToDatabase(request);
					shorelineFile.importToGeoserver(viewName);
					responseMap.put("layer", viewName);
					responseMap.put("workspace", shorelineFile.getWorkspace());
					success = true;
				} catch (FileNotFoundException ex) {
					responseMap.put("serverCode", "404");
					responseMap.put(ERROR_STRING, "File not found. Try re-staging file");
					responseMap.put(SUCCESS_STRING, "false");
					RequestResponse.sendErrorResponse(response, responseMap, responseType);
				} catch (ShorelineFileFormatException | IOException | SQLException | ParseException | NoSuchElementException | NamingException | SchemaException | FactoryException | TransformException ex) {
					responseMap.put(ERROR_STRING, ex.getMessage());
					responseMap.put(SUCCESS_STRING, "false");
					RequestResponse.sendErrorResponse(response, responseMap, responseType);
				} finally {
					if (shorelineFile != null) {
						shorelineFile.clear();
					}
				}
			} else {
				ServiceHelper.sendNotEnoughParametersError(response, new String[]{TOKEN_STRING}, responseType);
			}
		} else {
			ServiceHelper.sendNotEnoughParametersError(response, new String[]{STAGE_ACTION_STRING, IMPORT_ACTION_STRING}, responseType);
		}

		if (success) {
			RequestResponse.sendSuccessResponse(response, responseMap, responseType);
		}
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		ResponseType responseType = ServiceHelper.getResponseType(request);
		Map<String, String> responseMap = new HashMap<>();
		boolean success = false;

		String action = request.getParameter(ACTION_STRING);
		if (StringUtils.isBlank(action)) {
			ServiceHelper.sendNotEnoughParametersError(response, new String[]{ACTION_STRING}, responseType);
		} else if (action.equalsIgnoreCase(READDBF_ACTION_STRING)) {
			String token = request.getParameter(TOKEN_STRING);
			if (StringUtils.isBlank(token)) {
				ServiceHelper.sendNotEnoughParametersError(response, new String[]{TOKEN_STRING}, responseType);
			} else {
				// Future
				IShorelineFile shorelineFile = null;
				try {
					shorelineFile = TokenToShorelineFileSingleton.getShorelineFile(token);

					if (null == shorelineFile || !shorelineFile.exists()) {
						throw new FileNotFoundException();
					}
				} catch (FileNotFoundException ex) {
					if (null != shorelineFile) {
						shorelineFile.clear();
					}
					throw ex;
				}

				String[] columns = shorelineFile.getColumns();
				String commaSepColumns = StringUtils.join(columns, ",");
				responseMap.put("headers", commaSepColumns);
				responseMap.put("success", "true");
				success = true;
			}
		} else {
			ServiceHelper.sendNotEnoughParametersError(response, new String[]{READDBF_ACTION_STRING}, responseType);
		}

		if (success) {
			RequestResponse.sendSuccessResponse(response, responseMap, responseType);
		} else {
			RequestResponse.sendErrorResponse(response, responseMap, responseType);
		}
	}

	private void sendException(HttpServletResponse response, String error, Throwable t, ResponseType responseType) {
		Map<String, String> responseMap = new HashMap<>(1);
		responseMap.put("error", error);
		RequestResponse.sendErrorResponse(response, responseMap, responseType);
		LOGGER.warn(t.getMessage());
	}

	/**
	 * Returns a short description of the servlet.
	 *
	 * @return a String containing servlet description
	 */
	@Override
	public String getServletInfo() {
		return " * Receives a shapefile from the client, reads the featuretype from it and sends"
				+ " * back a file token which will later be used to read in the shoreline file, rename"
				+ " * columns and finally import it into the geospatial server as a resource";
	}

	/**
	 * Will try to delete files in token map on server shutdown
	 */
	@Override
	public void destroy() {
		TokenToShorelineFileSingleton.clear();
	}

}
