package gov.usgs.cida.coastalhazards.gson.adapter;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.Item;
import java.lang.reflect.Type;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ItemProxyAdapter implements JsonSerializer<Item> {

    @Override
    public JsonElement serialize(Item src, Type typeOfSrc, JsonSerializationContext context) {
        JsonElement item = GsonUtil.getDefault().toJsonTree(src, typeOfSrc);
        if (item instanceof JsonObject) {
            JsonObject json = (JsonObject)item;
            JsonArray children = new JsonArray();
            for (String id : src.proxiedChildren()) {
                children.add(new JsonPrimitive(id));
            }
            json.add("children", children);
            item = json;
        }
        return item;
    }

}
