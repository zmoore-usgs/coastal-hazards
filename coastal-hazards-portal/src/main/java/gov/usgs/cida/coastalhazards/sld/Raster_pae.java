/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.Attributes.PAE;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List; 
import java.util.Map;

/**
 *
 * @author smlarson
 */
public class Raster_pae {
private static final String[] attrs = {PAE};

	protected static final String jspPath = "/SLD/raster_pae.jsp";
	protected static final String units = "probability"; //not applicable
        protected static final List<Map<String, Object>> bins;
        
        // type = intervals for the ColorMap
        protected static final float[] thresholds = {0.0f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f}; //used to evaluate what color the pixel should receive. (index) 
	protected static final String[] colors = {"#00A8E6", "#BEE8FF", "#B4D79D", "#FEFF73", "#FFAA01", "#FF7F7E"}; 
        
	static {
		List<Map<String, Object>> binsResult = new ArrayList<>();
                
		for (int i = 0; i < colors.length; i++) {
			Map<String, Object> binMap = new LinkedHashMap<>();
			
                        binMap.put("lowerBound", thresholds[i]);
                        binMap.put("upperBound", thresholds[i+1]);
                        binMap.put("color", colors[i]);
                        
			binsResult.add(binMap);
		}
		bins = binsResult;
	}

	public static final SLDConfig rasterConfig = new SLDConfig(
			jspPath, units, SLDGenerator.style, SLDGenerator.STROKE_WIDTH_DEFAULT, attrs, thresholds, colors, bins
	);
        
}
