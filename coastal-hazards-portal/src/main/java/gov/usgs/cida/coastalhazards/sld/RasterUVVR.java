package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.UVVR_RASTER;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class RasterUVVR {
    
        private static final String[] attrs = {UVVR_RASTER};
	protected static final String jspPath = "/SLD/raster_uvvr.jsp";
	protected static final String units = "Vulnerability Index"; //unvegetated to vegetated ratio
        protected static final List<Map<String, Object>> bins;
        protected static final float[] thresholds = {-1f, 0f, 0.025f, 0.050f, 0.075f, 0.100f, 0.200f, 0.300f, 0.400f, 0.500f, 0.75f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f, 999999999f}; //used to evaluate what color the pixel should receive. (gray_index) 
        protected static final String[] colors = {"#A80000", "#2B41FF", "#386DFF", "#3B9DFF", "#30CFFF", "#00FFFF", "#70FFD2", "#A1FFA4", "#C7FF78", "#E7FF4A", "#FFFF00", "#FFD500", "#FFA600", "#FF7B00", "#FF4D00", "#FF0000"};
        protected static final float[] range = {-1f, 0f, 0.025f, 0.050f, 0.075f, 0.100f, 0.200f, 0.300f, 0.400f, 0.500f, 0.75f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f, 999999999f};  //this will be used to create the legend in the map with the ranges etc 
	protected static final String[] categories;
        
	static {
		categories = new String[range.length-1];
		for(int i = 1; i < range.length; i++){
			categories[i-1] = range[i-1] + " to " + range[i];
		}
		List<Map<String, Object>> binsResult = new ArrayList<>();
                
		for (int i = 1; i < colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<>();
			
                        binMap.put("lowerBound", range[i-1]);
                        binMap.put("upperBound", range[i]);
                        binMap.put("color", colors[i]);
			binMap.put("category", categories[i-1]);
			binsResult.add(binMap);
		}
		bins = binsResult;
	}

	public static final SLDConfig rasterConfig = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, SLDGenerator.STROKE_OPACITY_DEFAULT, attrs, thresholds, colors, bins, LegendType.CONTINUOUS
                        
	);
    
}
