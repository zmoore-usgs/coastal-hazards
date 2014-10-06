package gov.usgs.cida.coastalhazards.shoreline.file;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.shoreline.dao.ShorelineFileDao;
import gov.usgs.cida.coastalhazards.shoreline.exception.ShorelineFileFormatException;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.owsutils.commons.properties.JNDISingleton;
import gov.usgs.cida.owsutils.commons.shapefile.ProjectionUtils;
import gov.usgs.cida.utilities.communication.GeoserverHandler;
import gov.usgs.cida.utilities.file.TokenToFileSingleton;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import javax.naming.NamingException;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.geotools.feature.SchemaException;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public abstract class ShorelineFile implements IShorelineFile {

	private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(ShorelineFile.class);
	protected static final DynamicReadOnlyProperties props = JNDISingleton.getInstance();
	protected static final String DIRECTORY_BASE_PARAM_CONFIG_KEY = ".files.directory.base";
	protected static final String DIRECTORY_UPLOAD_PARAM_CONFIG_KEY = ".files.directory.upload";
	protected static final String DIRECTORY_WORK_PARAM_CONFIG_KEY = ".files.directory.work";
	static final String SHP = "shp";
	static final String SHX = "shx";
	static final String DBF = "dbf";
	static final String PRJ = "prj";
	static final String FBX = "fbx";
	static final String SBX = "sbx";
	static final String AIH = "aih";
	static final String IXS = "ixs";
	static final String MXS = "mxs";
	static final String ATX = "atx";
	static final String SHP_XML = "shp.xml";
	static final String CPG = "cpg";
	static final String CST = "cst";
	static final String CSV = "csv";
	protected File baseDirectory;
	protected File uploadDirectory;
	protected File workDirectory;
	protected GeoserverHandler geoserverHandler;
	protected ShorelineFileDao dao;
	protected String token;
	protected Map<String, File> fileMap;
	protected String workspace;

	public static enum ShorelineType {

		LIDAR, SHAPEFILE
	};

	/**
	 * Moves a zip file into the applications work directory and returns the
	 * parent directory containing the unzipped collection of files
	 *
	 * @param zipFile
	 * @return
	 */
	File createWorkLocationForZip(File zipFile) throws IOException {
		String shorelineFileName = FilenameUtils.getBaseName(zipFile.getName());
		File fileWorkDirectory = new File(this.workDirectory, shorelineFileName);
		if (fileWorkDirectory.exists()) {
			try {
				FileUtils.cleanDirectory(fileWorkDirectory);
			} catch (IOException ex) {
				LOGGER.debug("Could not clean work directory at " + fileWorkDirectory.getAbsolutePath(), ex);
			}
		}
		FileUtils.forceMkdir(fileWorkDirectory);
		return fileWorkDirectory;
	}

	void updateFileMapWithDirFile(File directory, String[] parts) {
		Collection<File> fileList = FileUtils.listFiles(directory, parts, false);
		Iterator<File> listIter = fileList.iterator();
		while (listIter.hasNext()) {
			File file = listIter.next();
			String filename = file.getName();
			for (String part : parts) {
				if (filename.contains(part)) {
					this.fileMap.put(part, file);
				}
			}
		}
	}

	@Override
	public abstract File saveZipFile(File file) throws IOException;

	@Override
	public File getDirectory(String token) {
		return TokenToFileSingleton.getFile(token);
	}

	/**
	 * Deletes the directory associated with this Shoreline File. Typically,
	 * this would be done when removing the Shoreline file.
	 *
	 * @return
	 */
	protected boolean deleteDirectory() {
		return TokenToFileSingleton.removeToken(token, true);
	}

	@Override
	public String setDirectory(File directory) throws IOException {
		if (!directory.exists()) {
			throw new FileNotFoundException();
		}

		if (!directory.isDirectory()) {
			throw new IOException("File at " + directory.getAbsolutePath() + " is not a directory");
		}

		return TokenToFileSingleton.addFile(directory);
	}

	@Override
	public String getEPSGCode() {
		String epsg = null;
		try {
			epsg = ProjectionUtils.getDeclaredEPSGFromPrj(this.fileMap.get(PRJ));
		} catch (IOException | FactoryException ex) {
			LOGGER.warn("Could not find EPSG code from file", ex);
		}
		return epsg;
	}

	@Override
	public abstract String[] getColumns() throws IOException;

	@Override
	public String importToDatabase(HttpServletRequest request) throws ShorelineFileFormatException, SQLException, NamingException, NoSuchElementException, ParseException, IOException, SchemaException, TransformException, FactoryException {
		String columnsString = request.getParameter("columns");
		Map<String, String> columns = new HashMap<>();
		if (StringUtils.isNotBlank(columnsString)) {
			columns = new Gson().fromJson(columnsString, Map.class);
		}

		return importToDatabase(columns);
	}

	@Override
	public abstract String importToDatabase(Map<String, String> columns) throws ShorelineFileFormatException, SQLException, NamingException, NoSuchElementException, ParseException, IOException, SchemaException, TransformException, FactoryException;

	@Override
	public void importToGeoserver(String viewname) throws IOException {
		if (!geoserverHandler.createWorkspaceInGeoserver(workspace, null)) {
			throw new IOException("Could not create workspace");
		}

		if (!geoserverHandler.createPGDatastoreInGeoserver(workspace, workspace, null, "public", "dsas")) {
			throw new IOException("Could not create data store");
		}

		if (!geoserverHandler.createShorelineLayerInGeoserver(workspace, workspace, viewname)) {
			throw new IOException("Could not create shoreline layer");
		}

		if (geoserverHandler.touchWorkspace(workspace)) {
			LOGGER.debug("Geoserver workspace {} updated", workspace);
		} else {
			LOGGER.debug("Geoserver workspace {} could not be updated", workspace);
		}
	}

	public static void validate(File zipFile) throws Exception {
		throw new UnsupportedOperationException();
	}

	@Override
	public boolean exists() {
		for (File file : this.fileMap.values()) {
			if (!file.exists()) {
				return false;
			}
		}
		return true;
	}

	@Override
	public boolean clear() {
		File parentDirectory = this.fileMap.values().iterator().next().getParentFile();
		boolean success = FileUtils.deleteQuietly(parentDirectory);
		if (success) {
			this.fileMap.clear();
		}
		return success;
	}

	@Override
	public abstract boolean equals(Object obj);

	@Override
	public abstract int hashCode();

}
