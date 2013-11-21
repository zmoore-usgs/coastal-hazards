package gov.usgs.cida.coastalhazards.sld;

import com.google.gson.Gson;
import com.sun.jersey.api.view.Viewable;
import gov.usgs.cida.coastalhazards.gson.GsonSingleton;
import gov.usgs.cida.coastalhazards.model.Item;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.ws.rs.core.Response;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public final class MeanWaterLevel extends SLDGenerator {

    private static final String[] attrs = {"MEAN1", "MEAN2", "MEAN3", "MEAN4", "MEAN5", "MEAN"};
    private static final int STROKE_WIDTH = 3;
    private static final int STROKE_OPACITY = 1;
    private static final float[] thresholds = {3.5f, 5.0f, 6.5f, 8.0f};
    private static final String[] colors = {"#BFFFE9", "#7ABCE6", "#1F84E1", "#1945B8", "#070791"};
    
    public MeanWaterLevel(Item item) {
        super(item);
    }
    
    @Override
    public String[] getAttrs() {
        return attrs;
    }
    
    @Override
    public Response generateSLD() {
        return Response.ok(new Viewable("/bins_line.jsp", this)).build();
    }
    
    @Override
    public Response generateSLDInfo() {
        Map<String, Object> sldInfo = new LinkedHashMap<String, Object>();
        sldInfo.put("title", item.getSummary().getTiny().getText());
        sldInfo.put("units", "m");
        sldInfo.put("style", getStyle());
        List<Map<String,Object>> bins = new ArrayList<Map<String,Object>>();
        for (int i=0; i<getBinCount(); i++) {
            Map<String, Object> binMap = new LinkedHashMap<String,Object>();
            if (i > 0) {
                binMap.put("lowerBound", getThresholds()[i-1]);
            }
            if (i+1 < getBinCount()) {
                binMap.put("upperBound", getThresholds()[i]);
            }
            binMap.put("color", colors[i]);
            bins.add(binMap);
        }
        sldInfo.put("bins", bins);
        String toJson = GsonSingleton.getInstance().toJson(sldInfo, HashMap.class);
        return Response.ok(toJson).build();
    }
    
    public String getId() {
        return item.getWmsService().getLayers();
    }

    public String getAttr() {
        return item.getAttr();
    }

    public float[] getThresholds() {
        return thresholds;
    }

    public String[] getColors() {
        return colors;
    }
    
    public int getBinCount() {
        return colors.length;
    }

    @Override
    public String getStyle() {
        return style;
    }

    public int getSTROKE_WIDTH() {
        return STROKE_WIDTH;
    }

    public int getSTROKE_OPACITY() {
        return STROKE_OPACITY;
    }
}
