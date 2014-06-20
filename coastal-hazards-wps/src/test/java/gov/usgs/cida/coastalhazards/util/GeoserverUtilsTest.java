package gov.usgs.cida.coastalhazards.util;

import gov.usgs.cida.coastalhazards.wps.AutoImportProcess;
import gov.usgs.cida.coastalhazards.wps.NormalizeLayerColumnNamesProcessTest;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Collection;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.PrefixFileFilter;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.DataStoreInfo;
import org.geoserver.catalog.ProjectionPolicy;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.wps.WPSTestSupport;
import org.geoserver.wps.gs.ImportProcess;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.process.ProcessException;
import org.junit.After;
import org.junit.AfterClass;
import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 *
 * @author isuftin
 */
public class GeoserverUtilsTest extends WPSTestSupport {

	private AutoImportProcess autoImportProcess;
	private LayerImportUtil importer;
	public static final String WORKSPACE_NAME = "gs";
	public static final String LAYER_NAME = "mixedCaseColumnNames";
	public static final String STORE_NAME = "myStoreName";

	@BeforeClass
	public static void setUpClass() {
	}

	@AfterClass
	public static void tearDownClass() {
	}

	@Before
	public void setupTest() {
		autoImportProcess = new AutoImportProcess(catalog);
		importer = new LayerImportUtil(catalog, autoImportProcess);
	}

	@After
	public void tearDown() {
	}

	@Test
	public void testReplaceLayerWhenImportFails() throws IOException, URISyntaxException {
		System.out.println("testReplaceLayerWhenImportFails");
		
		URL mixedCaseShapefile = NormalizeLayerColumnNamesProcessTest.class.getClassLoader().getResource("gov/usgs/cida/coastalhazards/mixedCaseColumnNames/mixedCaseColumnNames.shp");
		SimpleFeatureCollection mixedCaseFeatureCollection = (SimpleFeatureCollection) FeatureCollectionFromShp.featureCollectionFromShp(mixedCaseShapefile);
		String layer = importer.importLayer(mixedCaseFeatureCollection, WORKSPACE_NAME, STORE_NAME, LAYER_NAME, mixedCaseFeatureCollection.getSchema().getGeometryDescriptor().getCoordinateReferenceSystem(), ProjectionPolicy.REPROJECT_TO_DECLARED);
		layer = layer.split(":")[1];
		
		ImportProcess importProc = new MisbehavingImportProcess(catalog);
		GeoserverUtils instance = new GeoserverUtils(catalog);
		WorkspaceInfo workspaceInfo = instance.getWorkspaceByName(WORKSPACE_NAME);
		DataStoreInfo datastoreInfo = instance.getDataStoreByName(WORKSPACE_NAME, STORE_NAME);
		
		Collection<File> initialFiles = FileUtils.listFiles(new File(new File(mixedCaseShapefile.toURI()).getParent()), new PrefixFileFilter(layer), null);
		int initialFileCount = initialFiles.size();
		try {
			instance.replaceLayer(mixedCaseFeatureCollection, layer, datastoreInfo, workspaceInfo, importProc);
			fail("Expected exception not generated");
		} catch (Exception e) {
			assertEquals(e.getClass(), org.geotools.process.ProcessException.class);
			
			// Make sure that the files that were moved are replaced
			Collection<File> postErrorFiles = FileUtils.listFiles(new File(new File(mixedCaseShapefile.toURI()).getParent()), new PrefixFileFilter(layer), null);
			assertEquals(initialFileCount, postErrorFiles.size());
		}
	}

	private class MisbehavingImportProcess extends ImportProcess {

		public MisbehavingImportProcess(Catalog catalog) {
			super(catalog);
		}

		@Override
		public String execute(SimpleFeatureCollection features, GridCoverage2D coverage, String workspace, String store, String name, CoordinateReferenceSystem srs, ProjectionPolicy srsHandling, String styleName) throws ProcessException {
			throw new ProcessException("I've been a bad, bad import process");
		}
	}

}
