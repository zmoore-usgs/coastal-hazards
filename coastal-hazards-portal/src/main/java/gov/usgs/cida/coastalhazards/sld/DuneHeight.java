package gov.usgs.cida.coastalhazards.sld;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public final class DuneHeight {

    protected static final String[] attrsCrest = {"DHIGH"};
	protected static final String[] attrsToe = {"DLOW"};
    protected static final float[] thresholdsCrest = {2.0f, 3.5f, 5.0f, 6.5f, 8.0f};
    protected static final float[] thresholdsToe = {1.0f, 2.0f, 3.0f, 4.0f, 5.0f};
    protected static final String[] colorsCrest = {"#D6C19D", "#BAA282", "#A18769", "#896B55", "#725642", "#5B4030"};
    protected static final String[] colorsToe = {"#D7F1AF", "#BBD190", "#A3B574", "#8C9C5A", "#768242", "#5F6A27"};

	
	protected static final String jspPath = "SLD/bins_line.jsp";
	protected static final String units = "m";
	protected static final List<Map<String,Object>> binsCrest;
	protected static final List<Map<String,Object>> binsToe;
	static {
		List<Map<String,Object>> binsCrestResult = new ArrayList<Map<String,Object>>();
        for (int i=0; i<colorsCrest.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<String,Object>();
            if (i > 0) {
                binMap.put("lowerBound", thresholdsCrest[i-1]);
            }
            if (i+1 < colorsCrest.length) {
                binMap.put("upperBound", thresholdsCrest[i]);
            }
            binMap.put("color", colorsCrest[i]);
            binsCrestResult.add(binMap);
        }
		binsCrest = binsCrestResult;
		
		List<Map<String,Object>> binsToeResult = new ArrayList<Map<String,Object>>();
        for (int i=0; i<colorsToe.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<String,Object>();
            if (i > 0) {
                binMap.put("lowerBound", thresholdsToe[i-1]);
            }
            if (i+1 < colorsToe.length) {
                binMap.put("upperBound", thresholdsToe[i]);
            }
            binMap.put("color", colorsToe[i]);
            binsToeResult.add(binMap);
        }
		binsToe = binsToeResult;
	}
	
	public static final SLDConfig duneCrest = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH, attrsCrest, thresholdsCrest, colorsCrest, binsCrest
	);
	public static final SLDConfig duneToe = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH, attrsToe, thresholdsToe, colorsToe, binsToe
	);
	
}
