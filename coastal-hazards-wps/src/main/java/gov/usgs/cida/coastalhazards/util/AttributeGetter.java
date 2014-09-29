package gov.usgs.cida.coastalhazards.util;

import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.type.FeatureType;
import org.opengis.feature.type.GeometryType;
import org.opengis.feature.type.Name;
import org.opengis.feature.type.PropertyDescriptor;
import org.opengis.feature.type.PropertyType;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class AttributeGetter {

    private FeatureType type;
    private Map<String, Name> attrMap;
    
	public AttributeGetter(FeatureType type) {
		this.type = type;
		this.attrMap = new HashMap<>();
		if (null != type) {
			Collection<PropertyDescriptor> descriptors = type.getDescriptors();
			for (PropertyDescriptor desc : descriptors) {
				if (isGeom(desc)) {
					attrMap.put(Constants.DEFAULT_GEOM_ATTR, desc.getName());
				}
				else if (isDate(desc)) {
					attrMap.put(Constants.DATE_ATTR, desc.getName());
				}
				else if (isUncertainty(desc)) {
					attrMap.put(Constants.UNCY_ATTR, desc.getName());
				}
				else if (isOrient(desc)) {
					attrMap.put(Constants.BASELINE_ORIENTATION_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.TRANSECT_ID_ATTR)) {
					attrMap.put(Constants.TRANSECT_ID_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.BASELINE_ID_ATTR)) {
					attrMap.put(Constants.BASELINE_ID_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.BASELINE_DIST_ATTR)) {
					attrMap.put(Constants.BASELINE_DIST_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.DISTANCE_ATTR)) {
					attrMap.put(Constants.DISTANCE_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.MHW_ATTR)) {
					attrMap.put(Constants.MHW_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.LCI_ATTR)) {
					attrMap.put(Constants.LCI_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.LRR_ATTR)) {
					attrMap.put(Constants.LRR_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.WLR_ATTR)) {
					attrMap.put(Constants.WLR_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.WCI_ATTR)) {
					attrMap.put(Constants.WCI_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.SCE_ATTR)) {
					attrMap.put(Constants.SCE_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.NSM_ATTR)) {
					attrMap.put(Constants.NSM_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.EPR_ATTR)) {
					attrMap.put(Constants.EPR_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.SHORELINE_ID_ATTR)) {
					attrMap.put(Constants.SHORELINE_ID_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.SEGMENT_ID_ATTR)) {
					attrMap.put(Constants.SEGMENT_ID_ATTR, desc.getName());
				}
				else if (isOther(desc, Constants.BIAS_ATTR)) {
					attrMap.put(Constants.BIAS_ATTR, desc.getName());
				}
			}
		}
	}
    
    public Object getValue(String guess, SimpleFeature feature) {
        Name name = attrMap.get(guess);
        if (name == null) {
            return null;
        }
        else {
            return feature.getAttribute(name);
        }
    }
	
	public int getIntValue(String attribute, SimpleFeature feature) {
		Object value = getValue(attribute, feature);
		if (value instanceof Integer) {
			return (int)value;
		} else {
			throw new ClassCastException("This attribute is not an Integer");
		}
	}
	
	public double getDoubleValue(String attribute, SimpleFeature feature) {
		Object value = getValue(attribute, feature);
		if (value instanceof Float || value instanceof Double) {
			return (Double)value;
		} else {
			throw new ClassCastException("This attribute is not a floating point value");
		}
	}

	/**
	 * Shoreline shapefiles will represent booleans as a 0 or 1 while intersect CSVs will 
	 * represent them as TRUE or FALSE. This method gets the attribute as true/false from 0, 1, TRUE, or FALSE. Allows us
	 * to use the same functions for either format.
	 * @param feature feature to get MHW from
	 * @return value of mhw flag
	 */
	public boolean getBooleanFromMhwAttribute(SimpleFeature feature) {
		boolean isMhw = Constants.DEFAULT_MHW_VALUE;
		Object attribute = getValue(Constants.MHW_ATTR, feature);
		if(attribute != null) {
			if(attribute.toString().equals("0") || attribute.toString().equalsIgnoreCase("false")) {
				isMhw = false;
			} else if(attribute.toString().matches("\\d+") || attribute.toString().equalsIgnoreCase("true")) {
				isMhw = true;
			}
		}

		return isMhw;
	}
    
    public boolean exists(String guess) {
        Name name = attrMap.get(guess);
        PropertyDescriptor descriptor = type.getDescriptor(name);
        return (descriptor != null);
    }
    
    public boolean exists(Collection<String> guesses) {
        boolean allExist = true;
        for (String guess : guesses) {
            allExist = (allExist && exists(guess));
        }
        return allExist;
    }
    
    public boolean matches(Name actual, String guess) {
        Name name = attrMap.get(guess);
        return (null != actual && actual.equals(name));
    }
    
    private boolean isGeom(PropertyDescriptor desc) {
        PropertyType propType = desc.getType();
        return (propType instanceof GeometryType);
    }
    
    private boolean isDate(PropertyDescriptor desc) {
        String name = desc.getName().getLocalPart();
        PropertyType propType = desc.getType();
        if (propType.getBinding() == Date.class) {
            return true;
        }
        if (propType.getBinding() == String.class) {
            if ("date_".equalsIgnoreCase(name) || "date".equalsIgnoreCase(name) ||
                    Constants.DATE_ATTR.equalsIgnoreCase(name)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean isUncertainty(PropertyDescriptor desc) {
        String name = desc.getName().getLocalPart();
        if ("uncertainty_".equalsIgnoreCase(name) || "uncertainty".equalsIgnoreCase(name) ||
                "uncy_".equalsIgnoreCase(name) || "uncy".equalsIgnoreCase(name) ||
                "accuracy".equalsIgnoreCase(name) || Constants.UNCY_ATTR.equalsIgnoreCase(name)) {
            return true;
        }
        return false;
    }
    
    private boolean isOrient(PropertyDescriptor desc) {
        String name = desc.getName().getLocalPart();
        if ("OFFshore".equalsIgnoreCase(name) || Constants.BASELINE_ORIENTATION_ATTR.equalsIgnoreCase(name)) {
            return true;
        }
        return false;
    }
    
    private boolean isOther(PropertyDescriptor desc, String guess) {
        String name = desc.getName().getLocalPart();
        return (guess.equalsIgnoreCase(name));
    }
    
}
