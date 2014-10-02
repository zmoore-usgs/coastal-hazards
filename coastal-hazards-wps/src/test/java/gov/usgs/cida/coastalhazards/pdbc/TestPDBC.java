package gov.usgs.cida.coastalhazards.pdbc;

import gov.usgs.cida.coastalhazards.util.FeatureCollectionFromShp;
import gov.usgs.cida.coastalhazards.wps.CreateTransectsAndIntersectionsProcess;
import gov.usgs.cida.coastalhazards.wps.CreateTransectsAndIntersectionsProcessTest;
import gov.usgs.cida.coastalhazards.wps.DummyCatalog;
import gov.usgs.cida.coastalhazards.wps.DummyImportProcess;
import java.io.File;
import java.net.URL;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.junit.Test;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class TestPDBC {

	@Test
	public void testGeorgiaPDBCCorrection() throws Exception {
		File shpfile = File.createTempFile("test", ".shp");
		URL baselineShapefile = CreateTransectsAndIntersectionsProcessTest.class.getClassLoader()
				.getResource("gov/usgs/cida/coastalhazards/pdbc/GAbase_baseline.shp");
		URL shorelineShapefile = CreateTransectsAndIntersectionsProcessTest.class.getClassLoader()
				.getResource("gov/usgs/cida/coastalhazards/pdbc/GA1971_1973.shp");
		URL biasRefShapefile = CreateTransectsAndIntersectionsProcessTest.class.getClassLoader()
				.getResource("gov/usgs/cida/coastalhazards/pdbc/PDB_reference_points.shp");
		FeatureCollection<SimpleFeatureType, SimpleFeature> baselinefc =
				FeatureCollectionFromShp.featureCollectionFromShp(baselineShapefile);
		FeatureCollection<SimpleFeatureType, SimpleFeature> shorelinefc =
				FeatureCollectionFromShp.featureCollectionFromShp(shorelineShapefile);
		FeatureCollection<SimpleFeatureType, SimpleFeature> biasReffc =
				FeatureCollectionFromShp.featureCollectionFromShp(biasRefShapefile);
		CreateTransectsAndIntersectionsProcess generate = new CreateTransectsAndIntersectionsProcess(new DummyImportProcess(shpfile), new DummyCatalog());
		generate.execute((SimpleFeatureCollection)shorelinefc, (SimpleFeatureCollection)baselinefc, (SimpleFeatureCollection)biasReffc, 50.0d, 0d, Boolean.FALSE, null, null, null, null);
	}
	
}
