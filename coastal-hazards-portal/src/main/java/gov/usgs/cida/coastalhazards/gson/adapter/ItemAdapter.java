package gov.usgs.cida.coastalhazards.gson.adapter;

import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.Item;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ItemAdapter implements JsonSerializer<Item>, JsonDeserializer<Item> {

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

    @Override
    public Item deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
        Item result = null;
        Object defaultObj = GsonUtil.getDefault().fromJson(json, typeOfT);
        if (defaultObj instanceof Item) {
            result = (Item)defaultObj;
            if (json instanceof JsonObject) {
                JsonObject itemJson = (JsonObject)json;
                JsonElement children = itemJson.get("children");
                if (children instanceof JsonArray) {
                    JsonArray childrenArray = (JsonArray)children;
                    List<Item> childrenList = new ArrayList<>();
                    Iterator<JsonElement> iterator = childrenArray.iterator();
                    while (iterator.hasNext()) {
                        JsonElement childItem = iterator.next();
                        try {
                            Item childItemObj = (Item)context.deserialize(childItem, Item.class);
                            childrenList.add(childItemObj);
                        } catch (JsonParseException ex) {
                            // Unable to deserialize when Item isn't in children
                        }
                    }
                    result.setChildren(childrenList);
                }
            }
        }
        return result;
    }

}
