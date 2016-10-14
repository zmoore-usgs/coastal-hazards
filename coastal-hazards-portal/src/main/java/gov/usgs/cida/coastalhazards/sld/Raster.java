package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.AE;
import static gov.usgs.cida.coastalhazards.Attributes.GRAY_INDEX;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author smlarson
 */
public final class Raster {
private static final String[] attrs = {AE, GRAY_INDEX};

	protected static final String jspPath = "/SLD/raster_ae.jsp";
	protected static final String units = "m"; //meters
        protected static final List<Map<String, Object>> bins;
        
        // type = intervals for the ColorMap
        protected static final float[] thresholds = {1.0f, 2.0f, 3.0f, 4.0f, 5.0f};//{-12.0f, -1.0f, 0.0f, 1.0f, 5.0f, 10.0f}; //-12 to -1, -1 to 0, 0 to 1, 1 to 5, 5 to 10  
	protected static final String[] colors = {"#285A94", "#005BE7", "#38A700", "#AAFF01", "#FEFF73"};
        
	static {
		List<Map<String, Object>> binsResult = new ArrayList<>();
		for (int i = 0; i < colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<>();
			if (i > 0) {
				binMap.put("lowerBound", thresholds[i - 1]);
			}
			if (i + 1 < colors.length) {
				binMap.put("upperBound", thresholds[i]);
			}
			binMap.put("color", colors[i]);
			binsResult.add(binMap);
		}

		bins = binsResult;
	}

	public static final SLDConfig rasterConfig = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);
    
}
