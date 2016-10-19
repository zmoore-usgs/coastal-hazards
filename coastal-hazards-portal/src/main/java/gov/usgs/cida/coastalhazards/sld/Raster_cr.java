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

/**
 *
 * @author smlarson
 */
public class Raster_cr {
private static final String[] attrs = {CR};

	protected static final String jspPath = "/SLD/raster_cr.jsp";
	protected static final String units = "Inundate to Dynamic"; 
        protected static final List<Map<String, Object>> bins;
        
        // type = intervals for the ColorMap
        protected static final float[] thresholds = {0.0f, .31f, .66f, .95f}; //used to evaluate what color the pixel should receive. (index) 
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
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);    
}
