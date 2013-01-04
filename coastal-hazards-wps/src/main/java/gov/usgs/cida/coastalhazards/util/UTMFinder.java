/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.usgs.cida.coastalhazards.util;

import com.vividsolutions.jts.geom.Coordinate;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.referencing.CRS;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.NoSuchAuthorityCodeException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class UTMFinder {

    private static final int BASE_UTM_EPSG = 32600;
    private static final int SOUTHERN_HEMI = 100;
    
    /**
     * Need to be in lat/lon (WGS84) for this to work
     * 
     * @param featureCollection maybe should put in check for WGS84 again
     * @return UTM CRS
     */
    public static CoordinateReferenceSystem findUTMZoneForFeatureCollection(SimpleFeatureCollection featureCollection) throws NoSuchAuthorityCodeException, FactoryException {
        Coordinate centre = featureCollection.getBounds().centre();
        int utmZone = (int)Math.ceil((180 + centre.x) / 6);
        int epsg = BASE_UTM_EPSG + utmZone + ((centre.y > 0) ? 0 : SOUTHERN_HEMI);
        CoordinateReferenceSystem crs = CRS.decode("EPSG:" + epsg);
        return crs;
    }
    
}
