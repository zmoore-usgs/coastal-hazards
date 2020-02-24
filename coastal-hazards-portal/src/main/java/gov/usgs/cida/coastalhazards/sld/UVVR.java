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
public final class UVVR {

	protected static final String[] attrs = new String[]{UVVR};
	protected static final float[] thresholds = new float[]{-1f, -1f, 0.025f, 0.050f, 0.075f, 0.100f, 0.200f, 0.300f, 0.400f, 0.500f, 0.75f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f, 999999999f};
	protected static final String[] colors = {"#A80000", "#2B41FF", "#386DFF", "#3B9DFF", "#30CFFF", "#00FFFF", "#70FFD2", "#A1FFA4", "#C7FF78", "#E7FF4A", "#FFFF00", "#FFD500", "#FFA600", "#FF7B00", "#FF4D00", "#FF0000"};

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
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);
}
