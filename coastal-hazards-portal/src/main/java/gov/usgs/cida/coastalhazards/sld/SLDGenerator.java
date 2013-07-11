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
    protected static final String style = "cch";
    
    public static SLDGenerator getGenerator(Item item) {
        SLDGenerator generator = null;
        switch(item.getType()) {
            case storms:
                Pcoi pcoi = new Pcoi(item);
                Extreme extreme = new Extreme(item);
                DuneHeight dune = new DuneHeight(item);
                if (pcoi.isValidAttr(item.getAttr())) {
                    generator = pcoi;
                } else if (extreme.isValidAttr(item.getAttr())) {
                    generator = extreme;
                } else if (dune.isValidAttr(item.getAttr())){
                    generator = dune;
                } else {
                    // mean water level here
                }
                break;
            case vulnerability:
                //something
                break;
            case historical:
                Shorelines shorelines = new Shorelines(item);
                if (shorelines.isValidAttr(item.getAttr())) {
                    generator = shorelines;
                } else {
                    // do something for rates
                }
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
    public abstract String getStyle();
    
    public boolean isValidAttr(String attr) {
        return ArrayUtils.contains(getAttrs(), attr.toUpperCase());
    }
    
}
