package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public final class MeanWaterLevel {

	protected static final String[] attrs = {MEAN1, MEAN2, MEAN3, MEAN4, MEAN5, MEAN};
	protected static final float[] thresholds = {3.5f, 5.0f, 6.5f, 8.0f};
	protected static final String[] colors = {"#BFFFE9", "#7ABCE6", "#1F84E1", "#1945B8", "#070791"};

	protected static final String jspPath = "/SLD/bins_line.jsp";
	protected static final String units = "m";
	protected static final List<Map<String, Object>> bins;

	static {
		List<Map<String, Object>> binsResult = new ArrayList<Map<String, Object>>();
		for (int i = 0; i < colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<String, Object>();
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

	public static final SLDConfig mean = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);

}
