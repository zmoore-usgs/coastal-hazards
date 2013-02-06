/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.usgs.cida.coastalhazards.wps.geom;

import com.vividsolutions.jts.geom.LineString;
import org.opengis.feature.simple.SimpleFeature;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ShorelineFeature {

    public LineString segment;
    public SimpleFeature feature;
    
    public ShorelineFeature(LineString segment, SimpleFeature feature) {
        this.segment = segment;
        this.feature = feature;
    }
    
    // can throw in some convenience methods here
}
