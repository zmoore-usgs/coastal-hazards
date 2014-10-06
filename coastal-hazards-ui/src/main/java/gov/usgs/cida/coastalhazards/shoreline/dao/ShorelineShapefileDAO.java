package gov.usgs.cida.coastalhazards.shoreline.dao;

import gov.usgs.cida.coastalhazards.uncy.Xploder;
import gov.usgs.cida.owsutils.commons.shapefile.utils.FeatureCollectionFromShp;
import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.naming.NamingException;
import org.apache.commons.collections.BidiMap;
import org.apache.commons.collections.bidimap.DualHashBidiMap;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.filefilter.PrefixFileFilter;
import org.apache.commons.lang.StringUtils;
import org.geotools.data.crs.ReprojectFeatureResults;
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
 * Imports a shapefile into the databaseF
 *
 * @author isuftin
 */
public class ShorelineShapefileDAO extends ShorelineFileDao {

	private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(ShorelineShapefileDAO.class);

	public ShorelineShapefileDAO() {
		this(null);
	}

	public ShorelineShapefileDAO(String jndiName) {
		if (null == jndiName) {
			this.JNDI_NAME = DEFAULT_JNDI_NAME;
		} else {
			this.JNDI_NAME = jndiName;
		}
	}

	@Override
	public String importToDatabase(File shpFile, Map<String, String> columns, String workspace, String EPSGCode) throws SQLException, NamingException, NoSuchElementException, ParseException, IOException {
		String viewName = null;
		BidiMap bm = new DualHashBidiMap(columns);
		String dateFieldName = (String) bm.getKey(DATE_FIELD_NAME);
		String uncertaintyFieldName = (String) bm.getKey(UNCY_FIELD_NAME);
		String mhwFieldName = (String) bm.getKey(MHW_FIELD_NAME);
		String orientation = ""; // Not yet sure what to do here
		String cleanedEPSGCode = EPSGCode;
		if (cleanedEPSGCode.contains(":")) {
			cleanedEPSGCode = cleanedEPSGCode.split(":")[1];
		}
		File parentDirectory = shpFile.getParentFile();
		deleteExistingPointFiles(parentDirectory);

		try (Connection connection = getConnection()) {
			Xploder xploder = new Xploder(uncertaintyFieldName);
			File pointsShapefile;
			try {
				pointsShapefile = xploder.explode(parentDirectory + File.separator + FilenameUtils.getBaseName(shpFile.getName()));
			} catch (Exception ex) {
				throw new IOException(ex);
			}
			FeatureCollection<SimpleFeatureType, SimpleFeature> fc = FeatureCollectionFromShp.getFeatureCollectionFromShp(pointsShapefile.toURI().toURL());
			Class<?> dateType = fc.getSchema().getDescriptor(dateFieldName).getType().getBinding();
			Class<?> uncertaintyType = fc.getSchema().getDescriptor(uncertaintyFieldName).getType().getBinding();
			if (!fc.isEmpty()) {
				ReprojectFeatureResults rfc = new ReprojectFeatureResults(fc, DefaultGeographicCRS.WGS84);
				SimpleFeatureIterator iter = null;
				try {
					iter = rfc.features();
					connection.setAutoCommit(false);
					int lastRecordId = -1;
					long shorelineId = 0;
					while (iter.hasNext()) {
						SimpleFeature sf = iter.next();
						int recordId = getRecordIdFromFC("recordId", sf);
						boolean mhw = false;
						Date date = getDateFromFC(dateFieldName, sf, dateType);
						String source = getSourceFromFC(sf);
						if (StringUtils.isNotBlank(mhwFieldName)) {
							mhw = getMHWFromFC(mhwFieldName, sf, dateType);
						}

						if (lastRecordId != recordId) {
							shorelineId = insertToShorelinesTable(connection, workspace, date, mhw, source, orientation, "4326");
							lastRecordId = recordId;
						}
						insertPointIntoShorelinePointsTable(connection, shorelineId, sf, uncertaintyFieldName, uncertaintyType, cleanedEPSGCode);
					}

					viewName = createViewAgainstWorkspace(connection, workspace);
					if (StringUtils.isBlank(viewName)) {
						throw new SQLException("Could not create view");
					} 

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
		} catch (SchemaException | TransformException | FactoryException ex) {
			Logger.getLogger(ShorelineShapefileDAO.class.getName()).log(Level.SEVERE, null, ex);
		}
		return viewName;
	}

	private int insertPointIntoShorelinePointsTable(Connection connection, long shorelineId, SimpleFeature sf, String uncertaintyFieldName, Class<?> uncertaintyType, String projection) throws IOException, SchemaException, TransformException, NoSuchElementException, FactoryException, SQLException {
		double x = sf.getBounds().getMaxX();
		double y = sf.getBounds().getMaxY();
		double uncertainty = getUncertaintyFromFC(uncertaintyFieldName, sf, uncertaintyType);
		int segmentId = getSegmentIdFromFC("segmentId", sf);
		return insertPointIntoShorelinePointsTable(connection, shorelineId, segmentId, x, y, uncertainty, "4326");
	}

	private Collection<File> deleteExistingPointFiles(File directory) {
		Collection<File> existingPointFiles = FileUtils.listFiles(directory, new PrefixFileFilter("*_pts"), null);
		for (File existingPtFile : existingPointFiles) {
			existingPtFile.delete();
		}
		return existingPointFiles;
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

	private String getSourceFromFC(SimpleFeature sf) {
		String source = "";
		for (AttributeDescriptor d : sf.getFeatureType().getAttributeDescriptors()) {
			if ("source".equalsIgnoreCase(d.getLocalName()) || ("src".equalsIgnoreCase(d.getLocalName()))) {
				return (String) sf.getAttribute(d.getLocalName());
			}
		}
		return source;
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

	private int getRecordIdFromFC(String recordIdFieldName, SimpleFeature sf) {
		return (int) sf.getAttribute(recordIdFieldName);
	}

	private int getSegmentIdFromFC(String segmentIdName, SimpleFeature sf) {
		return (int) sf.getAttribute(segmentIdName);
	}
}
