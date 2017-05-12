package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Kathryn Schoephoester <kmschoep@usgs.gov>
 */
public final class Evic {

	protected static final String[] attrs = new String[]{
		VIC
	};
	protected static final float[] thresholds = new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f, 1.0f};
	protected static final String[] colors = {"#2A29E6", "#3F67EB", "#50A7CC", "#07FFE0", "#96FBB7", "#D8F784", "#F3FE09", "#FAAF25", "#F76C12", "#E30B19"};

	protected static final String jspPath = "/SLD/evic.jsp";
	protected static final String units = "%";
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

	public static final SLDConfig pcoi = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);
}
