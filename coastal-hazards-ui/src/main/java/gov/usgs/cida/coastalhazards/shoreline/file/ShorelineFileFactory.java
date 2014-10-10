package gov.usgs.cida.coastalhazards.shoreline.file;

import gov.usgs.cida.coastalhazards.service.util.ImportUtil;
import gov.usgs.cida.coastalhazards.service.util.Property;
import gov.usgs.cida.coastalhazards.service.util.PropertyUtil;
import gov.usgs.cida.coastalhazards.shoreline.dao.ShorelineLidarFileDao;
import gov.usgs.cida.coastalhazards.shoreline.dao.ShorelineShapefileDAO;
import gov.usgs.cida.coastalhazards.shoreline.exception.LidarFileFormatException;
import gov.usgs.cida.coastalhazards.shoreline.exception.ShorelineFileFormatException;
import gov.usgs.cida.coastalhazards.shoreline.file.ShorelineFile.ShorelineType;
import gov.usgs.cida.owsutils.commons.communication.RequestResponse;
import gov.usgs.cida.owsutils.commons.io.exception.ShapefileFormatException;
import gov.usgs.cida.utilities.communication.GeoserverHandler;
import gov.usgs.cida.utilities.file.FileHelper;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public class ShorelineFileFactory {

	private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(ShorelineFileFactory.class);
	private File zipFile;
	private HttpServletRequest request;
	private File baseDirectory;
	private File uploadDirectory;
	private String workspace;

	public ShorelineFileFactory(File zipFile, String jndiConnectionName, String workspace) throws IOException {
		if (zipFile == null) {
			throw new NullPointerException("Zip file may not be null");
		}

		if (StringUtils.isBlank(jndiConnectionName)) {
			throw new NullPointerException("JNDI connection name may not be null or blank");
		}

		if (StringUtils.isBlank(workspace)) {
			throw new NullPointerException("Workspace name may not be null or blank");
		}

		if (!zipFile.exists()) {
			throw new FileNotFoundException("Zip file can not be found");
		}

		if (!FileHelper.isZipFile(zipFile)) {
			throw new IOException("File is not a zip file");
		}

		this.zipFile = zipFile;
		init(workspace);
	}

	public ShorelineFileFactory(HttpServletRequest request) {
		if (request == null) {
			throw new NullPointerException("Request object may not be null");
		}

		this.request = request;
		String requestWorkspace = this.request.getParameter("workspace");
		if (StringUtils.isBlank(requestWorkspace)) {
			throw new NullPointerException("Request did not contain workspace name");
		}

		init(requestWorkspace);
	}

	private void init(String workspace) {
		this.baseDirectory = new File(PropertyUtil.getProperty(Property.DIRECTORIES_BASE, System.getProperty("java.io.tmpdir")));
		this.uploadDirectory = new File(baseDirectory, PropertyUtil.getProperty(Property.DIRECTORIES_UPLOAD));
		this.workspace = workspace;
	}

	public ShorelineFile buildShorelineFile() throws ShorelineFileFormatException, IOException, FileUploadException {
		String geoserverEndpoint = PropertyUtil.getProperty(Property.GEOSERVER_ENDPOINT);
		String geoserverUsername = PropertyUtil.getProperty(Property.GEOSERVER_USERNAME);
		String geoserverPassword = PropertyUtil.getProperty(Property.GEOSERVER_PASSWORD);
		GeoserverHandler geoserverHandler = new GeoserverHandler(geoserverEndpoint, geoserverUsername, geoserverPassword);

		if (null == this.zipFile) {
			try {
				this.zipFile = saveShorelineZipFileFromRequest(this.request);
			} catch (ShapefileFormatException | LidarFileFormatException ex) {
				throw new ShorelineFileFormatException(ex.getMessage());
			}
			LOGGER.debug("Shoreline saved");
		}

		gov.usgs.cida.owsutils.commons.io.FileHelper.flattenZipFile(this.zipFile.getAbsolutePath());

		ShorelineFile result;
		ShorelineType type = null;
		try {
			ShorelineLidarFile.validate(this.zipFile);
			LOGGER.debug("Lidar file verified");
			type = ShorelineType.LIDAR;
		} catch (LidarFileFormatException | IOException ex) {
			LOGGER.info("Failed lidar validation, try shapefile", ex);
			try {
				ShorelineShapefile.validate(this.zipFile);
				LOGGER.debug("Shapefile verified");
				type = ShorelineType.SHAPEFILE;
			} catch (ShorelineFileFormatException | IOException ex1) {
				LOGGER.info("Failed shapefile validation", ex1);
				FileUtils.deleteQuietly(zipFile);
				throw new ShorelineFileFormatException("File is neither a shoreline LIDAR or shape file");
			}
		}

		switch (type) {
			case LIDAR:
				result = new ShorelineLidarFile(geoserverHandler, new ShorelineLidarFileDao(), this.workspace);
				break;
			case SHAPEFILE:
				result = new ShorelineShapefile(geoserverHandler, new ShorelineShapefileDAO(), this.workspace);
				break;
			default:
				FileUtils.deleteQuietly(zipFile);
				throw new IOException("File is neither LiIDAR or Shapefile");
		}

		File savedWorkDirectory = null;
		try {
			savedWorkDirectory = result.saveZipFile(zipFile);
		} catch (IOException ex) {
			LOGGER.warn("Could not save zip file to work directory");
			throw ex;
		}
		result.setDirectory(savedWorkDirectory);

		FileUtils.deleteQuietly(zipFile);

		return result;
	}

	private File saveShorelineZipFileFromRequest(HttpServletRequest request) throws IOException, FileUploadException, ShapefileFormatException, LidarFileFormatException {
		String filenameParam = PropertyUtil.getProperty(Property.FILE_UPLOAD_FILENAME_PARAM);
		String fnReqParam = request.getParameter("filename.param");
		if (StringUtils.isNotBlank(fnReqParam)) {
			filenameParam = fnReqParam;
		}
		LOGGER.debug("Cleaning file name.\nWas: {}", filenameParam);
		String cleanedZipName = ImportUtil.cleanFileName(request.getParameter(filenameParam));
		LOGGER.debug("Is: {}", cleanedZipName);
		if (filenameParam.equals(cleanedZipName)) {
			LOGGER.debug("(No change)");
		}
		File cleanedZipFile = new File(this.uploadDirectory, cleanedZipName);
		if (cleanedZipFile.exists()) {
			FileUtils.deleteQuietly(cleanedZipFile);
		}

		try {
			RequestResponse.saveFileFromRequest(request, cleanedZipFile, filenameParam);
		} catch (FileUploadException | IOException ex) {
			LOGGER.info("Could not save file from request", ex);
			FileUtils.deleteQuietly(cleanedZipFile);
			throw ex;
		}
		return cleanedZipFile;
	}

}
