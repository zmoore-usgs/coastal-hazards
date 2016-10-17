package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.AE;
import static gov.usgs.cida.coastalhazards.Attributes.GRAY_INDEX;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author smlarson
 */
public final class Raster {
private static final String[] attrs = {AE, GRAY_INDEX};

	protected static final String jspPath = "/SLD/raster_ae.jsp";
	protected static final String units = "m"; //meters
        protected static final List<Map<String, Object>> bins;
        
        // type = intervals for the ColorMap
        protected static final float[] thresholds = {0.0f, 1.0f, 2.0f, 3.0f, 4.0f, 5.0f}; //used to evaluate what color the pixel should receive. (index) 
	protected static final String[] colors = {"#000000", "#004DA7", "#005BE7", "#38A700", "#AAFF01", "#FEFF73"}; //the #000000 color is irrelevant as it is transparent
        protected static final float[] range = {-12, -1, 0, 1, 5, 10};  //this will be used to create the legend in the map with the ranges etc 
        
	static {
		List<Map<String, Object>> binsResult = new ArrayList<>();
                
		for (int i = 1; i < colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<>();
			
                        binMap.put("lowerBound", range[i-1]);
                        binMap.put("upperBound", range[i]);
                        binMap.put("color", colors[i]);
                        
			binsResult.add(binMap);
		}
		bins = binsResult;
	}

	public static final SLDConfig rasterConfig = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);
    
}
