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
public final class BayesianSLRCVI {

	// RSLR is deprecated by SLR, and may be removed
	// when verified it is not being used.
	protected static final String[] attrs = {RSLR, SLR};
	protected static final float[] thresholds = {-5.0f, -3.0f, -1.0f, 1.0f, 3.0f, 5.0f};
	protected static final String[] colors = {"#005CE6", "#00A884", "#55FF00", "#FFFF00", "#FFAA00", "#FF0000", "#734C00"};

	protected static final String jspPath = "/SLD/bins_point.jsp";
	protected static final String units = "mm/yr";
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

	public static final SLDConfig rslr = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);

}
