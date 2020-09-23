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
public final class Uvvr {

	protected static final String[] attrs = new String[]{UVVR};
	protected static final float[] thresholds = new float[]{-1f, 0f, 0.001f, 0.025f, 0.050f, 0.100f, 0.250f, 0.500f, 1.0f, 1.5f, 1.999f, 99999999f};
	protected static final String[] colors = {"#8e0152", "#276419", "#4d9221", "#7fbc41", "#b8e186", "#e6f5d0", "#f7f7f7", "#fde0ef", "#f1b6da", "#de77ae", "#c51b7d"};
	protected static final String jspPath = "/SLD/bins_polygon.jsp";
	protected static final String units = "Vulnerability Index";
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
			binsResult.add(binMap);
		}

		bins = binsResult;
	}

	public static final SLDConfig uvvr = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, SLDGenerator.STROKE_OPACITY_DEFAULT, attrs, thresholds, colors, bins, LegendType.CONTINUOUS
	);
}
