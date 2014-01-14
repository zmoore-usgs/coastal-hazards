package gov.usgs.cida.coastalhazards.sld;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public final class Pcoi {
    protected static final String[] attrs = new String[] {
        "PCOL1",
        "PCOL2",
        "PCOL3",
        "PCOL4",
        "PCOL5",
        "POVW1",
        "POVW2",
        "POVW3",
        "POVw4",
        "POVW5",
        "PIND1",
        "PIND2",
        "PIND3",
        "PIND4",
        "PIND5",
        "PCOL",
        "POVW",
        "PIND"
    };
    protected static final float[] thresholds = new float[] {0.0f, 10.0f, 25.0f, 50.0f, 75.0f, 90.0f};
    protected static final String[] colors = {"#FFFFFE", "#FFE6E6", "#FFCCCD", "#FF9C95", "#FF574A", "#FF0000"};
	
	protected static final String jspPath = "/SLD/pcoi.jsp";
	protected static final String units = "%";
	protected static final List<Map<String,Object>> bins;
	static {
		List<Map<String,Object>> binsResult = new ArrayList<Map<String,Object>>();
        for (int i=0; i<colors.length; i++) {
            Map<String, Object> binMap = new LinkedHashMap<String,Object>();
            binMap.put("lowerBound", thresholds[i]);
            if (i < colors.length - 1) {
                binMap.put("upperBound", thresholds[i+1]);
            }
            binMap.put("color", colors[i]);
            binsResult.add(binMap);
        }
		
		bins = binsResult;
	}
	
	
	public static final SLDConfig pcoi = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH, attrs, thresholds, colors, bins
	);
}
