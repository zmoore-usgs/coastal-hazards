package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Zack Moore <zmoore@usgs.gov>
 */
public final class FloodMask {

	protected static final String[] attrs = new String[]{FL_MASK_ID};
	protected static final float[] thresholds = new float[]{1.0f, 2.0f};
	protected static final String[] categories = {"Without Reefs", "With Reefs"};
	protected static final String[] colors = {"#DE2A04", "#1804DE"};
	protected static final float strokeOpactiy = 0.75f;        
	protected static final String jspPath = "/SLD/categorical_polygon.jsp";
	protected static final String units = "Area Flooded";
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

	public static final SLDConfig floodMask = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, strokeOpactiy, attrs, thresholds, colors, bins, LegendType.DISCRETE
	);
}
