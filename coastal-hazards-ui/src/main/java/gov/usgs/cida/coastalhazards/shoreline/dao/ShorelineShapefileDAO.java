package gov.usgs.cida.coastalhazards.shoreline.dao;

import gov.usgs.cida.coastalhazards.uncy.Xploder;
import gov.usgs.cida.owsutils.commons.shapefile.utils.FeatureCollectionFromShp;
import gov.usgs.cida.owsutils.commons.shapefile.utils.IterableShapefileReader;
import gov.usgs.cida.utilities.features.AttributeGetter;
import gov.usgs.cida.utilities.features.Constants;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
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
 * Imports a shapefile into the databaseF
 *
 * @author isuftin
 */
public class ShorelineShapefileDAO extends ShorelineFileDao {

	private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(ShorelineShapefileDAO.class);
	private static final String[] AUXILLARY_ATTRIBUTES = new String[]{"surveyID", "shoreInd", "defaultD", "name"};

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
		String dateFieldName = (String) bm.getKey(Constants.DB_DATE_ATTR);
		String uncertaintyFieldName = (String) bm.getKey(Constants.UNCY_ATTR);
		String mhwFieldName = (String) bm.getKey(Constants.MHW_ATTR);
		String orientation = ""; // Not yet sure what to do here
		String baseFileName = FilenameUtils.getBaseName(shpFile.getName());
		File parentDirectory = shpFile.getParentFile();
		deleteExistingPointFiles(parentDirectory);
		String[][] fieldNames = null;

		try (IterableShapefileReader isfr = new IterableShapefileReader(shpFile)) {
			DbaseFileHeader dbfHeader = isfr.getDbfHeader();
			fieldNames = new String[dbfHeader.getNumFields()][2];
			for (int fIdx = 0; fIdx < fieldNames.length; fIdx++) {
				fieldNames[fIdx][0] = dbfHeader.getFieldName(fIdx);
				fieldNames[fIdx][1] = String.valueOf(dbfHeader.getFieldType(fIdx));
			}
		} catch (Exception ex) {
			LOGGER.debug("Could not open shapefile for reading. Auxillary attributes will not be persisted to the database", ex);
		}

		try (Connection connection = getConnection()) {
			//TODO- Check if incoming shapefile is not already a points shapefile
			Xploder xploder = new Xploder(uncertaintyFieldName);
			File pointsShapefile;
			try {
				LOGGER.debug("Exploding shapefile at {}", shpFile.getAbsolutePath());
				pointsShapefile = xploder.explode(parentDirectory + File.separator + baseFileName);
				LOGGER.debug("Shapefile exploded");
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
						int recordId = getIntValue("recordId", sf);
						boolean mhw = false;
						Date date = getDateFromFC(dateFieldName, sf, dateType);
						String source = getSourceFromFC(sf);
						if (StringUtils.isNotBlank(mhwFieldName)) {
							mhw = getBooleanValue(mhwFieldName, sf, false);
						}

						if (lastRecordId != recordId) {
							shorelineId = insertToShorelinesTable(connection, workspace, date, mhw, source, baseFileName, orientation, "");

							if (fieldNames != null && fieldNames.length > 0) {
								Map<String, String> auxCols = getAuxillaryColumnsFromFC(sf, fieldNames);
								for (Entry<String, String> auxEntry : auxCols.entrySet()) {
									insertAuxillaryAttribute(connection, shorelineId, auxEntry.getKey(), auxEntry.getValue());
								}
							}

							lastRecordId = recordId;
						}
						insertPointIntoShorelinePointsTable(connection, shorelineId, sf, uncertaintyFieldName, uncertaintyType);
					}

					viewName = createViewAgainstWorkspace(connection, workspace, baseFileName);
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

	public int getIntValue(String attribute, SimpleFeature feature) {
		Object value = feature.getAttribute(attribute);
		if (value instanceof Number) {
			return ((Number) value).intValue();
		} else {
			throw new ClassCastException("This attribute is not an Integer");
		}
	}

	public double getDoubleValue(String attribute, SimpleFeature feature) {
		Object value = feature.getAttribute(attribute);
		if (value instanceof Number) {
			return ((Number) value).doubleValue();
		} else {
			throw new ClassCastException("This attribute is not a floating point value");
		}
	}

	public boolean getBooleanValue(String attribute, SimpleFeature feature, boolean defaultValue) {
		Object value = feature.getAttribute(attribute);
		return AttributeGetter.extractBooleanValue(value, defaultValue);
	}

	private int insertPointIntoShorelinePointsTable(Connection connection, long shorelineId, SimpleFeature sf, String uncertaintyFieldName, Class<?> uncertaintyType) throws IOException, SchemaException, TransformException, NoSuchElementException, FactoryException, SQLException {
		double x = sf.getBounds().getMaxX();
		double y = sf.getBounds().getMaxY();
		double uncertainty = getDoubleValue(uncertaintyFieldName, sf);
		int segmentId = getIntValue("segmentId", sf);
		return insertPointIntoShorelinePointsTable(connection, shorelineId, segmentId, x, y, uncertainty);
	}

	private Collection<File> deleteExistingPointFiles(File directory) {
		Collection<File> existingPointFiles = FileUtils.listFiles(directory, new PrefixFileFilter("*_pts"), null);
		for (File existingPtFile : existingPointFiles) {
			existingPtFile.delete();
		}
		return existingPointFiles;
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

	private Map<String, String> getAuxillaryColumnsFromFC(SimpleFeature sf, String[][] fieldNames) {
		// C (Character)  = String
		// N (Numeric)   = Integer or Long or Double (depends on field's decimal count and fieldLength)
		// F (Floating)  = Double
		// L (Logical)   = Boolean
		// D (Date)		 = java.util.Date (Without time)
		// @ (Timestamp) = java.sql.Timestamp (With time)
		// Unknown		 = String
		Map<String, String> auxillaryAttributes = new HashMap<>();
		for (String attribute : AUXILLARY_ATTRIBUTES) {
			for (String[] fname : fieldNames) {
				String fieldName = fname[0];
				char fieldType = fname[1].charAt(0);
				if (fieldName.trim().equalsIgnoreCase(attribute.trim())) {
					Object attrObj = sf.getAttribute(fieldName);
					if (attrObj != null) {
						switch (fieldType) {
							case 'D':
							case '@':
								auxillaryAttributes.put(fieldName.toLowerCase(), String.valueOf(((Date) attrObj).getTime()));
								break;
							case 'L':
							case 'N':
							case 'F':
							case 'C':
							default:
								auxillaryAttributes.put(fieldName.toLowerCase(), String.valueOf(sf.getAttribute(fieldName)));
						}
					}
				}
			}

		}
		return auxillaryAttributes;
	}
}
