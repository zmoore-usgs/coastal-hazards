package gov.usgs.cida.coastalhazards.util;

import com.vividsolutions.jts.geom.MultiLineString;
import gov.usgs.cida.coastalhazards.wps.GenerateTransectsProcessTest;
import java.io.IOException;
import java.net.URL;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CRSUtilsTest {

    /**
     * Test of getCRSFromFeatureCollection method, of class CRSUtils.
     */
    @Test
    public void testGetCRSFromFeatureCollection() {
        System.out.println("getCRSFromFeatureCollection");
        FeatureCollection<SimpleFeatureType, SimpleFeature> simpleFeatureCollection = null;
        CoordinateReferenceSystem expResult = null;
        CoordinateReferenceSystem result = CRSUtils.getCRSFromFeatureCollection(simpleFeatureCollection);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of transformAndGetLinesFromFeatureCollection method, of class CRSUtils.
     */
    @Test
    public void testTransformAndGetLinesFromFeatureCollection() {
        System.out.println("transformAndGetLinesFromFeatureCollection");
        FeatureCollection<SimpleFeatureType, SimpleFeature> featureCollection = null;
        CoordinateReferenceSystem sourceCrs = null;
        CoordinateReferenceSystem targetCrs = null;
        MultiLineString expResult = null;
        MultiLineString result = CRSUtils.transformAndGetLinesFromFeatureCollection(featureCollection, sourceCrs, targetCrs);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of transformFeatureCollection method, of class CRSUtils.
     */
    @Test
    public void testTransformFeatureCollection() {
        System.out.println("transformFeatureCollection");
        FeatureCollection<SimpleFeatureType, SimpleFeature> featureCollection = null;
        CoordinateReferenceSystem sourceCrs = null;
        CoordinateReferenceSystem targetCrs = null;
        SimpleFeatureCollection expResult = null;
        SimpleFeatureCollection result = CRSUtils.transformFeatureCollection(featureCollection, sourceCrs, targetCrs);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of getLinesFromFeatureCollection method, of class CRSUtils.
     */
    @Test
    public void testGetLinesFromFeatureCollection() throws IOException {
        URL baselineShapefile = GenerateTransectsProcessTest.class.getClassLoader()
                .getResource("gov/usgs/cida/coastalhazards/jersey/NewJerseyN_baseline.shp");
        FeatureCollection<SimpleFeatureType, SimpleFeature> baselinefc =
                FeatureCollectionFromShp.featureCollectionFromShp(baselineShapefile);
        MultiLineString expResult = null;
        MultiLineString result = CRSUtils.getLinesFromFeatureCollection((SimpleFeatureCollection)baselinefc);
        assertEquals(expResult, result);
    }

    /**
     * Test of getLinesFromFeature method, of class CRSUtils.
     */
    @Test
    public void testGetLinesFromFeature() {
        System.out.println("getLinesFromFeature");
        SimpleFeature feature = null;
        MultiLineString expResult = null;
        MultiLineString result = CRSUtils.getLinesFromFeature(feature);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }
}
