package gov.usgs.cida.coastalhazards.sld;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public final class BayesianErateCVI {

    // E_RATE is deprecated by ERATE (Erate un-uppercased), and may be removed
    // when verified it is not being used.
    protected static final String[] attrs = {"E_RATE", "ERATE"};
    protected static final float[] thresholds = {-2.0f, -1.0f, 1.0f, 2.0f};
    protected static final String[] colors = {"#ED2024", "#FCBF10", "#F6EB13", "#00B04F", "#29ADE3"};
	
	protected static final String jspPath = "/SLD/bins_point.jsp";
	protected static final String units = "m/yr";
	protected static final List<Map<String,Object>> bins;
	static {
		List<Map<String,Object>> binsResult = new ArrayList<>();
        for (int i=0; i<colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<>();
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
	
	public static final SLDConfig erate = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH, attrs, thresholds, colors, bins
	);

}
