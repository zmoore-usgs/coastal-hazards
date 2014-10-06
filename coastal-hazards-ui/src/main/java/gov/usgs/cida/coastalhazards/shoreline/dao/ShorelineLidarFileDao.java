package gov.usgs.cida.coastalhazards.shoreline.dao;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateSequence;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.PrecisionModel;
import com.vividsolutions.jts.geom.impl.PackedCoordinateSequence;
import com.vividsolutions.jts.io.WKTReader;
import gov.usgs.cida.coastalhazards.shoreline.exception.LidarFileFormatException;
import gov.usgs.cida.coastalhazards.shoreline.exception.ShorelineFileFormatException;
import gov.usgs.cida.coastalhazards.service.util.LidarFileUtils;
import java.awt.geom.Point2D;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.naming.NamingException;
import org.geotools.feature.SchemaException;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.geotools.referencing.CRS;
import org.geotools.resources.CRSUtilities;
import org.opengis.geometry.DirectPosition;
import org.opengis.geometry.Geometry;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;

/**
 *
 * @author isuftin
 */
public class ShorelineLidarFileDao extends ShorelineFileDao {

	public ShorelineLidarFileDao() {
		this(null);
	}

	public ShorelineLidarFileDao(String jndiName) {
		if (null == jndiName) {
			this.JNDI_NAME = DEFAULT_JNDI_NAME;
		} else {
			this.JNDI_NAME = jndiName;
		}
	}

	@Override
	public String importToDatabase(File shorelineFile, Map<String, String> columns, String workspace, String EPSGCode) throws ShorelineFileFormatException, SQLException, NamingException, NoSuchElementException, ParseException, IOException, SchemaException, TransformException, FactoryException {
		SimpleDateFormat dtFormat = new SimpleDateFormat("MM/dd/yyyy");
		String cleanedEPSGCode = EPSGCode;
		if (cleanedEPSGCode.contains(":")) {
			cleanedEPSGCode = cleanedEPSGCode.split(":")[1];
		}
		String viewName;
		try (
				Connection connection = getConnection();
				BufferedReader br = new BufferedReader(new FileReader(shorelineFile))) {
			String line;
			int row = 0;
			HashMap<String, Long> shorelineDateToIdMap = new HashMap<>();
			while ((line = br.readLine()) != null) {
				row++;

				// use comma as separator
				String[] point = line.split(",");

				//validation
				try {
					if (row == 1) {
						LidarFileUtils.validateHeaderRow(point);
						continue;
					} else {
						LidarFileUtils.validateDataRow(point);
					}
				} catch (LidarFileFormatException ex) {
					throw new ShorelineFileFormatException(ex.getMessage());
				}

				//shorline id
				long shorelineId;
				String shorelineDate = point[4];
				if (!shorelineDateToIdMap.keySet().contains(shorelineDate)) { //if we have not used this shoreline date yet, go ahead create new shoreline record
					shorelineId = insertToShorelinesTable(
							connection,
							workspace,
							dtFormat.parse(shorelineDate),
							true, //lidar always has MHW = true 
							shorelineFile.getName(),
							"",
							MHW_FIELD_NAME);
					shorelineDateToIdMap.put(shorelineDate, shorelineId);
				} else {
					shorelineId = shorelineDateToIdMap.get(shorelineDate);
				}

				Double originalX = Double.valueOf(point[1]);
				Double originalY = Double.valueOf(point[2]);
				CoordinateReferenceSystem sourceCRS = CRS.decode(EPSGCode);
				CoordinateReferenceSystem targetCRS = CRS.decode("EPSG:4326");
				MathTransform transform = CRS.findMathTransform(sourceCRS, targetCRS, false);
				GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory();
				WKTReader reader = new WKTReader(geometryFactory);
				Point pt;
				try {
					pt = (Point) reader.read("POINT (" + originalX + " " + originalY + ")");
				} catch (com.vividsolutions.jts.io.ParseException ex) {
					throw new TransformException(ex.getMessage());
				}
				com.vividsolutions.jts.geom.Geometry transformedPt = JTS.transform(pt, transform);
				Double reprojectedX = transformedPt.getCentroid().getX();
				Double reprojectedY = transformedPt.getCentroid().getY();

				insertPointIntoShorelinePointsTable(
						connection,
						shorelineId,
						Integer.valueOf(point[0]),
						reprojectedX,
						reprojectedY,
						Double.valueOf(point[3]),
						cleanedEPSGCode
				);
			}
			viewName = createViewAgainstWorkspace(connection, workspace);
		}
		return viewName;
	}

}
