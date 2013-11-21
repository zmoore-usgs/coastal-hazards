package gov.usgs.cida.coastalhazards.gson;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gov.usgs.cida.coastalhazards.gson.adapter.BboxAdapter;
import gov.usgs.cida.coastalhazards.gson.adapter.CenterAdapter;
import gov.usgs.cida.coastalhazards.gson.adapter.DoubleSerializer;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Center;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class GsonSingleton {

    private static Gson singleton = null;
    private static final int doublePrecision = 10;
    
    public static Gson getInstance() {
        if (singleton == null) {
            singleton = new GsonBuilder()
                    .registerTypeAdapter(Bbox.class, new BboxAdapter())
                    .registerTypeAdapter(Center.class, new CenterAdapter())
                    .registerTypeAdapter(Double.class, new DoubleSerializer(doublePrecision))
                    .create();
                    
        }
        return singleton;
    }
}
