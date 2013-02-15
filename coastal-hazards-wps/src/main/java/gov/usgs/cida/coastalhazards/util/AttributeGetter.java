/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.usgs.cida.coastalhazards.util;

import org.opengis.feature.Feature;
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
    
    public Object getValue(String guess, Feature feature) {
        // get real name of attribute and return it
        return feature.getProperty(guess);
    }
    
    public boolean exists(String guess) {
        PropertyDescriptor descriptor = type.getDescriptor(guess);
        return (descriptor != null);
    }
    
}
