package gov.usgs.cida.coastalhazards.sld;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public final class BayesianProbablityCVI {

    // PEROS2 is deprecated by PEROSION2 (PErosion2 un-uppercased), 
    // PEROS1 is deprecated by PEROSION1 (PErosion1 un-uppercased), 
    // PACC1 is deprecated by PACCRETION (PAccretion un-uppercased),
    // PACC2 is deprecated by PACCRETI_1 (PAccreti_1 un-uppercased), and may be removed
    // when verified they are not being used.
    protected static final String[] attrs = {"PEROS2", "PEROS1", "PSTABLE", "PACC1", "PACC2",
        "PEROSION2", "PEROSION1", "PACCRETION", "PACCRETI_1"};
    protected static final float[] thresholds = {1.0f, 10.0f, 33.0f, 66.0f, 90.0f, 99.0f};
    protected static final String[] colors = {"#005CE6", "#00A884", "#55FF00", "#FFFF00", "#FFAA00", "#FF0000", "#734C00"};
	
	protected static final String jspPath = "/SLD/bins_point.jsp";
	protected static final String units = "%";
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
	
	public static final SLDConfig bayes = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH, attrs, thresholds, colors, bins
	);

}
