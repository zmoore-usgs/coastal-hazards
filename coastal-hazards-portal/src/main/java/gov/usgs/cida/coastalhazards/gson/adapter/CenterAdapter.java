package gov.usgs.cida.coastalhazards.gson.adapter;

import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import gov.usgs.cida.coastalhazards.model.Center;
import java.lang.reflect.Type;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CenterAdapter implements JsonSerializer<Center>, JsonDeserializer<Center>{

    @Override
    public JsonElement serialize(Center src, Type typeOfSrc, JsonSerializationContext context) {
        JsonArray centerArray = new JsonArray();
        JsonPrimitive x = new JsonPrimitive(src.getX());
        JsonPrimitive y = new JsonPrimitive(src.getY());
        centerArray.add(x);
        centerArray.add(y);
        return centerArray;
    }

    @Override
    public Center deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
        Center center = new Center();
        if (json instanceof JsonArray) {
            JsonArray array = (JsonArray)json;
            if (array.size() != 2) {
                throw new JsonParseException("Center must be of format [x,y]");
            }
            // TODO check validity of bbox
            center.setX(array.get(0).getAsDouble());
            center.setY(array.get(1).getAsDouble());
        } else {
            throw new JsonParseException("Center must be JSON array");
        }
        return center;
    }

}
