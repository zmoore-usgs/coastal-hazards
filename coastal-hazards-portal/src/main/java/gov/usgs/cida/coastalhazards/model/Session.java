package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.utilities.Cacheable;
import gov.usgs.cida.utilities.string.StringHelper;
import java.io.Serializable;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.List;
import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.CascadeType;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;
import org.hibernate.annotations.IndexColumn;

/**
 *
 * @author isuftin
 */
@Entity
@Table(name = "session_table")
public class Session implements Serializable, Cacheable {
    
    private static final long serialVersionUID = -366632819029817570L;

	private transient String id;
	private String baselayer;
	private double scale;
	private Bbox bbox;
	private Center center;
	private List<SessionItem> items;
    private Date lastModified;

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

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "last_modified")
    @Override
    public Date getLastModified() {
        return lastModified;
    }

    public void setLastModified(Date lastModified) {
        this.lastModified = lastModified;
    }
    
    @PrePersist
	@PreUpdate
    protected void timestamp() {
        this.lastModified = new Date();
    }
    
}