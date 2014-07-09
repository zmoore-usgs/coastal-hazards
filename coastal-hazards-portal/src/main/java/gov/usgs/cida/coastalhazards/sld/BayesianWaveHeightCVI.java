package gov.usgs.cida.coastalhazards.sld;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public final class BayesianWaveHeightCVI {

    // MWH is deprecated by WAVES (Waves un-uppercased), and may be removed
    // when verified it is not being used.
    protected static final String[] attrs = {"MWH", "WAVES"};
    protected static final float[] thresholds = {0.0f, 0.5f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f};
    protected static final String[] colors = {"", "#005CE6", "#00A884", "#55FF00", "#FFFF00", "#FFAA00", "#FF0000", "#734C00"};
	
	protected static final String jspPath = "/SLD/bins_point.jsp";
	protected static final String units = "m";
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
	
	public static final SLDConfig mwh = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);

}
