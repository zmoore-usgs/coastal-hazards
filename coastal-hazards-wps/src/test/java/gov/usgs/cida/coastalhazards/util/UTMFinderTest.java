package gov.usgs.cida.coastalhazards.util;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollections;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.Test;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 *
 * @author jordan
 */
public class UTMFinderTest {
    
    private SimpleFeatureType testFeatureType;
    private GeometryFactory gf = new GeometryFactory();
    
    @Before
    public void setUp() {
        SimpleFeatureTypeBuilder builder = new SimpleFeatureTypeBuilder();
        builder.setName("Lines");
        builder.add("geom", LineString.class, DefaultGeographicCRS.WGS84);
        testFeatureType = builder.buildFeatureType();
    }

    /**
     * Test of findUTMZoneForFeatureCollection method, of class UTMFinder.
     */
    @Test
    public void testZone1N() throws Exception {
        
        SimpleFeatureCollection fc = FeatureCollections.newCollection();
        fc.add(createLine(-177, 23, -177, 10));
        fc.add(createLine(-176, 13, -175, 33));
        fc.add(createLine(-177, 9, -176, 22));
        
        
        CoordinateReferenceSystem expResult = CRS.decode("EPSG:32601");
        CoordinateReferenceSystem result = UTMFinder.findUTMZoneForFeatureCollection(fc);
        assertEquals(expResult, result);
    }
    
    @Test
    public void testZone31S() throws Exception {
        SimpleFeatureCollection fc = FeatureCollections.newCollection();
        fc.add(createLine(3, -3, 3, -4));    
        
        CoordinateReferenceSystem expResult = CRS.decode("EPSG:32731");
        CoordinateReferenceSystem result = UTMFinder.findUTMZoneForFeatureCollection(fc);
        assertEquals(expResult, result);
    }
    
    @Test
    public void testIncorrect() throws Exception {
        SimpleFeatureCollection fc = FeatureCollections.newCollection();
        fc.add(createLine(3, -3, 3, -4));    
        
        CoordinateReferenceSystem expResult = CRS.decode("EPSG:4326");
        CoordinateReferenceSystem result = UTMFinder.findUTMZoneForFeatureCollection(fc);
        assertFalse(expResult.equals(result));
    }
    
    private SimpleFeature createLine(double x1, double y1, double x2, double y2) {
        Coordinate[] coords = new Coordinate[] { new Coordinate(x1, y1), new Coordinate(x2, y2) };
        return SimpleFeatureBuilder.build(testFeatureType, new Object[] { gf.createLineString(coords) }, null);
    }

}
