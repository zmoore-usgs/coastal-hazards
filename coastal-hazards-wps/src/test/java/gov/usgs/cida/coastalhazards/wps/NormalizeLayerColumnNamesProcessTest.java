package gov.usgs.cida.coastalhazards.wps;

import gov.usgs.cida.coastalhazards.util.FeatureCollectionFromShp;
import gov.usgs.cida.coastalhazards.util.LayerImportUtil;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.DataStoreInfo;
import org.geoserver.catalog.NamespaceInfo;
import org.geoserver.catalog.ProjectionPolicy;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.catalog.impl.CatalogFactoryImpl;
import org.geoserver.catalog.impl.CatalogImpl;
import org.geoserver.wps.WPSTestSupport;
import org.geoserver.wps.gs.ImportProcess;
import org.geotools.data.simple.SimpleFeatureCollection;
import static org.junit.Assert.*;
import org.junit.BeforeClass;
import org.junit.Test;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.Name;

public class NormalizeLayerColumnNamesProcessTest  extends WPSTestSupport {

	private static File outTest = null;

	public static final String WORKSPACE_NAME = "myWorkspace";
	public static final String LAYER_NAME = "myLayerName";
	public static final String STORE_NAME = "myStoreName";

	@BeforeClass
	public static void setupAll() throws IOException {
		// leaks files, need to delete all the files associated with .shp
		outTest = File.createTempFile("test", ".shp");
		outTest.deleteOnExit();
	}

	@Test
	//@Ignore
	public void testExecute() throws Exception {

		//inspiration: http://www.torres.at/geoserver-create-datastore-programmatically/
		URL mixedCaseShapefile = NormalizeLayerColumnNamesProcessTest.class.getClassLoader().getResource("gov/usgs/cida/coastalhazards/mixedCaseColumnNames/mixedCaseColumnNames.shp");
		String namespaceUri = "http://www.cida.usgs.gov/";
		String namespace = "cida";
		SimpleFeatureCollection mixedCaseFeatureCollection = (SimpleFeatureCollection) FeatureCollectionFromShp.featureCollectionFromShp(mixedCaseShapefile);
		
		NamespaceInfo nsInfo = catalog.getFactory().createNamespace();
		nsInfo.setPrefix(namespace);
		nsInfo.setURI(namespaceUri);
		catalog.add(nsInfo);

		WorkspaceInfo workspaceInfo = catalog.getFactory().createWorkspace();
		workspaceInfo.setName(WORKSPACE_NAME);
		catalog.add(workspaceInfo);

//		DataStore dataStore = DataStoreFinder.getDataStore(map);
		DataStoreInfo dsInfo = catalog.getFactory().createDataStore();

		dsInfo.setName(STORE_NAME);
		dsInfo.setDescription("Fun!");
		dsInfo.setEnabled(true);
		dsInfo.setType("Shapefile");
		dsInfo.setWorkspace(workspaceInfo);

		dsInfo.getConnectionParameters().put("create spatial index", false);
		dsInfo.getConnectionParameters().put("charset", "ISO-8859-1");
		dsInfo.getConnectionParameters().put("filetype", "shapefile");
		dsInfo.getConnectionParameters().put("cache and reuse memory maps", true);
		dsInfo.getConnectionParameters().put("url", mixedCaseShapefile.toString() + "_test");
		dsInfo.getConnectionParameters().put("namespace", namespace);

		catalog.add(dsInfo);

//		ResourceInfo resourceInfo = catalog.getResourceByStore(dsInfo, , null)
//		
//		
//		LayerInfo layerInfo = catalog.getR
//		layerInfo.setName(LAYER_NAME);
//		layerInfo.setEnabled(true);
//		layerInfo.setR
//		catalog.add(layerInfo);
		ImportProcess importProcess = new ImportProcess(catalog);
		LayerImportUtil importer = new LayerImportUtil(catalog, importProcess);
		String response = importer.importLayer(mixedCaseFeatureCollection, workspaceInfo.getName(), dsInfo.getName(), LAYER_NAME, mixedCaseFeatureCollection.getSchema().getGeometryDescriptor().getCoordinateReferenceSystem(), ProjectionPolicy.REPROJECT_TO_DECLARED);
//		CoordinateReferenceSystem crs = mixedCaseFeatureCollection.getSchema().getGeometryDescriptor().getCoordinateReferenceSystem();
//		String response = importer.importLayer(mixedCaseFeatureCollection, WORKSPACE_NAME, STORE_NAME, LAYER_NAME, crs, ProjectionPolicy.NONE);
		NormalizeLayerColumnNamesProcess normalizeLayerColumnNamesProcess = new NormalizeLayerColumnNamesProcess(importProcess, catalog);
		String normalizeResult = normalizeLayerColumnNamesProcess.execute(LAYER_NAME, WORKSPACE_NAME, STORE_NAME);

		validateColumnNames(outTest);
	}

	private void validateColumnNames(File shapefile) throws MalformedURLException, IOException {
		SimpleFeatureCollection resultsFC = (SimpleFeatureCollection) FeatureCollectionFromShp.featureCollectionFromShp(shapefile.toURI().toURL());

		SimpleFeatureType resultsFeatureType = resultsFC.getSchema();
		List<AttributeDescriptor> attributeDescriptors = resultsFeatureType.getAttributeDescriptors();
		assertFalse(attributeDescriptors.isEmpty());
		for (AttributeDescriptor ad : attributeDescriptors) {
			Name attributeName = ad.getName();
			String actualName = attributeName.toString();
			String upperCasedName = actualName.toUpperCase();
			assertEquals(actualName, upperCasedName);
		}
	}
}
