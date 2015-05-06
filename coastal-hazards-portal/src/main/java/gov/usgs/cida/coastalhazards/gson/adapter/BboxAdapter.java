package gov.usgs.cida.coastalhazards.gson.adapter;

import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.vividsolutions.jts.geom.Envelope;
import gov.usgs.cida.coastalhazards.model.Bbox;
import java.lang.reflect.Type;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class BboxAdapter implements JsonSerializer<Bbox>, JsonDeserializer<Bbox> {

	@Override
	public JsonElement serialize(Bbox src, Type typeOfSrc, JsonSerializationContext context) {
		JsonArray bboxArray = new JsonArray();

		Envelope envelope = src.makeEnvelope();
		if (envelope != null) {
			JsonPrimitive minx = new JsonPrimitive(envelope.getMinX());
			JsonPrimitive miny = new JsonPrimitive(envelope.getMinY());
			JsonPrimitive maxx = new JsonPrimitive(envelope.getMaxX());
			JsonPrimitive maxy = new JsonPrimitive(envelope.getMaxY());
			bboxArray.add(minx);
			bboxArray.add(miny);
			bboxArray.add(maxx);
			bboxArray.add(maxy);
		}
		return bboxArray;
	}

	@Override
	public Bbox deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
		Bbox bbox = new Bbox();
		if (json instanceof JsonArray) {
			JsonArray array = (JsonArray) json;
			if (array.size() == 4) {
				double minX = array.get(0).getAsDouble();
				double minY = array.get(1).getAsDouble();
				double maxX = array.get(2).getAsDouble();
				double maxY = array.get(3).getAsDouble();
				bbox.setBbox(minX, minY, maxX, maxY);
			} else if (array.size() == 0) {
				bbox.setBbox(null);
			} else {
				throw new JsonParseException("Bbox must be of format [minX,minY,maxX,maxY]");
			}
		} else {
			throw new JsonParseException("Bbox must be JSON array");
		}
		return bbox;
	}

}
