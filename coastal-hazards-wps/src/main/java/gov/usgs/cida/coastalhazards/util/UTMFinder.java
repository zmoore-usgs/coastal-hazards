/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.usgs.cida.coastalhazards.util;

import com.vividsolutions.jts.geom.Coordinate;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.NoSuchAuthorityCodeException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.crs.GeographicCRS;
import org.opengis.referencing.operation.TransformException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class UTMFinder {

    /* http://reference.mapinfo.com/common/docs/mapxtend-dev-web-none-eng/miaware/doc/guide/xmlapi/coordsys/systems.htm */
    private static final int BASE_UTM_EPSG = 32600;
    private static final int SOUTHERN_HEMI = 100;
    
    /**
     * Need to be in lat/lon (WGS84) for this to work
     * Calculation is based on http://en.wikipedia.org/wiki/UTM_coordinate_system
     * 
     * @param featureCollection
     * @return UTM CRS
     */
    public static CoordinateReferenceSystem findUTMZoneForFeatureCollection(SimpleFeatureCollection featureCollection) throws NoSuchAuthorityCodeException, FactoryException, TransformException {
        Coordinate centre = featureCollection.getBounds().transform(DefaultGeographicCRS.WGS84, true).centre();
        int utmZone = (int)Math.ceil((180 + centre.x) / 6);
        int epsg = BASE_UTM_EPSG + utmZone + ((centre.y > 0) ? 0 : SOUTHERN_HEMI);
        CoordinateReferenceSystem crs = CRS.decode("EPSG:" + epsg);
        return crs;
    }
    
}
