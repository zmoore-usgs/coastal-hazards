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
public final class ForecastUncy {

	protected static final String[] attrs = new String[]{FORECAST_U};
	protected static final float[] thresholds = new float[]{0f, 10.1f, 20.1f};
	protected static final String[] categories = {"10-year", "20-year"};
	protected static final String[] colors = {"#80CDC1", "#DFC27D"};
	protected static final float strokeOpacity = 0.5f;
	
	protected static final String jspPath = "/SLD/bins_polygon.jsp";
	protected static final String units = "Forecast Period";
	protected static final List<Map<String, Object>> bins;

	static {
		List<Map<String, Object>> binsResult = new ArrayList<Map<String, Object>>();
		for (int i = 0; i < colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<String, Object>();
			binMap.put("lowerBound", thresholds[i]);
			if (i < colors.length - 1) {
				binMap.put("upperBound", thresholds[i + 1]);
			}
			binMap.put("color", colors[i]);
			binMap.put("category", categories[i]);
			binsResult.add(binMap);
		}

		bins = binsResult;
	}

	public static final SLDConfig forecastUncy = new SLDConfig(
		jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, strokeOpacity, attrs, thresholds, colors, bins, LegendType.DISCRETE
	);
	
}
