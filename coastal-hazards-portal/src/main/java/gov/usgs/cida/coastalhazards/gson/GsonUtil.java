package gov.usgs.cida.coastalhazards.gson;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gov.usgs.cida.coastalhazards.gson.adapter.BboxAdapter;
import gov.usgs.cida.coastalhazards.gson.adapter.CenterAdapter;
import gov.usgs.cida.coastalhazards.gson.adapter.DoubleSerializer;
import gov.usgs.cida.coastalhazards.gson.adapter.FullSummaryAdapter;
import gov.usgs.cida.coastalhazards.gson.adapter.ItemAdapter;
import gov.usgs.cida.coastalhazards.gson.adapter.ItemProxyAdapter;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Center;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.summary.Full;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class GsonUtil {

    private static Gson defaultGson = null;
    private static Gson proxyGson = null;
    private static Gson subtreeGson = null;
    private static final int doublePrecision = 10;
    
    public static Gson getDefault() {
        if (defaultGson == null) {
            defaultGson = new GsonBuilder()
                    .registerTypeAdapter(Bbox.class, new BboxAdapter())
                    .registerTypeAdapter(Center.class, new CenterAdapter())
                    .registerTypeAdapter(Double.class, new DoubleSerializer(doublePrecision))
                    .registerTypeAdapter(Full.class, new FullSummaryAdapter())
                    .create(); 
        }
        return defaultGson;
    }
    
    public static Gson getIdOnlyGson() {
        if (proxyGson == null) {
            proxyGson = new GsonBuilder()
                    .registerTypeAdapter(Bbox.class, new BboxAdapter())
                    .registerTypeAdapter(Center.class, new CenterAdapter())
                    .registerTypeAdapter(Double.class, new DoubleSerializer(doublePrecision))
                    .registerTypeAdapter(Item.class, new ItemProxyAdapter())
                    .registerTypeAdapter(Full.class, new FullSummaryAdapter())
                    .create(); 
        }
        return proxyGson;
    }
    
    public static Gson getSubtreeGson() {
        if (subtreeGson == null) {
            subtreeGson = new GsonBuilder()
                    .registerTypeAdapter(Bbox.class, new BboxAdapter())
                    .registerTypeAdapter(Center.class, new CenterAdapter())
                    .registerTypeAdapter(Double.class, new DoubleSerializer(doublePrecision))
                    .registerTypeAdapter(Item.class, new ItemAdapter())
                    .create(); 
        }
        return subtreeGson;
    }
}
