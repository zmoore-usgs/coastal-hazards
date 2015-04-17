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
import java.util.List;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ItemTreeAdapter implements JsonSerializer<Item> {

	@Override
	public JsonElement serialize(Item src, Type typeOfSrc, JsonSerializationContext context) {
		JsonElement fullItem = GsonUtil.getDefault().toJsonTree(src, typeOfSrc);
		JsonObject simplified = new JsonObject();
		if (fullItem instanceof JsonObject) {
			JsonObject json = (JsonObject) fullItem;
			simplified.add("id", json.get("id"));
			simplified.add("itemType", json.get("itemType"));
			simplified.add("title", json.getAsJsonObject("summary").getAsJsonObject("full").get("title"));

			List<Item> items = src.getChildren();
			if (items != null) {
				JsonArray children = new JsonArray();
				for (Item child : items) {
					children.add(context.serialize(child));
				}
				simplified.add("children", children);
			}
		}
		else {
			throw new IllegalStateException("Item must be an object");
		}
		return simplified;
	}

}
