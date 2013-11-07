package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gov.usgs.cida.coastalhazards.gson.ItemAdapter;
import gov.usgs.cida.coastalhazards.gson.serializer.DoubleSerializer;
import gov.usgs.cida.utilities.IdGenerator;
import java.io.Serializable;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "item_parent")
public class Item implements Serializable {
    
    public enum ItemType {
        aggregation,
        data,
        splitter;
    }

    private static final long serialVersionUID = 2L;
    private static final int doublePrecision = 5;
    
    public static final String ITEM_TYPE = "itemType";
    
    protected String id;
    protected ItemType itemType;

    @Id
    public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
    
    @Enumerated(EnumType.STRING)
    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }
    
    public static Item fromJSON(String json) {

		Item node;
		GsonBuilder gsonBuilder = new GsonBuilder();
        gsonBuilder.registerTypeAdapter(Item.class, new ItemAdapter());
//        gsonBuilder.registerTypeAdapter(Geometry.class, new GeometryDeserializer());
//        gsonBuilder.registerTypeAdapter(Envelope.class, new EnvelopeDeserializer());
//        gsonBuilder.registerTypeAdapter(CoordinateSequence.class, new CoordinateSequenceDeserializer());
		Gson gson = gsonBuilder.create();

		node = gson.fromJson(json, Item.class);
		if (node.getId() == null) {
			node.setId(IdGenerator.generate());
		}
		return node;
	}

	public String toJSON() {
		return new GsonBuilder()
				.registerTypeAdapter(Double.class, new DoubleSerializer(doublePrecision))
				.create()
				.toJson(this);
	}
}
