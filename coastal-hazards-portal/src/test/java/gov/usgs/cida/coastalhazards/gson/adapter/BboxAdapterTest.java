package gov.usgs.cida.coastalhazards.gson.adapter;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;
import gov.usgs.cida.coastalhazards.model.Bbox;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class BboxAdapterTest {
    
    private BboxAdapter bboxAdapter;
    
    public BboxAdapterTest() {
        bboxAdapter = new BboxAdapter();
    }
    
    @Test
    public void serializeTest() {
        Bbox bbox = new Bbox();
        bbox.setId(7);
        bbox.setBbox(12.3, 4.56, 78.9, 8.76);
        JsonElement serialized = bboxAdapter.serialize(bbox, Bbox.class, null);
        assertThat(serialized.toString(), is(equalTo("[12.3,4.56,78.9,8.76]")));
    }
    
    @Test
    public void deserializeTest() {
        JsonArray json = new JsonArray();
        json.add(new JsonPrimitive(12.3));
        json.add(new JsonPrimitive(-4.56));
        json.add(new JsonPrimitive(78.9));
        json.add(new JsonPrimitive(8.76));
        Bbox deserialized = bboxAdapter.deserialize(json, Bbox.class, null);
        assertThat(deserialized.getBbox(), is(equalTo("BOX(12.300000 -4.560000, 78.900000 8.760000)")));
    }
    
}
