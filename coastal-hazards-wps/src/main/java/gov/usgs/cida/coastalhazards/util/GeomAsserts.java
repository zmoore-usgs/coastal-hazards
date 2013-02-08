/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.usgs.cida.coastalhazards.util;

import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.prep.PreparedGeometry;
import gov.usgs.cida.coastalhazards.wps.exceptions.PoorlyDefinedBaselineException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class GeomAsserts {

    public static void assertBaselinesDoNotCrossShorelines(PreparedGeometry shorelines, MultiLineString baselines) {
        if (shorelines.intersects(baselines)) {
            throw new PoorlyDefinedBaselineException("Baselines cannot intersect shorelines");
        }
    }
}
