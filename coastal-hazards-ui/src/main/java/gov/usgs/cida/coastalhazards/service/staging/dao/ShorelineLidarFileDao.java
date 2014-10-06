package gov.usgs.cida.coastalhazards.service.staging.dao;

import gov.usgs.cida.coastalhazards.service.exception.LidarFileFormatException;
import gov.usgs.cida.coastalhazards.service.exception.ShorelineFileFormatException;
import gov.usgs.cida.coastalhazards.service.util.LidarFileUtils;
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
import javax.naming.NamingException;
import org.geotools.feature.SchemaException;
import org.opengis.referencing.FactoryException;
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

				insertPointIntoShorelinePointsTable(
						connection,
						shorelineId,
						Integer.valueOf(point[0]),
						Double.valueOf(point[1]),
						Double.valueOf(point[2]),
						Double.valueOf(point[3]),
						cleanedEPSGCode
				);
			}
		}
		return workspace;
	}

}
