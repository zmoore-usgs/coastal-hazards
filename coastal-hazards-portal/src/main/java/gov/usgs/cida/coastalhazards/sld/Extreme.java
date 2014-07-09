package gov.usgs.cida.coastalhazards.sld;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public final class Extreme {

    protected static final String[] attrs = {"EXTREME1", "EXTREME2", "EXTREME3", "EXTREME4", "EXTREME5", "EXTREME"};
    protected static final float[] thresholds = {3.5f, 5.0f, 6.5f, 8.0f};
    protected static final String[] colors = {"#DFB8E6", "#C78CEB", "#AC64EE", "#9040F1", "#6F07F3"};
	
	protected static final String jspPath = "/SLD/bins_line.jsp";
	protected static final String units = "m";
	protected static final List<Map<String,Object>> bins;
	static {
		List<Map<String,Object>> binsResult = new ArrayList<Map<String,Object>>();
        for (int i=0; i<colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<String,Object>();
            if (i > 0) {
                binMap.put("lowerBound", thresholds[i-1]);
            }
            if (i+1 < colors.length) {
                binMap.put("upperBound", thresholds[i]);
            }
            binMap.put("color", colors[i]);
            binsResult.add(binMap);
        }
		
		bins = binsResult;
	}
	
	public static final SLDConfig extreme = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);
    
}
