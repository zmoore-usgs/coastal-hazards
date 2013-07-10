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
public final class DuneHeight extends SLDGenerator {

    private static final String[] attrs = {"DHIGH", "DLOW"};
    private static final int STROKE_WIDTH = 3;
    private static final int STROKE_OPACITY = 1;
    private static final String style = "dune";
    private static final float[] thresholdsCrest = {2.0f, 3.5f, 5.0f, 6.5f, 8.0f};
    private static final float[] thresholdsToe = {1.0f, 2.0f, 3.0f, 4.0f, 5.0f};
    private static final String[] colorsCrest = {"#D6C19D", "#BAA282", "#A18769", "#896B55", "#725642", "#5B4030"};
    private static final String[] colorsToe = {"#D7F1AF", "#BBD190", "#A3B574", "#8C9C5A", "#768242", "#5F6A27"};
    private static final int binCount = 6;
    
    public DuneHeight(Item item) {
        super(item);
    }
    
    @Override
    public String[] getAttrs() {
        return attrs;
    }
    
    @Override
    public Response generateSLD() {
        return Response.ok(new Viewable("/dune.jsp", this)).build();
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
                binMap.put("lowerBound", getThresholds()[i]);
            }
            if (i+1 < getBinCount()) {
                binMap.put("upperBound", getThresholds()[i+1]);
            }
            binMap.put("color", getColors()[i]);
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
        float[] thresholds;
        if ("DHIGH".equalsIgnoreCase(item.getAttr())) {
            thresholds = thresholdsCrest;
        } else if ("DLOW".equalsIgnoreCase(item.getAttr())) {
            thresholds = thresholdsToe;
        } else {
            throw new IllegalStateException("getThresholds() called on invalid attribute");
        }
        return thresholds;
    }

    public String[] getColors() {
        String[] colors;
        if ("DHIGH".equalsIgnoreCase(item.getAttr())) {
            colors = colorsCrest;
        } else if ("DLOW".equalsIgnoreCase(item.getAttr())) {
            colors = colorsToe;
        } else {
            throw new IllegalStateException("getColors() called on invalid attribute");
        }
        return colors;
    }
    
    public int getBinCount() {
        return binCount;
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
