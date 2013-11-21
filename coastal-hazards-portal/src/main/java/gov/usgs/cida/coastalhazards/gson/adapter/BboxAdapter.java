package gov.usgs.cida.coastalhazards.gson.adapter;

import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import gov.usgs.cida.coastalhazards.model.Bbox;
import java.lang.reflect.Type;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class BboxAdapter implements JsonSerializer<Bbox>, JsonDeserializer<Bbox>{

    @Override
    public JsonElement serialize(Bbox src, Type typeOfSrc, JsonSerializationContext context) {
        JsonArray bboxArray = new JsonArray();
        JsonPrimitive minx = new JsonPrimitive(src.getMinx());
        JsonPrimitive miny = new JsonPrimitive(src.getMiny());
        JsonPrimitive maxx = new JsonPrimitive(src.getMaxx());
        JsonPrimitive maxy = new JsonPrimitive(src.getMaxy());
        bboxArray.add(minx);
        bboxArray.add(miny);
        bboxArray.add(maxx);
        bboxArray.add(maxy);
        return bboxArray;
    }

    @Override
    public Bbox deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
        Bbox bbox = new Bbox();
        if (json instanceof JsonArray) {
            JsonArray array = (JsonArray)json;
            if (array.size() != 4) {
                throw new JsonParseException("Bbox must be of format [minX,minY,maxX,maxY]");
            }
            // TODO check validity of bbox
            bbox.setMinx(array.get(0).getAsDouble());
            bbox.setMiny(array.get(1).getAsDouble());
            bbox.setMaxx(array.get(2).getAsDouble());
            bbox.setMaxy(array.get(3).getAsDouble());
        } else {
            throw new JsonParseException("Bbox must be JSON array");
        }
        return bbox;
    }

}
