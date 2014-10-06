package gov.usgs.cida.coastalhazards.shoreline.file;

import gov.usgs.cida.coastalhazards.shoreline.dao.ShorelineFileDao;
import gov.usgs.cida.coastalhazards.shoreline.exception.ShorelineFileFormatException;
import gov.usgs.cida.owsutils.commons.io.FileHelper;
import gov.usgs.cida.owsutils.commons.shapefile.utils.IterableShapefileReader;
import gov.usgs.cida.utilities.communication.GeoserverHandler;
import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.text.MessageFormat;
import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import javax.naming.NamingException;
import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.geotools.data.shapefile.dbf.DbaseFileHeader;
import org.geotools.feature.SchemaException;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public class ShorelineShapefile extends ShorelineFile {

	private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(ShorelineShapefile.class);
	private static final String[] fileParts = new String[]{
		SHP,
		SHX,
		DBF,
		PRJ,
		FBX,
		SBX,
		AIH,
		IXS,
		MXS,
		ATX,
		CST,
		SHP_XML,
		CPG};

	public ShorelineShapefile(String applicationName, GeoserverHandler gsHandler, ShorelineFileDao dao, String workspace) {
		this.baseDirectory = new File(props.getProperty(applicationName + DIRECTORY_BASE_PARAM_CONFIG_KEY, System.getProperty("java.io.tmpdir")));
		this.uploadDirectory = new File(baseDirectory, props.getProperty(applicationName + DIRECTORY_UPLOAD_PARAM_CONFIG_KEY));
		this.workDirectory = new File(baseDirectory, props.getProperty(applicationName + DIRECTORY_WORK_PARAM_CONFIG_KEY));
		this.geoserverHandler = gsHandler;
		this.dao = dao;
		this.fileMap = new HashMap<>(fileParts.length);
		this.workspace = workspace;
	}

	@Override
	public String setDirectory(File directory) throws IOException {
		String fileToken = super.setDirectory(directory);
		updateFileMapWithDirFile(directory, fileParts);
		return fileToken;
	}

	@Override
	public File saveZipFile(File zipFile) throws IOException {
		File workLocation = createWorkLocationForZip(zipFile);
		FileHelper.unzipFile(workLocation.getAbsolutePath(), zipFile);

		// Do validation
		return workLocation;
	}

	@Override
	public String[] getColumns() throws IOException {
		String[] headers = null;
		File dbfFile = this.fileMap.get(DBF);

		// getDbfHeader uses the .shp file 
		if (null == dbfFile || !dbfFile.exists() || !dbfFile.isFile() || !dbfFile.canRead()) {
			throw new IOException(MessageFormat.format("DBF file at {0} not readable", dbfFile));
		}

		try (IterableShapefileReader reader = new IterableShapefileReader(dbfFile)) {
			DbaseFileHeader dbfHeader = reader.getDbfHeader();
			int fieldCount = dbfHeader.getNumFields();
			headers = new String[fieldCount];
			for (int headerIndex = 0; headerIndex < fieldCount; headerIndex++) {
				headers[headerIndex] = dbfHeader.getFieldName(headerIndex);
			}
		} catch (Exception ex) {
			LOGGER.warn("Error on closing IterableShapefileReader", ex);
		}
		return headers;
	}

	@Override
	public String importToDatabase(Map<String, String> columns) throws ShorelineFileFormatException, SQLException, NamingException, NoSuchElementException, ParseException, IOException, SchemaException, TransformException, FactoryException {
		String projection = getEPSGCode();
		File shpFile = fileMap.get(SHP);
		return dao.importToDatabase(shpFile, columns, workspace, projection);
	}

	public static void validate(File zipFile) throws ShorelineFileFormatException, IOException {
		// Do some validation
	}

	@Override
	public boolean equals(Object obj) {
		if (!(obj instanceof ShorelineShapefile)) {
			return false;
		}
		return EqualsBuilder.reflectionEquals(this, obj);
	}

	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}

}
