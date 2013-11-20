package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gov.usgs.cida.coastalhazards.gson.adapter.BboxAdapter;
import gov.usgs.cida.coastalhazards.gson.adapter.CenterAdapter;
import gov.usgs.cida.coastalhazards.gson.adapter.DoubleSerializer;
import gov.usgs.cida.utilities.string.StringHelper;
import java.io.Serializable;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import javax.persistence.*;

/**
 *
 * @author isuftin
 */
@Entity
@Table(name = "session_table")
public class Session implements Serializable {

	private static final long serialVersionUID = 1234567L;
	private static final int doublePrecision = 10;
	private transient String id;
	private String baselayer;
	private double scale;
	private Bbox bbox;
	private Center center;
	private List<Item> items;

	/**
	 * Checks that the session has all required properties set
	 *
	 * @return
	 */
	@Transient
	boolean isValid() {
		return (id != null && baselayer != null && !baselayer.isEmpty()
				&& scale > 0.0 && bbox != null //&& bbox.length == 4 (bbox.isValid?)
				&& center != null // && center.length == 2); (center.isValid?)
                );
	}

	public String toJSON() {
		return new GsonBuilder()
				.registerTypeAdapter(Double.class, new DoubleSerializer(doublePrecision))
                .registerTypeAdapter(Bbox.class, new BboxAdapter())
                .registerTypeAdapter(Center.class, new CenterAdapter())
				.create()
				.toJson(this);
	}

	public static Session fromJSON(String json) throws NoSuchAlgorithmException {
		String id = StringHelper.makeSHA1Hash(json);

		Session session;
		GsonBuilder gsonBuilder = new GsonBuilder()
            .registerTypeAdapter(Bbox.class, new BboxAdapter())
            .registerTypeAdapter(Center.class, new CenterAdapter());
//        gsonBuilder.registerTypeAdapter(Geometry.class, new GeometryDeserializer());
//        gsonBuilder.registerTypeAdapter(Envelope.class, new EnvelopeDeserializer());
//        gsonBuilder.registerTypeAdapter(CoordinateSequence.class, new CoordinateSequenceDeserializer());
		Gson gson = gsonBuilder.create();

		session = gson.fromJson(json, Session.class);
		session.setId(id);
		return session;
	}

	public void setId(String id) {
		this.id = id;
	}

	@Id
	public String getId() {
		return id;
	}

	@Column(name = "map_base_layer")
	public String getBaselayer() {
		return baselayer;
	}

	public void setBaselayer(String baselayer) {
		this.baselayer = baselayer;
	}

	@Column(name = "scale")
	public double getScale() {
		return scale;
	}

	public void setScale(double scale) {
		this.scale = scale;
	}

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(columnDefinition = "bbox_id")
	public Bbox getBbox() {
		return bbox;
	}

	public void setBbox(Bbox bbox) {
		this.bbox = bbox;
	}

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(columnDefinition = "center_id")
	public Center getCenter() {
		return center;
	}

	public void setCenter(Center center) {
		this.center = center;
	}

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(
			name = "session_item",
			joinColumns = {
		@JoinColumn(name = "session_id", referencedColumnName = "id")},
			inverseJoinColumns = {
		@JoinColumn(name = "item_id", referencedColumnName = "id")})
	public List<Item> getItems() {
		return items;
	}

	public void setItems(List<Item> items) {
		this.items = items;
	}
}
