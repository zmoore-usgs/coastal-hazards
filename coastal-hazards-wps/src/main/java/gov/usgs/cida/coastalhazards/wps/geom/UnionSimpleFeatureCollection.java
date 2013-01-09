package gov.usgs.cida.coastalhazards.wps.geom;

import java.util.LinkedList;
import java.util.List;
import org.geotools.data.DataUtilities;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.feature.FeatureCollection;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class UnionSimpleFeatureCollection {

    public static SimpleFeatureCollection unionCollectionsWithoutPreservingAttributes(FeatureCollection<SimpleFeatureType, SimpleFeature>[] features) {
        List<SimpleFeature> sfList = new LinkedList<SimpleFeature>();
        
        for (FeatureCollection featureCollection : features) {
            SimpleFeatureCollection sfc = (SimpleFeatureCollection)featureCollection;
            SimpleFeatureIterator iterator = sfc.features();
            while (iterator.hasNext()) {
                SimpleFeature next = iterator.next();
                sfList.add(next);
            }
        }
        return DataUtilities.collection(sfList);
    }
}
