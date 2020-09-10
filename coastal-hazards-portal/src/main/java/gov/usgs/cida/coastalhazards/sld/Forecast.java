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

//Line thickness:  2.0
//
//Polygon outline thickness:  1.0
//Polygon outline color:  R G B all 110
//Polygon transparency:  50%  (in Arc, rt click on shp layer, Properties - Display)
//
//10-yr line:  R 1, G 133, B 113 #018571
//10-yr polygon:  R 128, G 205, B 193 #80CDC1
//
//20-yr line:  R 166, G 97, B 26 #A6601A
//20-yr polygon:  R 223, G 194, B 125 #DFC27D
	protected static final String[] attrs = new String[]{FORECASTPE};
	protected static final float[] thresholds = new float[]{10f, 20f};
	protected static final String[] categories = {"10-year", "20-year"};
	protected static final String[] colors = {"#018571", "#80CDC1"};
//	protected static final float strokeOpacity = 0.5f;
	protected static final int strokeWidth = 2;

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
