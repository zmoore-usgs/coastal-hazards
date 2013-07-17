package gov.usgs.cida.coastalhazards.sld;

import com.google.gson.Gson;
import com.sun.jersey.api.view.Viewable;
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
public final class BayesianCVI extends SLDGenerator {

    private static final String[] attrs = {"RSLR", "MWH", "TR", "E_RATE", "PEROS2", "PEROS1", "PSTABLE", "PACC1", "PACC2"};
    private static final int STROKE_WIDTH = 3;
    private static final int STROKE_OPACITY = 1;
    private static final float[] thresholds = {1.0f, 10.0f, 33.0f, 66.0f, 90.0f, 99.0f};
    private static final String[] colors = {"#005CE6", "#00A884", "#55FF00", "#FFFF00", "#FFAA00", "#FF0000", "#734C00"};
    
    public BayesianCVI(Item item) {
        super(item);
    }
    
    @Override
    public String[] getAttrs() {
        return attrs;
    }
    
    @Override
    public Response generateSLD() {
        return Response.ok(new Viewable("/bins_point.jsp", this)).build();
    }
    
    @Override
    public Response generateSLDInfo() {
        Map<String, Object> sldInfo = new LinkedHashMap<String, Object>();
        sldInfo.put("title", item.getSummary().getTiny().getText());
        sldInfo.put("units", "%");
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
        String toJson = new Gson().toJson(sldInfo, HashMap.class);
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
