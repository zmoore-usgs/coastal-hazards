package gov.usgs.cida.coastalhazards.sld;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public final class Shorelines {
    
    private static final String[] attrs = {"DATE", "DATE_"};
    private static final int SHORELINES_STROKE_WIDTH = 2;
    private static final String[] colors = {"#ff0000", "#bf6c60", "#ffa640", "#a68500", "#86bf60", "#009952", "#007a99", "#0074d9", "#5630bf", "#f780ff", "#ff0066", "#ff8091", "#f20000", "#ff7340", "#bf9360", "#bfb960", "#44ff00", "#3df2b6", "#73cfe6", "#0066ff", "#9173e6", "#bf30a3", "#bf3069", "#a60000", "#a65b29", "#ffcc00", "#90d900", "#00d957", "#60bfac", "#0091d9", "#2200ff", "#b63df2", "#f279ba", "#a6293a"};
	
	protected static final String jspPath = "SLD/shorelines.jsp";
	protected static final String units = "year";
	protected static final List<Map<String,Object>> bins;
	static {
		List<Map<String,Object>> binsResult = new ArrayList<Map<String,Object>>();
        for (int i=0; i<colors.length; i++) {
			List<Integer> years = new ArrayList<Integer>();
            int j=i;
            while(j<100) {
                years.add(j);
                j += colors.length;
            }
            Map<String, Object> binMap = new LinkedHashMap<String,Object>();
            binMap.put("years", years);
            binMap.put("color", colors[i]);
            binsResult.add(binMap);
        }
		
		bins = binsResult;
	}
	
	public static final SLDConfig shorelines = new SLDConfig(
			jspPath, units, SLDGenerator.style, SHORELINES_STROKE_WIDTH, attrs, null, colors, bins
	);
	
}
