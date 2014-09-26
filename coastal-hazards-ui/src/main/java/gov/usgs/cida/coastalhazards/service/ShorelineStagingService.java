package gov.usgs.cida.coastalhazards.service;

import com.google.gson.Gson;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.owsutils.commons.communication.RequestResponse;
import gov.usgs.cida.owsutils.commons.communication.RequestResponse.ResponseType;
import gov.usgs.cida.owsutils.commons.properties.JNDISingleton;
import gov.usgs.cida.owsutils.commons.shapefile.utils.IterableShapefileReader;
import gov.usgs.cida.utilities.file.FileHelper;
import gov.usgs.cida.utilities.service.ServiceHelper;
import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.geotools.data.shapefile.dbf.DbaseFileHeader;
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
	private static final DynamicReadOnlyProperties props = JNDISingleton.getInstance();
	private static final String defaultFilenameParam = "qqfile";
	private static Map<String, String> tokenMap = new HashMap<>();
	private static final String DIRECTORY_BASE_PARAM_CONFIG_KEY = ".files.directory.base";
	private static final String DIRECTORY_UPLOAD_PARAM_CONFIG_KEY = ".files.directory.upload";
	private static final String DIRECTORY_WORK_PARAM_CONFIG_KEY = ".files.directory.work";
	private String applicationName = null;
	private Integer maxFileSize;
	private String propertyBasedFilenameParam;
	private File baseDirectory;
	private File uploadDirectory;
	private File workDirectory;

	@Override
	public void init(ServletConfig servletConfig) throws ServletException {
		super.init();
		applicationName = servletConfig.getInitParameter("application.name");

		// The maximum upload file size allowd by this server, 0 = Integer.MAX_VALUE
		String mfsJndiProp = props.getProperty(applicationName + ".max.upload.file.size");
		if (StringUtils.isNotBlank(mfsJndiProp)) {
			maxFileSize = Integer.parseInt(mfsJndiProp);
		} else {
			maxFileSize = defaultMaxFileSize;
		}
		if (maxFileSize == 0) {
			maxFileSize = defaultMaxFileSize;
		}
		LOGGER.debug("Maximum allowable file size set to: " + maxFileSize + " bytes");

		String fnInitParam = servletConfig.getInitParameter("filename.param");
		String fnJndiProp = props.getProperty(applicationName + ".filename.param");
		if (StringUtils.isNotBlank(fnInitParam)) {
			propertyBasedFilenameParam = fnInitParam;
		} else if (StringUtils.isNotBlank(fnJndiProp)) {
			propertyBasedFilenameParam = fnJndiProp;
		} else {
			propertyBasedFilenameParam = defaultFilenameParam;
		}

		// Base directory should be pulled from JNDI or set to the system temp directory
		baseDirectory = new File(props.getProperty(applicationName + DIRECTORY_BASE_PARAM_CONFIG_KEY, System.getProperty("java.io.tmpdir")));
		uploadDirectory = new File(baseDirectory, props.getProperty(applicationName + DIRECTORY_UPLOAD_PARAM_CONFIG_KEY));
		workDirectory = new File(baseDirectory, props.getProperty(applicationName + DIRECTORY_WORK_PARAM_CONFIG_KEY));
	}

	/**
	 * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
	 * methods.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	protected void processRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		Map<String, String> responseMap = new HashMap<>();
		boolean success = false;

		ResponseType responseType = ServiceHelper.getResponseType(request);

		String action = request.getParameter("action");

		if (StringUtils.isBlank(action)) {
			ServiceHelper.sendNotEnoughParametersError(response, new String[]{"action"}, responseType);
		} else if (action.equalsIgnoreCase("stage")) {
			try {
				responseMap = stageFile(request, propertyBasedFilenameParam, uploadDirectory.getAbsolutePath());
				success = true;
			} catch (FileUploadException ex) {
				sendExceptionalError(response, "Could not stage shapefile", ex, responseType);
			}
		} else {
			ServiceHelper.sendNotEnoughParametersError(response, new String[]{"stage"}, responseType);
		}

		if (success) {
			RequestResponse.sendSuccessResponse(response, responseMap, responseType);
		}
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException {
		ResponseType responseType = ServiceHelper.getResponseType(request);
		Map<String, String> responseMap = new HashMap<>();
		String action = request.getParameter("action");

		if (StringUtils.isBlank(action)) {
			ServiceHelper.sendNotEnoughParametersError(response, new String[]{"action"}, responseType);
		} else if (action.equalsIgnoreCase("read-dbf")) {
			String token = request.getParameter("token");
			if (StringUtils.isBlank(token)) {
				ServiceHelper.sendNotEnoughParametersError(response, new String[]{"token"}, responseType);
			} else {
				try {
					responseMap = getShapefileHeadersStringUsingToken(token);
				} catch (IOException ex) {
					sendExceptionalError(response, "Could not read shapefile header", ex, responseType);
					return;
				}
			}
		} else {
			ServiceHelper.sendNotEnoughParametersError(response, new String[]{"read-dbf"}, responseType);
		}

		if (Boolean.valueOf(responseMap.get("success"))) {
			RequestResponse.sendSuccessResponse(response, responseMap, responseType);
		} else {
			RequestResponse.sendErrorResponse(response, responseMap, responseType);
		}
	}

	private Map<String, String> getShapefileHeadersStringUsingToken(String token) throws IOException {
		Map<String, String> responseMap = new HashMap<>();
		File stagedShorelineShapefile = getFileFromToken(token, tokenMap);

		if (null != stagedShorelineShapefile && stagedShorelineShapefile.exists()) {
			// Create a new directory within the work directory
			File tempLocation = new File(workDirectory, String.valueOf(new Date().getTime()));
			FileUtils.forceMkdir(tempLocation);
			try {
				FileHelper.unzipFile(tempLocation.getAbsolutePath(), stagedShorelineShapefile);

				Collection<File> shapefiles = FileUtils.listFiles(tempLocation, new String[]{"shp"}, false);
				if (shapefiles.isEmpty()) {
					responseMap.put("error", "No shapefiles in zip");
					deleteFileUsingToken(token);
				} else if (shapefiles.size() > 1) {
					responseMap.put("error", "Multiple shapefiles in zip");
					deleteFileUsingToken(token);
				} else {
					IterableShapefileReader reader = new IterableShapefileReader(shapefiles.iterator().next());
					DbaseFileHeader dbfHeader = reader.getDbfHeader();
					int fieldCount = dbfHeader.getNumFields();
					StringBuilder headers = new StringBuilder();
					for (int headerIndex = 0; headerIndex < fieldCount; headerIndex++) {
						headers.append(dbfHeader.getFieldName(headerIndex)).append(",");
					}
					headers.deleteCharAt(headers.length() - 1);
					responseMap.put("headers", headers.toString());
					responseMap.put("success", "true");
				}
			} finally {
				FileUtils.forceDelete(tempLocation);
			}
		} else {
			tokenMap.remove(token);
			responseMap.put("error", "File not found. Try re-staging shapefile");
			responseMap.put("serverCode", "404");
			responseMap.put("success", "false");
		}
		return responseMap;
	}

	private void deleteFileUsingToken(String token) {
		File file = new File(tokenMap.get(token));
		if (FileUtils.deleteQuietly(file)) {
			LOGGER.info("Delete file " + file.getAbsolutePath() + " for token " + token);
		} else {
			LOGGER.info("Could not delete file " + file.getAbsolutePath() + " for token " + token);
		}
		tokenMap.remove(token);
	}

	private void sendExceptionalError(HttpServletResponse response, String error, Throwable t, ResponseType responseType) {
		Map<String, String> responseMap = new HashMap<>(1);
		responseMap.put("error", error);
		RequestResponse.sendErrorResponse(response, responseMap, responseType);
		LOGGER.warn(t.getMessage());
	}

	private Map<String, String> stageFile(HttpServletRequest request, String propertyBasedFilenameParam, String workDir) throws IOException, FileUploadException {
		Map<String, String> responseMap = new HashMap<>(1);
		File shapeZipFile = saveFileFromRequest(request, propertyBasedFilenameParam, workDir, true);
		String filePath = shapeZipFile.getAbsolutePath();
		String fileToken = "";

		for (String uuid : tokenMap.keySet()) {
			if (tokenMap.get(uuid).equals(filePath)) {
				fileToken = uuid;
			}
		}

		if (StringUtils.isBlank(fileToken)) {
			fileToken = UUID.randomUUID().toString();
		}

		if (StringUtils.isNotBlank(fileToken)) {
			responseMap.put("token", fileToken);
			tokenMap.put(responseMap.get("token"), filePath);
		} else {
			throw new IOException("Could not create file token.");
		}
		return responseMap;
	}

	/**
	 * Given a map of token to file path string lookups, returns a File object
	 *
	 * @param token
	 * @param tokenToFileMap
	 * @return null if file or token does not exist
	 */
	private File getFileFromToken(String token, Map<String, String> tokenToFileMap) {
		File result = null;
		if (tokenToFileMap.containsKey(token)) {
			File resultFile = new File(tokenToFileMap.get(token));
			if (resultFile.exists()) {
				result = resultFile;
			}
		}
		return result;

	}

	private File saveFileFromRequest(HttpServletRequest request, String defaultFileParam, String workDir, boolean overwrite) throws IOException, FileUploadException {
		// The key to search for in the upload form post to find the file
		String filenameParam = defaultFileParam;
		String fnReqParam = request.getParameter("filename.param");
		if (StringUtils.isNotBlank(fnReqParam)) {
			filenameParam = fnReqParam;
		}
		LOGGER.debug("Filename parameter set to: " + filenameParam);

		LOGGER.debug("Cleaning file name.\nWas: " + filenameParam);
		String filename = cleanFileName(request.getParameter(filenameParam));
		LOGGER.debug("Is: " + filename);
		if (filenameParam.equals(filename)) {
			LOGGER.debug("(No change)");
		}

		File shapeZipFile = new File(workDir + File.separator + filename);
		LOGGER.debug("Temporary file set to " + shapeZipFile.getPath());

		if (overwrite) {
			if (shapeZipFile.delete()) {
				LOGGER.debug("File already existed on server. Deleted before re-saving.");
			}
		}

		RequestResponse.saveFileFromRequest(request, shapeZipFile, filenameParam);

		return shapeZipFile;
	}

	private String cleanFileName(String input) {
		String updated = input;

		// Test the first character and if numeric, prepend with underscore
		if (input.substring(0, 1).matches("[0-9]")) {
			updated = "_" + input;
		}

		// Test the rest of the characters and replace anything that's not a 
		// letter, digit or period with an underscore
		char[] inputArr = updated.toCharArray();
		for (int cInd = 0; cInd < inputArr.length; cInd++) {
			if (!Character.isLetterOrDigit(inputArr[cInd]) && !(inputArr[cInd] == '.')) {
				inputArr[cInd] = '_';
			}
		}
		return String.valueOf(inputArr);
	}

	/**
	 * Handles the HTTP <code>POST</code> method.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		processRequest(request, response);
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
		for (String filePath : tokenMap.values()) {
			File deleteMe = new File(filePath);
			if (deleteMe.exists() && deleteMe.isFile()) {
				try {
					FileUtils.forceDelete(deleteMe);
					LOGGER.debug("SShutting down, deleted {} ", filePath);
				} catch (IOException ex) {
					LOGGER.debug("Shutting down but could not delete file " + filePath, ex);
				}
			}
		}
	}
}
