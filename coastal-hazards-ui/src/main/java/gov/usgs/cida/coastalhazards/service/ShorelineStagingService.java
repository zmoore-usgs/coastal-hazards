package gov.usgs.cida.coastalhazards.service;

import com.google.gson.Gson;

import gov.usgs.cida.coastalhazards.service.exception.LidarFileFormatException;
import gov.usgs.cida.coastalhazards.service.util.ImportUtil;
import gov.usgs.cida.coastalhazards.service.util.LidarFileUtils;
import gov.usgs.cida.coastalhazards.uncy.Xploder;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.owsutils.commons.communication.RequestResponse;
import gov.usgs.cida.owsutils.commons.communication.RequestResponse.ResponseType;
import gov.usgs.cida.owsutils.commons.io.exception.ShapefileFormatException;
import gov.usgs.cida.owsutils.commons.properties.JNDISingleton;
import gov.usgs.cida.owsutils.commons.shapefile.utils.FeatureCollectionFromShp;
import gov.usgs.cida.owsutils.commons.shapefile.utils.IterableShapefileReader;
import gov.usgs.cida.utilities.communication.GeoserverHandler;
import gov.usgs.cida.utilities.service.ServiceHelper;
import it.geosolutions.geoserver.rest.GeoServerRESTManager;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;
import it.geosolutions.geoserver.rest.HTTPUtils;
import it.geosolutions.geoserver.rest.encoder.GSLayerEncoder;
import it.geosolutions.geoserver.rest.encoder.GSResourceEncoder;
import it.geosolutions.geoserver.rest.encoder.datastore.GSPostGISDatastoreEncoder;
import it.geosolutions.geoserver.rest.encoder.feature.GSFeatureTypeEncoder;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

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
import org.apache.commons.io.filefilter.PrefixFileFilter;
import org.apache.commons.lang.StringUtils;
import org.apache.http.Header;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.impl.client.DefaultHttpClient;
import org.geotools.data.crs.ReprojectFeatureResults;
import org.geotools.data.shapefile.dbf.DbaseFileHeader;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.SchemaException;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
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
	private static final DynamicReadOnlyProperties props = JNDISingleton.getInstance();
	private static final String defaultFilenameParam = "qqfile";
	private static Map<String, String> tokenMap = new HashMap<>();
	private static final String DIRECTORY_BASE_PARAM_CONFIG_KEY = ".files.directory.base";
	private static final String DIRECTORY_UPLOAD_PARAM_CONFIG_KEY = ".files.directory.upload";
	private static final String DIRECTORY_WORK_PARAM_CONFIG_KEY = ".files.directory.work";
	private static final String GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY = ".geoserver.endpoint";
	private static final String GEOSERVER_USER_PARAM_CONFIG_KEY = ".geoserver.username";
	private static final String GEOSERVER_PASS_PARAM_CONFIG_KEY = ".geoserver.password";
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
	private final static String DATE_FIELD_NAME = "Date_";
	private final static String UNCY_FIELD_NAME = "Uncy";
	private final static String MHW_FIELD_NAME = "MHW";
	private final static String[] EXPECTED_SHAPEFILE_ATTRS = new String[] {
		DATE_FIELD_NAME, UNCY_FIELD_NAME, MHW_FIELD_NAME
	};
	private String geoserverEndpoint = null;
	private String geoserverUsername = null;
	private String geoserverPassword = null;
	private String applicationName = null;
	private Integer maxFileSize;
	private String propertyBasedFilenameParam;
	private File baseDirectory;
	private File uploadDirectory;
	private File workDirectory;
	private String jndiDbConnName;
	private transient GeoserverHandler geoserverHandler = null;
	private transient GeoServerRESTManager gsrm = null;

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

		// Set up Geoserver manager
		geoserverEndpoint = props.getProperty(applicationName + GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY);
		geoserverUsername = props.getProperty(applicationName + GEOSERVER_USER_PARAM_CONFIG_KEY);
		geoserverPassword = props.getProperty(applicationName + GEOSERVER_PASS_PARAM_CONFIG_KEY);
		geoserverHandler = new GeoserverHandler(geoserverEndpoint, geoserverUsername, geoserverPassword);
		try {
			gsrm = new GeoServerRESTManager(new URL(geoserverEndpoint), geoserverUsername, geoserverPassword);
		} catch (MalformedURLException ex) {
			LOGGER.error("Could not initialize Geoserver REST Manager. Application will not be able to handle shapefile uploads", ex);
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
			try {
				String savedFilePath = stageFile(request, propertyBasedFilenameParam, uploadDirectory.getAbsolutePath());
				responseMap.put(TOKEN_STRING, savedFilePath);
				success = true;
			} catch (FileUploadException | IOException | ShapefileFormatException | LidarFileFormatException ex) {
				sendException(response, "Could not stage file", ex, responseType);
			}
		} else if (action.equalsIgnoreCase(IMPORT_ACTION_STRING)) {
			// Client is requesting to import a file associated with a token
			String token = request.getParameter(TOKEN_STRING);
			if (StringUtils.isNotBlank(token)) {
				try {
					String workspace = importShorelineFile(request);
					if (!createWorkspaceInGeoserver(workspace)) {
						throw new IOException("Could not create workspace");
					}

					if (!createDatastoreInGeoserver(workspace, workspace)) {
						throw new IOException("Could not create data store");
					}

					if (!createLayerInGeoserver(workspace, workspace)) {
						throw new IOException("Could not create data store");
					}

					touchWorkspace(workspace);

					success = true;
				} catch (FileNotFoundException ex) {
					responseMap.put("serverCode", "404");
					responseMap.put(ERROR_STRING, "File not found. Try re-staging file");
					responseMap.put(SUCCESS_STRING, "false");
					RequestResponse.sendErrorResponse(response, responseMap, responseType);
				} catch (Exception ex) {
					responseMap.put(ERROR_STRING, ex.getMessage());
					responseMap.put(SUCCESS_STRING, "false");
					RequestResponse.sendErrorResponse(response, responseMap, responseType);
				} finally {
					deleteFileUsingToken(token);
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
				responseMap = getShorelineFileHeadersStringUsingToken(token);
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

	private boolean createWorkspaceInGeoserver(String workspace) throws URISyntaxException {
		if (!gsrm.getReader().getWorkspaceNames().contains(workspace)) {
			return gsrm.getPublisher().createWorkspace(workspace, new URI("gov.usgs.cida.ch" + workspace));
		}
		return true;
	}

	private boolean createDatastoreInGeoserver(String workspace, String storeName) {
		if (gsrm.getReader().getDatastore(workspace, storeName) == null) {
			GSPostGISDatastoreEncoder pg = new GSPostGISDatastoreEncoder(workspace);
			pg.setNamespace("gov.usgs.cida.ch." + workspace);
			pg.setExposePrimaryKeys(false);
			pg.setSchema("public");
			pg.setJndiReferenceName("java:comp/env/jdbc/dsas");
			return gsrm.getStoreManager().create(workspace, pg);
		}
		return true;
	}

	private boolean createLayerInGeoserver(String workspace, String storename) {
		if (gsrm.getReader().getLayer(workspace, storename) == null) {
			GSFeatureTypeEncoder fte = new GSFeatureTypeEncoder();
			fte.setSRS("EPSG:4326");
			fte.setNativeCRS("EPSG:4326");
			fte.setEnabled(true);
			fte.setProjectionPolicy(GSResourceEncoder.ProjectionPolicy.FORCE_DECLARED);
			// Why is this lower-cased you might ask?
			// http://permalink.gmane.org/gmane.comp.gis.geoserver.user/29227
			// If this is sent in its normal case, Geoserver <-> Postgres errors aplenty
			// I've since changed the session to be all lowercase anyway, but keeping
			// this here as a mark of shame against Geoserver. FOR SHAME!
			fte.setName(workspace.toLowerCase() + "_view_shorelines");

			GSLayerEncoder le = new GSLayerEncoder();
			le.setEnabled(true);
			le.setQueryable(Boolean.TRUE);
			return gsrm.getPublisher().publishDBLayer(workspace, storename, fte, le);
		}
		return true;
	}

	private boolean reloadStore(String workspace, String storename) {
		boolean reloaded = false;
		try {
			reloaded = gsrm.getPublisher().reloadStore(workspace, storename, GeoServerRESTPublisher.StoreType.DATASTORES);
		} catch (IllegalArgumentException | MalformedURLException ex) {
			LOGGER.info("Could not reload Geoserver store", ex);
		}
		return reloaded;
	}

	/**
	 * When creating 
	 * @param workspace
	 * @return 
	 */
	private boolean touchWorkspace(String workspace) {
		String content = "<workspace><name>"+workspace+"</name></workspace>";
		return "".equals(HTTPUtils.putXml(geoserverEndpoint + "/rest/workspaces/" + workspace, content, geoserverUsername, geoserverPassword));
	}

	private String importShorelineFile(HttpServletRequest request) throws NamingException, ParseException, SQLException, IOException, SchemaException, TransformException, NoSuchElementException, FactoryException, Exception {
		String token = request.getParameter(TOKEN_STRING);
		File shorelineFile = getFileFromToken(token, tokenMap);
		if (null == shorelineFile) {
			throw new FileNotFoundException();
		}

		if (LidarFileUtils.isLidar(shorelineFile)) {
			return importLidarfile(request, shorelineFile);
		} else {
			return importShapefile(request, shorelineFile);
		}
	}

	private String importLidarfile(HttpServletRequest request, File lidarFile) throws NamingException, ParseException, SQLException, IOException, SchemaException, TransformException, NoSuchElementException, FactoryException, Exception {
		String workspace = request.getParameter("workspace");
		HashMap<String, Long> shorelineDateToIdMap = new HashMap<>();
		SimpleDateFormat dtFormat = new SimpleDateFormat("MM/dd/yyyy");
		
		String projection = "4326"; //TODO can we get this from the prj file?
		
		try (
				Connection connection = getConnection();
				BufferedReader br = new BufferedReader(new FileReader(lidarFile))) {

			String line = "";
			int row = 0;
			while ((line = br.readLine()) != null) {
				row++;
				
				// use comma as separator
				String[] point = line.split(",");

				//validation
				if(row == 1) {
					LidarFileUtils.validateHeaderRow(point);
					continue;
				} else {
					LidarFileUtils.validateDataRow(point);
				}
				
				//shorline id
				long shorelineId;
				String shorelineDate = point[4];
				if(!shorelineDateToIdMap.keySet().contains(shorelineDate)) { //if we have not used this shoreline date yet, go ahead create new shoreline record
					shorelineId = insertToShorelinesTable(
							connection, 
							workspace, 
							dtFormat.parse(shorelineDate), 
							true, //lidar always has MHW = true 
							lidarFile.getName(), 
							"", 
							MHW_FIELD_NAME);
					shorelineDateToIdMap.put(shorelineDate, shorelineId);
				} else {
					shorelineId = shorelineDateToIdMap.get(shorelineDate);
				}
				
				insertPointIntoShorelinePointsTable(
						connection, 
						shorelineId, 
						Integer.valueOf(point[0]), 
						Double.valueOf(point[1]), 
						Double.valueOf(point[2]), 
						Double.valueOf(point[3]),
						projection
						);
			}

		}

		return workspace;
	}

	private String importShapefile(HttpServletRequest request, File shpFile) throws NamingException, ParseException, SQLException, IOException, SchemaException, TransformException, NoSuchElementException, FactoryException, Exception {

		String columnsString = request.getParameter("columns");
		String workspace = request.getParameter("workspace");
		Map<String, String> columns = new HashMap<>();
		if (StringUtils.isNotBlank(columnsString)) {
			columns = (Map<String, String>) new Gson().fromJson(columnsString, Map.class);
		}
		BidiMap bm = new DualHashBidiMap(columns);
		String dateFieldName = (String) bm.getKey("date");
		String uncertaintyFieldName = (String) bm.getKey("uncy");
		String mhwFieldName = (String) bm.getKey("MHW");
		String orientation = "";
		
		String projection  = "4326"; //TODO can we get this from the prj file?

		// First delete any previously exploded point files
		deleteExistingPointFiles(shpFile.getParentFile());

		// Explode the shapefile to a points file
		File pointsShapefile;
		Xploder xploder = new Xploder(uncertaintyFieldName, Double.class);
		pointsShapefile = xploder.explode(shpFile.getParent() + File.separator + FilenameUtils.getBaseName(shpFile.getName()));
		try (Connection connection = getConnection()) {
			FeatureCollection<SimpleFeatureType, SimpleFeature> fc = FeatureCollectionFromShp.getFeatureCollectionFromShp(pointsShapefile.toURI().toURL());
			Class<?> dateType = fc.getSchema().getDescriptor(dateFieldName).getType().getBinding();
			Class<?> uncertaintyType = fc.getSchema().getDescriptor(uncertaintyFieldName).getType().getBinding();

			if (!fc.isEmpty()) {
				ReprojectFeatureResults rfc = new ReprojectFeatureResults(fc, DefaultGeographicCRS.WGS84);
				SimpleFeatureIterator iter = null;
				try {
					iter = rfc.features();
					connection.setAutoCommit(false);
					long lastShorelineId = 0;
					while (iter.hasNext()) {
						SimpleFeature sf = iter.next();
						boolean mhw = false;
						Date date = getDateFromFC(dateFieldName, sf, dateType);
						String source = getSourceFromFC(sf);
						if (StringUtils.isNotBlank(mhwFieldName)) {
							mhw = getMHWFromFC(mhwFieldName, sf, dateType);
						}

						long shorelineId = getRecordIdFromFC("recordId", sf);
						if (lastShorelineId != shorelineId) {
							lastShorelineId = insertToShorelinesTable(connection, workspace, date, mhw, source, orientation, mhwFieldName);
						}
						insertPointIntoShorelinePointsTable(connection, lastShorelineId, sf, uncertaintyFieldName, uncertaintyType, projection);
					}

					createViewAgainstWorkspace(connection, workspace);

					connection.commit();
				} catch (NamingException | NoSuchElementException | ParseException | SQLException ex) {
					connection.rollback();
					throw ex;
				} finally {
					if (null != iter) {
						try {
							iter.close();
						} catch (Exception ex) {
							LOGGER.warn("Could not close feature iterator", ex);
						}
					}
				}
			}
		}
		return workspace;
	}
	

	private boolean createViewAgainstWorkspace(Connection connection, String workspace) throws SQLException {
		String sql = "SELECT * FROM CREATE_WORKSPACE_VIEW(?)";

		try (PreparedStatement ps = connection.prepareStatement(sql)) {
			ps.setString(1, workspace);
			try (ResultSet rs = ps.executeQuery()) {
				return rs.next();
			}
		}
	}

	private long insertToShorelinesTable(Connection connection, String workspace, Date date, boolean mhw, String source, String shorelineType, String auxillaryName) throws NamingException, SQLException {
		String sql = "INSERT INTO shorelines "
				+ "(date, mhw, workspace, source, shoreline_type, auxillary_name) "
				+ "VALUES (?,?,?,?,?,?)";

		long createdId;

		try (PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
			ps.setDate(1, new java.sql.Date(date.getTime()));
			ps.setBoolean(2, mhw);
			ps.setString(3, workspace);
			ps.setString(4, source);
			ps.setString(5, shorelineType);
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

	private int insertPointIntoShorelinePointsTable(Connection connection, long shorelineId, SimpleFeature sf, String uncertaintyFieldName, Class<?> uncertaintyType, String projection) throws IOException, SchemaException, TransformException, NoSuchElementException, FactoryException, SQLException {
		double x = sf.getBounds().getMaxX();
		double y = sf.getBounds().getMaxY();
		double uncertainty = getUncertaintyFromFC(uncertaintyFieldName, sf, uncertaintyType);
		int segmentId = getSegmentIdFromFC("segmentId", sf);

		String sql = "INSERT INTO shoreline_points "
				+ "(shoreline_id, segment_id, geom, uncy) "
				+ "VALUES (" + shorelineId + "," + segmentId + "," + "ST_GeomFromText('POINT(" + x + " " + y + ")'," + projection + ")" + "," + uncertainty + ")";
		try (Statement st = connection.createStatement()) {
			if (st.execute(sql)) {
				return 1;
			} else {
				return 0;
			}
		}

	}
	
	private int insertPointIntoShorelinePointsTable(Connection connection, long shorelineId, 
			int segmentId, double x, double y, double uncertainty, String projection) throws IOException, SchemaException, TransformException, NoSuchElementException, FactoryException, SQLException {

		String sql = "INSERT INTO shoreline_points "
				+ "(shoreline_id, segment_id, geom, uncy) "
				+ "VALUES (" + shorelineId + "," + segmentId + "," + "ST_GeomFromText('POINT(" + x + " " + y + ")'," + projection + ")" + "," + uncertainty + ")";
		try (Statement st = connection.createStatement()) {
			if (st.execute(sql)) {
				return 1;
			} else {
				return 0;
			}
		}
	}

	private Connection getConnection() {
		Connection con = null;
		try {
			Context initCtx = new InitialContext();
			Context envCtx = (Context) initCtx.lookup("java:comp/env");
			DataSource ds = (DataSource) envCtx.lookup(jndiDbConnName);
			con = ds.getConnection();
		} catch (SQLException | NamingException ex) {
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
			return Double.parseDouble(
					(String) uncy);
		} else if (uncy instanceof java.lang.Number) {
			return (double) uncy;
		}

		throw new NumberFormatException("Could not parse uncertainty into double");
	}

	private int getRecordIdFromFC(String recordIdFieldName, SimpleFeature sf) {
		return (int) sf.getAttribute(recordIdFieldName);
	}

	private boolean getMHWFromFC(String mhwFieldName, SimpleFeature sf, Class<?> fromType) throws ParseException {
		Object mhw = sf.getAttribute(mhwFieldName);

		if (fromType == java.lang.String.class) {
			return Boolean.parseBoolean(
					(String) mhw);
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

	private Map<String, String> getShorelineFileHeadersStringUsingToken(String token) throws IOException {
		Map<String, String> responseMap = new HashMap<>();
		File shorelineFile = getFileFromToken(token, tokenMap);

		if (LidarFileUtils.isLidar(shorelineFile)) { //if lidar file found, fake that we found expected shapefile attrs
			StringBuilder headers = new StringBuilder();
			for (String c : EXPECTED_SHAPEFILE_ATTRS) {
				headers.append(c).append(",");
			}
			headers.deleteCharAt(headers.length() - 1);
			responseMap.put("headers", headers.toString());
			responseMap.put("success", "true");
		} else if (null != shorelineFile && shorelineFile.exists()) {
			// Create a new directory within the work directory
			IterableShapefileReader reader = new IterableShapefileReader(shorelineFile);
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
			responseMap.put("error", "File not found. Try re-staging shoreline file");
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

	private void sendException(HttpServletResponse response, String error, Throwable t, ResponseType responseType) {
		Map<String, String> responseMap = new HashMap<>(1);
		responseMap.put("error", error);
		RequestResponse.sendErrorResponse(response, responseMap, responseType);
		LOGGER.warn(t.getMessage());
	}

	private String stageFile(HttpServletRequest request, String propertyBasedFilenameParam, String workDir) throws IOException, FileUploadException, ShapefileFormatException, LidarFileFormatException {
		File shorelinefile = ImportUtil.saveShorelineFileFromRequest(request, propertyBasedFilenameParam, workDir, true);

		String shorelineFilePathString = shorelinefile.getAbsolutePath();
		LOGGER.debug("File saved from request to {}", shorelineFilePathString);

		String fileToken = "";
		for (String uuid : tokenMap.keySet()) {
			if (tokenMap.get(uuid).equals(shorelineFilePathString)) {
				fileToken = uuid;
			}
		}

		if (StringUtils.isBlank(fileToken)) {
			fileToken = UUID.randomUUID().toString();
		}

		tokenMap.put(fileToken, shorelineFilePathString);

		return fileToken;
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
