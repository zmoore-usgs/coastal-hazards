package gov.usgs.cida.coastalhazards.gson.adapter;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.Item;
import java.lang.reflect.Type;
import java.util.List;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ItemAdapter implements JsonSerializer<Item> {

    @Override
    public JsonElement serialize(Item src, Type typeOfSrc, JsonSerializationContext context) {
        JsonElement item = GsonUtil.getDefault().toJsonTree(src, typeOfSrc);
        if (item instanceof JsonObject) {
            JsonObject json = (JsonObject)item;

            List<Item> items = src.getChildren();
            if (items != null) {
                JsonArray children = new JsonArray();
                for (Item child : items) {
                    children.add(context.serialize(child));
                }
                json.add("children", children);
            }

            item = json;
        }
        return item;
    }

}
