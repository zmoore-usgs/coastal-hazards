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
public final class Shorelines extends SLDGenerator {
    
    public final int STROKE_WIDTH = 2;
    public final int STROKE_OPACITY = 1;
    private String[] attrs = {"DATE", "DATE_"};
    private String[] colors = {"#ff0000", "#bf6c60", "#ffa640", "#a68500", "#86bf60", "#009952", "#007a99", "#0074d9", "#5630bf", "#f780ff", "#ff0066", "#ff8091", "#f20000", "#ff7340", "#bf9360", "#bfb960", "#44ff00", "#3df2b6", "#73cfe6", "#0066ff", "#9173e6", "#bf30a3", "#bf3069", "#a60000", "#a65b29", "#ffcc00", "#90d900", "#00d957", "#60bfac", "#0091d9", "#2200ff", "#b63df2", "#f279ba", "#a6293a"};
    private final int binCount = 34;
    
    public Shorelines(Item item) {
        super(item);
    }

    @Override
    public Response generateSLD() {
        return Response.ok(new Viewable("/shorelines.jsp", this)).build();
    }

    @Override
    public Response generateSLDInfo() {
        Map<String, Object> sldInfo = new LinkedHashMap<String, Object>();
        sldInfo.put("title", item.getSummary().getTiny().getText());
        sldInfo.put("units", "year");
        List<Map<String,Object>> bins = new ArrayList<Map<String,Object>>();
        for (int i=0; i<binCount; i++) {
            List<Integer> years = new ArrayList<Integer>();
            int j=i;
            while(j<100) {
                years.add(j);
                j += binCount;
            }
            Map<String, Object> binMap = new LinkedHashMap<String,Object>();
            binMap.put("years", years);
            binMap.put("color", colors[i]);
            bins.add(binMap);
        }
        sldInfo.put("bins", bins);
        String toJson = new Gson().toJson(sldInfo, HashMap.class);
        return Response.ok(toJson).build();
    }

    @Override
    public String[] getAttrs() {
        return this.attrs;
    }
    
    public String getId() {
        return this.item.getWmsService().getLayers();
    }
    
    public int getBinCount() {
        return this.binCount;
    }
    
    public String getAttr() {
        return this.item.getAttr();
    }
    
    public String[] getColors() {
        return this.colors;
    }

    public int getSTROKE_WIDTH() {
        return STROKE_WIDTH;
    }

    public int getSTROKE_OPACITY() {
        return STROKE_OPACITY;
    }

}
