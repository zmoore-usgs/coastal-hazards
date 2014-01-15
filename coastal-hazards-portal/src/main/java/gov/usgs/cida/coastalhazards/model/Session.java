package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.utilities.string.StringHelper;
import java.io.Serializable;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import javax.persistence.*;
import org.hibernate.annotations.ForeignKey;
import org.hibernate.annotations.IndexColumn;

/**
 *
 * @author isuftin
 */
@Entity
@Table(name = "session_table")
public class Session implements Serializable {

	private static final long serialVersionUID = 1234567L;
	private transient String id;
	private String baselayer;
	private double scale;
	private Bbox bbox;
	private Center center;
	private List<SessionItem> items;

	/**
	 * Checks that the session has all required properties set
	 *
	 * @return
	 */
	@Transient
	boolean isValid() {
		return (id != null && baselayer != null && !baselayer.isEmpty()
				&& scale > 0.0 && bbox != null
				&& center != null);
	}

	public String toJSON() {
		return GsonUtil.getDefault()
				.toJson(this);
	}

	public static Session fromJSON(String json) throws NoSuchAlgorithmException {
		String id = StringHelper.makeSHA1Hash(json);

		Session session;
		Gson gson = GsonUtil.getDefault();

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

    @ElementCollection
    @CollectionTable(name="session_item", joinColumns=@JoinColumn(name="session_id"))
    @AttributeOverrides({
        @AttributeOverride(name="itemId", column=@Column(name="item_id"))
    })
    @IndexColumn(name = "list_index")
	public List<SessionItem> getItems() {
		return items;
	}

	public void setItems(List<SessionItem> items) {
		this.items = items;
	}
}