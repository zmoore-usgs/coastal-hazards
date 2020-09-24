package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.UVVR_RASTER;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Zehao Xue <zxue@usgs.gov>
 */
public final class RasterUvvr {

	private static final String[] attrs = {UVVR_RASTER};
	protected static final String jspPath = "/SLD/raster_uvvr.jsp";
	protected static final String units = "Vulnerability Index"; //unvegetated to vegetated ratio
	protected static final List<Map<String, Object>> bins;
	protected static final float[] thresholds = {0f, 1f, 25f, 50f, 100f, 250f, 500f, 1000f, 1500f, 2000f, 2001f}; //used to evaluate what color the pixel should receive. (gray_index) 
	protected static final String[] colors = {"#276419", "#276419", "#4D9221", "#7FBC41", "#B8E186", "#E6F5D0", "#FDE0EF", "#F1B6DA", "#DE77AE", "#C51B7D", "#8E0152"};
	//protected static final float[] range = {-1f, 0f, 0.025f, 0.050f, 0.075f, 0.100f, 0.200f, 0.300f, 0.400f, 0.500f, 0.75f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f, 999999999f};  //this will be used to create the legend in the map with the ranges etc 
	protected static final String[] categories;

	static {
		categories = new String[thresholds.length];
		for (int i = 0; i < thresholds.length; i++) {
			if (i == 0) {
				// Add lower bound to first threshold for the legend
				categories[i] = "-1 to " + thresholds[i];
			} else {
				categories[i] = thresholds[i - 1] + " to " + thresholds[i];
			}
		}
		List<Map<String, Object>> binsResult = new ArrayList<>();

		for (int i = 0; i < colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<>();
			if (i == 0) {
				binMap.put("lowerBound", -1f);
				binMap.put("upperBound", thresholds[i]);
				binMap.put("color", colors[i]);
				binMap.put("category", categories[i]);
				binsResult.add(binMap);
			} else {
				binMap.put("lowerBound", thresholds[i - 1]);
				binMap.put("upperBound", thresholds[i]);
				binMap.put("color", colors[i]);
				binMap.put("category", categories[i]);
				binsResult.add(binMap);
			}

		}
		bins = binsResult;
	}

	public static final SLDConfig rasterConfig = new SLDConfig(
		jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, SLDGenerator.STROKE_OPACITY_DEFAULT, attrs, thresholds, colors, bins, LegendType.CONTINUOUS
	);

}
