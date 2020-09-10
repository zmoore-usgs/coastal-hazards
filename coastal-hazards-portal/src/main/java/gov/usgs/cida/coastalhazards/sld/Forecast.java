package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Zehao Xue <zxue@usgs.gov>
 */
public final class Forecast {

	protected static final String[] attrs = new String[]{FORECASTPE};
	protected static final float[] thresholds = new float[]{10f, 20f};
	protected static final String[] categories = {"10-year", "20-year"};
	protected static final String[] colors = {"#018571", "#A6601A"};
	protected static final int strokeWidth = 1;

	protected static final String jspPath = "/SLD/categorical_line.jsp";
	protected static final String units = "year";
	protected static final List<Map<String, Object>> bins;

	static {
		List<Map<String, Object>> binsResult = new ArrayList<Map<String, Object>>();
		for (int i = 0; i < colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<>();
			binMap.put("category", categories[i]);
			binMap.put("color", colors[i]);
			binsResult.add(binMap);
		}

		bins = binsResult;
	}

	public static final SLDConfig forecast = new SLDConfig(
		jspPath, units, SLDGenerator.style, strokeWidth, SLDGenerator.STROKE_OPACITY_DEFAULT, attrs, thresholds, colors, bins
	);

}
