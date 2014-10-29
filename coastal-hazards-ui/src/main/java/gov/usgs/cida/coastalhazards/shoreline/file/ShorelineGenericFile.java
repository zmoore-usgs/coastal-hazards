package gov.usgs.cida.coastalhazards.shoreline.file;

import gov.usgs.cida.coastalhazards.service.util.Property;
import gov.usgs.cida.coastalhazards.service.util.PropertyUtil;
import gov.usgs.cida.coastalhazards.shoreline.exception.ShorelineFileFormatException;
import gov.usgs.cida.utilities.communication.GeoserverHandler;
import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Map;
import java.util.NoSuchElementException;
import javax.naming.NamingException;
import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.geotools.feature.SchemaException;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public class ShorelineGenericFile extends ShorelineFile {
	
	private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(ShorelineGenericFile.class);
	private String publishedWorkspaceName = null;
	
	public ShorelineGenericFile() {
		String geoserverEndpoint = PropertyUtil.getProperty(Property.GEOSERVER_ENDPOINT);
		String geoserverUsername = PropertyUtil.getProperty(Property.GEOSERVER_USERNAME);
		String geoserverPassword = PropertyUtil.getProperty(Property.GEOSERVER_PASSWORD);
		this.geoserverHandler = new GeoserverHandler(geoserverEndpoint, geoserverUsername, geoserverPassword);
		this.publishedWorkspaceName = PropertyUtil.getProperty("coastal-hazards.workspace.published", "published");
	}

	@Override
	public String[] getColumns() throws IOException {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public String importToDatabase(Map<String, String> columns) throws ShorelineFileFormatException, SQLException, NamingException, NoSuchElementException, ParseException, IOException, SchemaException, TransformException, FactoryException {
		throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

	@Override
	public boolean equals(Object obj) {
		if (!(obj instanceof ShorelineLidarFile)) {
			return false;
		}
		return EqualsBuilder.reflectionEquals(this, obj);
	}

	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}

	public void createOrUpdatePublishedWorkspaceOnGeoserver() throws IOException {
		if (!geoserverHandler.createWorkspaceInGeoserver(publishedWorkspaceName, null)) {
			throw new IOException("Could not create workspace");
		}

		if (!geoserverHandler.createPGDatastoreInGeoserver(publishedWorkspaceName, "shoreline", null, ShorelineFile.DB_SCHEMA_NAME)) {
			throw new IOException("Could not create data store");
		}

		if (!geoserverHandler.createShorelineLayerInGeoserver(publishedWorkspaceName, "shoreline", this.publishedWorkspaceName + "_shorelines")) {
			throw new IOException("Could not create shoreline layer");
		}

		if (geoserverHandler.touchWorkspace(publishedWorkspaceName)) {
			LOGGER.debug("Geoserver workspace {} updated", publishedWorkspaceName);
		} else {
			LOGGER.debug("Geoserver workspace {} could not be updated", workspace);
		}
	}

}
