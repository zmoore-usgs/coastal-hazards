package gov.usgs.cida.coastalhazards.sld;

import gov.usgs.cida.coastalhazards.model.Item;
import javax.ws.rs.core.Response;
import org.apache.commons.lang.ArrayUtils;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public abstract class SLDGenerator {
    
    protected Item item;
    protected final String commonSldName = "cch";
    
    public static SLDGenerator getGenerator(Item item) {
        SLDGenerator generator = null;
        switch(item.getType()) {
            case storms:
                Pcoi pcoi = new Pcoi(item);
                if (pcoi.isValidAttr(item.getAttr())) {
                    generator = pcoi;
                } else {
                    // other subtypes go here
                }
                break;
            case vulnerability:
                //something
                break;
            case historical:
                //something
                break;
            default:
                throw new IllegalArgumentException("Type not found");
        }
        return generator;
    }
    
    public SLDGenerator(Item item) {
        this.item = item;
    }
    
    public abstract Response generateSLD();
    public abstract Response generateSLDInfo();
    public abstract String[] getAttrs();
    
    public boolean isValidAttr(String attr) {
        return ArrayUtils.contains(getAttrs(), attr.toUpperCase());
    }
    
    public String getCommonSldName() {
        return commonSldName;
    }
    
}
