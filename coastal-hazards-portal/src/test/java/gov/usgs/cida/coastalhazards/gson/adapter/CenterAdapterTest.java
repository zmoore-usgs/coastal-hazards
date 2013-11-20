package gov.usgs.cida.coastalhazards.gson.adapter;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Center;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class CenterAdapterTest {
    
    private CenterAdapter centerAdapter;
    
    public CenterAdapterTest() {
        centerAdapter = new CenterAdapter();
    }
    
    @Test
    public void serializeTest() {
        Center center = new Center();
        center.setId(7);
        center.setX(12.3);
        center.setY(4.56);
        JsonElement serialized = centerAdapter.serialize(center, Center.class, null);
        assertThat(serialized.toString(), is(equalTo("[12.3,4.56]")));
    }
    
    @Test
    public void deserializeTest() {
        JsonArray json = new JsonArray();
        json.add(new JsonPrimitive(12.3));
        json.add(new JsonPrimitive(4.56));
        Center deserialized = centerAdapter.deserialize(json, Center.class, null);
        
        assertThat(deserialized.getX(), is(equalTo(12.3)));
        assertThat(deserialized.getY(), is(equalTo(4.56)));
    }
    
}
