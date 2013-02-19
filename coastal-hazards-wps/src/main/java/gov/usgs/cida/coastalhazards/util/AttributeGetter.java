package gov.usgs.cida.coastalhazards.util;

import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.type.FeatureType;
import org.opengis.feature.type.PropertyDescriptor;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class AttributeGetter {

    private FeatureType type;
    
    public AttributeGetter(FeatureType type) {
        this.type = type;
    }
    
    public Object getValue(String guess, SimpleFeature feature) {
        // get real name of attribute and return it
        return feature.getAttribute(guess);
    }
    
    public boolean exists(String guess) {
        PropertyDescriptor descriptor = type.getDescriptor(guess);
        return (descriptor != null);
    }
    
}
