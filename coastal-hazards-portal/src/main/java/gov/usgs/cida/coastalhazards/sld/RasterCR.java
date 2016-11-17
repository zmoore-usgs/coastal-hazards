/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.CR;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class RasterCR {
    
        private static final String[] attrs = {CR};
        protected static final String jspPath = "/SLD/raster_cr.jsp";
        protected static final String units = "Coastal Response Likelihood"; 
        protected static final List<Map<String, Object>> bins;
        protected static final float[] thresholds = {0.0f, .33f, .67f, 1.0f}; //used to evaluate what color the pixel should receive. (index) 
        protected static final String[] colors = {"#000000", "#5278AB", "#ededc4", "#BB4238"}; 
        
	static {
		List<Map<String, Object>> binsResult = new ArrayList<>();
                
		for (int i = 1; i < colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<>();
			
                        binMap.put("lowerBound", thresholds[i-1]);
                        binMap.put("upperBound", thresholds[i]);
                        binMap.put("color", colors[i]);
                        
			binsResult.add(binMap);
		}
		bins = binsResult;
	}

	public static final SLDConfig rasterConfig = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, SLDGenerator.STROKE_OPACITY_DEFAULT, attrs, thresholds, colors, bins, LegendType.CONTINUOUS
	);
}
