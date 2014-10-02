package gov.usgs.cida.coastalhazards.service;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.uncy.Xploder;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.owsutils.commons.communication.RequestResponse;
import gov.usgs.cida.owsutils.commons.communication.RequestResponse.ResponseType;
import gov.usgs.cida.owsutils.commons.properties.JNDISingleton;
import gov.usgs.cida.owsutils.commons.shapefile.utils.FeatureCollectionFromShp;
import gov.usgs.cida.owsutils.commons.shapefile.utils.IterableShapefileReader;
import gov.usgs.cida.utilities.file.FileHelper;
import gov.usgs.cida.utilities.service.ServiceHelper;
import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import org.apache.commons.collections.BidiMap;
import org.apache.commons.collections.bidimap.DualHashBidiMap;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.filefilter.HiddenFileFilter;
import org.apache.commons.io.filefilter.PrefixFileFilter;
import org.apache.commons.lang.StringUtils;
import org.geotools.data.crs.ReprojectFeatureResults;
import org.geotools.data.shapefile.dbf.DbaseFileHeader;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.SchemaException;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.postgis.PGgeometry;
import org.postgis.Point;
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
	private final static String TOKEN_STRING = "token";
	private String applicationName = null;
	private Integer maxFileSize;
	private String propertyBasedFilenameParam;
	private File baseDirectory;
	private File uploadDirectory;
	private File workDirectory;
	private String jndiDbConnName;

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

		String jndiDbInitParam = servletConfig.getInitParameter("jndi.dbconn.name.param");
		if (StringUtils.isNotBlank(jndiDbInitParam)) {
			jndiDbConnName = "jdbc/" + jndiDbInitParam;
		} else {
			jndiDbConnName = "jdbc/dsas";
		}

		// Base directory should be pulled from JNDI or set to the system temp directory
		baseDirectory = new File(props.getProperty(applicationName + DIRECTORY_BASE_PARAM_CONFIG_KEY, System.getProperty("java.io.tmpdir")));
		uploadDirectory = new File(baseDirectory, props.getProperty(applicationName + DIRECTORY_UPLOAD_PARAM_CONFIG_KEY));
		workDirectory = new File(baseDirectory, props.getProperty(applicationName + DIRECTORY_WORK_PARAM_CONFIG_KEY));
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
		} else if (action.equalsIgnoreCase("import")) {
			String token = request.getParameter(TOKEN_STRING);
			if (StringUtils.isBlank(token)) {
				ServiceHelper.sendNotEnoughParametersError(response, new String[]{TOKEN_STRING}, responseType);
			} else {
				File shapeFile = getFileFromToken(token, tokenMap);
				if (shapeFile == null) {
					tokenMap.remove(token);
					responseMap.put("error", "File not found. Try re-staging shapefile");
					responseMap.put("serverCode", "404");
					responseMap.put("success", "false");
				} else {
					String columnsString = request.getParameter("columns");
					String workspace = request.getParameter("workspace");
					Map<String, String> columns = new HashMap<>();
					if (StringUtils.isNotBlank(columnsString)) {
						columns = (Map<String, String>) new Gson().fromJson(columnsString, Map.class);
					}

					try {
						importShapefile(shapeFile, workspace, columns);
					} catch (ParseException |
							SQLException |
							SchemaException |
							TransformException |
							NoSuchElementException |
							FactoryException ex) {
						responseMap.put("error", ex.getMessage());
						RequestResponse.sendErrorResponse(response, responseMap, responseType);
					} catch (Exception ex) {
						responseMap.put("error", ex.getMessage());
						RequestResponse.sendErrorResponse(response, responseMap, responseType);
					} finally {
						deleteExistingPointFiles(shapeFile.getParentFile());
					}

					success = true;

				}
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
			String token = request.getParameter(TOKEN_STRING);
			if (StringUtils.isBlank(token)) {
				ServiceHelper.sendNotEnoughParametersError(response, new String[]{TOKEN_STRING}, responseType);
			} else {
				responseMap = getShapefileHeadersStringUsingToken(token);
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

	private void importShapefile(File shpFile, String workspace, Map<String, String> columnRenames) throws NamingException, ParseException, SQLException, IOException, SchemaException, TransformException, NoSuchElementException, FactoryException, Exception {
		BidiMap bm = new DualHashBidiMap(columnRenames);
		String dateFieldName = (String) bm.getKey("Date_");
		String uncertaintyFieldName = (String) bm.getKey("uncy");
		String mhwFieldName = (String) bm.getKey("MHW");
		String orientation = "";

		// First delete any previously exploded point files
		deleteExistingPointFiles(shpFile.getParentFile());

		// Explode the shapefile to a points file
		File pointsShapefile;
		Xploder xploder = new Xploder(uncertaintyFieldName, Double.class);
		pointsShapefile = xploder.explode(shpFile.getParent() + File.separator + FilenameUtils.getBaseName(shpFile.getName()));
		try (Connection connection = getConnection()) {
			FeatureCollection<SimpleFeatureType, SimpleFeature> fc = FeatureCollectionFromShp.getFeatureCollectionFromShp(pointsShapefile.toURI().toURL());

			if (!fc.isEmpty()) {
				connection.setAutoCommit(false);
				SimpleFeature sf = fc.features().next();
				Class<?> dateType = sf.getAttribute(dateFieldName).getClass();
				Class<?> uncertaintyType = sf.getAttribute(uncertaintyFieldName).getClass();

				// First enter the shoreline
				boolean mhw = false;
				Date date = getDateFromFC(dateFieldName, sf, dateType);
				String source = getSourceFromFC(sf);
				if (StringUtils.isNotBlank(mhwFieldName)) {
					mhw = getMHWFromFC(mhwFieldName, sf, dateType);
				}

				long shorelineId;
				int insertedPoints;
				try {
					shorelineId = insertToShorelinesTable(connection, workspace, date, mhw, source, orientation, mhwFieldName);
					insertedPoints = insertPointIntoShorelinePointsTable(connection, shorelineId, fc, uncertaintyFieldName, uncertaintyType);
				} catch (IOException | SQLException | NoSuchElementException | NamingException | SchemaException | FactoryException | TransformException ex) {
					connection.rollback();
					throw ex;
				}
				
				connection.commit();
			}
		}
	}

	private long insertToShorelinesTable(Connection connection, String workspace, Date date, boolean mhw, String source, String orientation, String auxillaryName) throws NamingException, SQLException {
		String sql = "INSERT INTO shorelines "
				+ "(id, date, mhw, workspace, source, orientation, auxillary_name) "
				+ "VALUES (1,?,?,?,?,?,?)";
//		String sql = "INSERT INTO shorelines "
//				+ "(date, mhw, workspace, source, orientation, auxillary_name) "
//				+ "VALUES (?,?,?,?,?,?)";

		long createdId;

		try (PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
			ps.setDate(1, new java.sql.Date(date.getTime()));
			ps.setBoolean(2, mhw);
			ps.setString(3, workspace);
			ps.setString(4, source);
			ps.setString(5, orientation);
			ps.setString(6, auxillaryName);

			int affectedRows = ps.executeUpdate();
			if (affectedRows == 0) {
				throw new SQLException("Inserting a shoreline row failed. No rows affected");
			}

			try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
				if (generatedKeys.next()) {
					createdId = generatedKeys.getLong(1);
				} else {
					throw new SQLException("Inserting a shoreline row failed. No ID obtained");
				}
			}
		}

		return createdId;
	}

	private int insertPointIntoShorelinePointsTable(Connection connection, long shorelineId, FeatureCollection<SimpleFeatureType, SimpleFeature> fc, String uncertaintyFieldName, Class<?> uncertaintyType) throws IOException, SchemaException, TransformException, NoSuchElementException, FactoryException, SQLException {
		int insertCount = 0;
		ReprojectFeatureResults reprojectedFc = new ReprojectFeatureResults(fc, DefaultGeographicCRS.WGS84);
		Iterator<SimpleFeature> iter = reprojectedFc.iterator();
		int count = 1;
		while (iter.hasNext()) {
			SimpleFeature sf = iter.next();
			double x = reprojectedFc.getBounds().getMaxX();
			double y = reprojectedFc.getBounds().getMaxY();
			double uncertainty = getUncertaintyFromFC(uncertaintyFieldName, sf, uncertaintyType);
			int segmentId = getSegmentIdFromFC("segmentId", sf);
			
			String sql = "INSERT INTO shoreline_points " +
					"(id, shoreline_id, segment_id, geom, uncy) " +
					"VALUES ("+ count +",?,?,?,?)";
			
			try (PreparedStatement ps = connection.prepareStatement(sql)) {
				ps.setLong(1, shorelineId);
				ps.setInt(2, segmentId);
				ps.setObject(3, new PGgeometry(new Point(x,y)));
				ps.setDouble(4, uncertainty);
				insertCount += ps.executeUpdate();
				count++;
			}

		}
		return insertCount;
	}

	private Connection getConnection() {
		Connection con = null;
		try {
			Context initCtx = new InitialContext();
			Context envCtx = (Context) initCtx.lookup("java:comp/env");
			DataSource ds = (DataSource) envCtx.lookup(jndiDbConnName);
			con = ds.getConnection();
			((org.postgresql.PGConnection)con).addDataType("geometry", Class.forName("org.postgis.PGeometry"));
		} catch (SQLException | NamingException | ClassNotFoundException ex) {
			LOGGER.error("Could not create database connection", ex);
		}
		return con;
	}

	private Date getDateFromFC(String dateFieldName, SimpleFeature sf, Class<?> fromType) throws ParseException {
		Date result = null;

		if (fromType == java.lang.String.class) {
			String dateString = (String) sf.getAttribute(dateFieldName);
			try {
				result = new SimpleDateFormat("MM/dd/yyyy").parse(dateString);
			} catch (ParseException ex) {
				LOGGER.debug("Could not parse date in format 'MM/dd/yyyy' - Will try non-padded", ex);
			}

			if (null == result) {
				result = new SimpleDateFormat("M/d/yyyy").parse(dateString);
			}
		} else if (fromType == java.util.Date.class) {
			result = (Date) sf.getAttribute(dateFieldName);
		}

		return result;
	}

	private double getUncertaintyFromFC(String uncyFieldName, SimpleFeature sf, Class<?> fromType) {
		Object uncy = sf.getAttribute(uncyFieldName);
		if (fromType == java.lang.String.class) {
			return Double.parseDouble((String) uncy);
		} else if (uncy instanceof java.lang.Number) {
			return (double) uncy;
		}

		throw new NumberFormatException("Could not parse uncertainty into double");
	}

	private boolean getMHWFromFC(String mhwFieldName, SimpleFeature sf, Class<?> fromType) throws ParseException {
		Object mhw = sf.getAttribute(mhwFieldName);
		if (fromType == java.lang.String.class) {
			return Boolean.parseBoolean((String) mhw);
		} else if (fromType == java.lang.Boolean.class) {
			return (boolean) mhw;
		}

		throw new ParseException("Could not parse MHW field " + mhwFieldName + " into boolean", 0);
	}

	private String getSourceFromFC(SimpleFeature sf) {
		String source = "";
		for (AttributeDescriptor d : sf.getFeatureType().getAttributeDescriptors()) {
			if ("source".equalsIgnoreCase(d.getLocalName()) || ("src".equalsIgnoreCase(d.getLocalName()))) {
				return (String) sf.getAttribute(d.getLocalName());
			}
		}
		return source;
	}
	
	private int getSegmentIdFromFC(String segmentIdName, SimpleFeature sf) {
		return (int) sf.getAttribute(segmentIdName);
	}

	private Collection<File> deleteExistingPointFiles(File directory) {
		Collection<File> existingPointFiles = FileUtils.listFiles(directory, new PrefixFileFilter("*_pts"), null);
		for (File existingPtFile : existingPointFiles) {
			existingPtFile.delete();
		}
		return existingPointFiles;
	}

	private Map<String, String> getShapefileHeadersStringUsingToken(String token) {
		Map<String, String> responseMap = new HashMap<>();
		File shapefile = getFileFromToken(token, tokenMap);

		if (null != shapefile && shapefile.exists()) {
			// Create a new directory within the work directory
			IterableShapefileReader reader = new IterableShapefileReader(shapefile);
			DbaseFileHeader dbfHeader = reader.getDbfHeader();
			int fieldCount = dbfHeader.getNumFields();
			StringBuilder headers = new StringBuilder();
			for (int headerIndex = 0; headerIndex < fieldCount; headerIndex++) {
				headers.append(dbfHeader.getFieldName(headerIndex)).append(",");
			}
			headers.deleteCharAt(headers.length() - 1);
			responseMap.put("headers", headers.toString());
			responseMap.put("success", "true");
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
		File shapefile = saveShapefileFromRequest(request, propertyBasedFilenameParam, workDir, true);
		String shapefilePathString = shapefile.getAbsolutePath();
		String fileToken = "";

		for (String uuid : tokenMap.keySet()) {
			if (tokenMap.get(uuid).equals(shapefilePathString)) {
				fileToken = uuid;
			}
		}

		if (StringUtils.isBlank(fileToken)) {
			fileToken = UUID.randomUUID().toString();
		}

		if (StringUtils.isNotBlank(fileToken)) {
			responseMap.put(TOKEN_STRING, fileToken);
			tokenMap.put(responseMap.get(TOKEN_STRING), shapefilePathString);
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

	private File saveShapefileFromRequest(HttpServletRequest request, String defaultFileParam, String workDir, boolean overwrite) throws IOException, FileUploadException {
		// The key to search for in the upload form post to find the file
		String filenameParam = defaultFileParam;
		String fnReqParam = request.getParameter("filename.param");
		if (StringUtils.isNotBlank(fnReqParam)) {
			filenameParam = fnReqParam;
		}
		LOGGER.debug("Filename parameter set to: {}", filenameParam);

		LOGGER.debug("Cleaning file name.\nWas: {}", filenameParam);
		String zipFileName = cleanFileName(request.getParameter(filenameParam));
		LOGGER.debug("Is: {}", zipFileName);
		if (filenameParam.equals(zipFileName)) {
			LOGGER.debug("(No change)");
		}

		// Create a subdirectory inside the work directory where this shapefile
		// will be saved to
		String shapefileName = zipFileName.substring(0, zipFileName.lastIndexOf("."));
		File saveDirectory = new File(workDir + File.separator + shapefileName);
		if (!saveDirectory.exists()) {
			FileUtils.forceMkdir(saveDirectory);
		}

		if (overwrite) {
			try {
				FileUtils.cleanDirectory(saveDirectory);
			} catch (IOException ex) {
				LOGGER.debug("Could not clean save directory at " + saveDirectory.getAbsolutePath(), ex);
			}
			LOGGER.debug("File already existed on server. Deleted before re-saving.");
		}

		File shapeZipFile = new File(saveDirectory, zipFileName);
		LOGGER.debug("Temporary file set to {}", shapeZipFile.getAbsolutePath());

		try {
			// Save and unzip the file
			RequestResponse.saveFileFromRequest(request, shapeZipFile, filenameParam);
			LOGGER.debug("Shapefile saved");

			gov.usgs.cida.owsutils.commons.io.FileHelper.flattenZipFile(shapeZipFile.getAbsolutePath());
			LOGGER.debug("Shapefile zip structure flattened");

			gov.usgs.cida.owsutils.commons.io.FileHelper.validateShapefileZip(shapeZipFile);
			LOGGER.debug("Shapefile verified");

			FileHelper.unzipFile(saveDirectory.getAbsolutePath(), shapeZipFile);
			LOGGER.debug("Shapefile unzipped");

			// Delete the zip file
			if (shapeZipFile.delete()) {
				LOGGER.debug("Deleted zipped shapefile");
			} else {
				LOGGER.debug("Could not delete shapefile zip at {}", shapeZipFile.getAbsolutePath());
			}

			Collection<File> shapeFileParts = FileUtils.listFiles(saveDirectory, HiddenFileFilter.VISIBLE, null);
			for (File file : shapeFileParts) {
				String oldFilename = file.getName();
				String newFilename = shapefileName + "." + FilenameUtils.getExtension(file.getName());
				FileHelper.renameFile(file, newFilename);
				LOGGER.debug("Renamed {} to {}", oldFilename, newFilename);
			}
		} catch (FileUploadException | IOException ex) {
			FileUtils.deleteQuietly(saveDirectory);
			throw ex;
		}

		return new File(saveDirectory, shapefileName + ".shp");
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

	private File createTempLocation() throws IOException {
		File tempLocation = new File(workDirectory, String.valueOf(new Date().getTime()));
		FileUtils.forceMkdir(tempLocation);
		tempLocation.deleteOnExit();
		return tempLocation;
	}

	/**
	 * Will try to delete files in token map on server shutdown
	 */
	@Override
	public void destroy() {
		for (String filePath : tokenMap.values()) {
			File deleteMe = new File(filePath);
			if (deleteMe.exists()) {
				try {
					FileUtils.forceDelete(deleteMe);
					LOGGER.debug("Shutting down, deleted {} ", filePath);
				} catch (IOException ex) {
					LOGGER.debug("Shutting down but could not delete file " + filePath, ex);
				}
			}
		}
	}

}
