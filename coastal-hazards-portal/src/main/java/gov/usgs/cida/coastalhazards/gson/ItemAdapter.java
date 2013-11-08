package gov.usgs.cida.coastalhazards.gson;

import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import static gov.usgs.cida.coastalhazards.model.Item.ItemType.*;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import gov.usgs.cida.coastalhazards.model.AggregationItem;
import gov.usgs.cida.coastalhazards.model.DataItem;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Item.ItemType;
import java.lang.reflect.Type;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ItemAdapter implements JsonSerializer<Item>, JsonDeserializer<Item> {
    


    @Override
    public JsonElement serialize(Item src, Type typeOfSrc, JsonSerializationContext context) {
        return context.serialize(src);
    }

    @Override
    public Item deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
        Item item = null;
        
        JsonObject jsonObject =  json.getAsJsonObject();
        JsonPrimitive prim = (JsonPrimitive) jsonObject.get(Item.ITEM_TYPE);
        if (null == prim) {
            // Temporarily default to data as the default type (existing items don't have type)
            prim = new JsonPrimitive("data");
        }

        // I'm not going to surround this in try/catch to deal with 
        // IllegalArgumentException as I can't handle it at this level
        ItemType type = Item.ItemType.valueOf(prim.getAsString());
        Class<?> clazz = null;
        switch (type) {
            case aggregation:
                clazz = AggregationItem.class;
                break;
            case data:
                clazz = DataItem.class;
                break;
            default:
                // not of any type?
                // throw exception?
        }
        if (clazz != null) {
            item = context.deserialize(jsonObject, clazz);
        }
        return item;
    }

}
