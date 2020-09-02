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
public final class Forecast {

	protected static final String[] attrs = {FORECAST};
	protected static final float[] thresholds = {0, 10, 20};
	protected static final String[] colors = {"#ED2024", "#FCBF10", "#F6EB13"};
	protected static final float strokeOpacity = 0.5f;

	protected static final String jspPath = "/SLD/bins_line.jsp";
	protected static final String units = "forecast";
	protected static final List<Map<String, Object>> bins;

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

	public static final SLDConfig rates = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, strokeOpacity, attrs, thresholds, colors, bins
	);

}
