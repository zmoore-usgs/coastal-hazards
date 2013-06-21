package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gov.usgs.cida.coastalhazards.gson.serializer.DoubleSerializer;
import java.io.Serializable;
import java.security.MessageDigest;
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
	private double[] bbox;
	private double[] center;
	private List<Item> items;

	/**
	 * Checks that the session has all required properties set
	 *
	 * @return
	 */
	@Transient
	boolean isValid() {
		return (id != null && baselayer != null && !baselayer.isEmpty()
				&& scale > 0.0 && bbox != null && bbox.length == 4
				&& center != null && center.length == 2);// &&
		// items != null);
	}

	public String toJSON() {
		return new GsonBuilder()
				.registerTypeAdapter(Double.class, new DoubleSerializer(doublePrecision))
				.create()
				.toJson(this);
	}

	private static String makeSHA1Hash(String json) throws NoSuchAlgorithmException {
		MessageDigest md = MessageDigest.getInstance("SHA1");
		md.reset();
		byte[] buffer = json.getBytes();
		md.update(buffer);
		byte[] digest = md.digest();

		String hexStr = "";
		for (int i = 0; i < digest.length; i++) {
			hexStr += Integer.toString((digest[i] & 0xff) + 0x100, 16).substring(1);
		}
		return hexStr;
	}

	public static Session fromJSON(String json) throws NoSuchAlgorithmException {
		String id = makeSHA1Hash(json);

		Session session;
		GsonBuilder gsonBuilder = new GsonBuilder();
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

	@Column(name = "bounding_box")
	public double[] getBbox() {
		return bbox;
	}

	public void setBbox(double[] bbox) {
		this.bbox = bbox;
	}

	@Column(name = "center")
	public double[] getCenter() {
		return center;
	}

	public void setCenter(double[] center) {
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
