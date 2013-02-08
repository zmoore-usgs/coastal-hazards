/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.util;

import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.prep.PreparedGeometry;
import com.vividsolutions.jts.geom.prep.PreparedGeometryFactory;
import gov.usgs.cida.coastalhazards.wps.CreateTransectsAndIntersectionsProcessTest;
import gov.usgs.cida.coastalhazards.wps.exceptions.PoorlyDefinedBaselineException;
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

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class GeomAssertsTest {

    /**
     * Test of assertBaselinesDoNotCrossShorelines method, of class GeomAsserts.
     */
    @Test
    public void testAssertBaselinesDoNotCrossShorelines_doesntcross() throws IOException {
        URL baselineShapefile = CreateTransectsAndIntersectionsProcessTest.class.getClassLoader()
                .getResource("gov/usgs/cida/coastalhazards/jersey/NewJerseyN_baseline.shp");
        URL shorelineShapefile = CreateTransectsAndIntersectionsProcessTest.class.getClassLoader()
                .getResource("gov/usgs/cida/coastalhazards/jersey/NewJerseyN_shorelines.shp");
        FeatureCollection<SimpleFeatureType, SimpleFeature> baselinefc =
                FeatureCollectionFromShp.featureCollectionFromShp(baselineShapefile);
        FeatureCollection<SimpleFeatureType, SimpleFeature> shorelinefc =
                FeatureCollectionFromShp.featureCollectionFromShp(shorelineShapefile);
        MultiLineString shorelineGeom = CRSUtils.getLinesFromFeatureCollection((SimpleFeatureCollection)shorelinefc);
        PreparedGeometry shorelines = PreparedGeometryFactory.prepare(shorelineGeom);
        MultiLineString baselines = CRSUtils.getLinesFromFeatureCollection((SimpleFeatureCollection)baselinefc);;
        GeomAsserts.assertBaselinesDoNotCrossShorelines(shorelines, baselines);
    }
    
    @Test(expected=PoorlyDefinedBaselineException.class)
    public void testAssertBaselinesDoNotCrossShorelines_doescross() throws IOException {
        URL baselineShapefile = CreateTransectsAndIntersectionsProcessTest.class.getClassLoader()
                .getResource("gov/usgs/cida/coastalhazards/jersey/NewJerseyN_cross.shp");
        URL shorelineShapefile = CreateTransectsAndIntersectionsProcessTest.class.getClassLoader()
                .getResource("gov/usgs/cida/coastalhazards/jersey/NewJerseyN_shorelines.shp");
        FeatureCollection<SimpleFeatureType, SimpleFeature> baselinefc =
                FeatureCollectionFromShp.featureCollectionFromShp(baselineShapefile);
        FeatureCollection<SimpleFeatureType, SimpleFeature> shorelinefc =
                FeatureCollectionFromShp.featureCollectionFromShp(shorelineShapefile);
        MultiLineString shorelineGeom = CRSUtils.getLinesFromFeatureCollection((SimpleFeatureCollection)shorelinefc);
        PreparedGeometry shorelines = PreparedGeometryFactory.prepare(shorelineGeom);
        MultiLineString baselines = CRSUtils.getLinesFromFeatureCollection((SimpleFeatureCollection)baselinefc);;
        GeomAsserts.assertBaselinesDoNotCrossShorelines(shorelines, baselines);
    }
}
