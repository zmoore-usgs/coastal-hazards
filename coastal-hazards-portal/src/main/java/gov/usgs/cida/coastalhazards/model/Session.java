package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Point;
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
@Table(name="session_table")
public class Session implements Serializable {
	private static final long serialVersionUID = 1L;
    
    @Id
    private transient String id;
    @Column(name = "map_base_layer")
    private String baselayer;
    @Column(name = "scale")
	private double scale;
    @Column(name = "bounding_box")
    private Envelope extent;
    @Column(name = "center")
	private Point center;
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
      name="session_item",
      joinColumns={@JoinColumn(name="session_id", referencedColumnName="id")},
      inverseJoinColumns={@JoinColumn(name="item_id", referencedColumnName="id")})
    private List<Item> items;
    
	/**
	 * Checks that the session has all required properties set
	 * @return 
	 */
    @Transient
	boolean isValid() {
        return (id != null && baselayer != null && !baselayer.isEmpty() &&
                scale > 0.0 && extent != null && center != null && center.isValid() &&
                items != null);
	}
    
    @Transient
    public String toJSON() {
        return new Gson().toJson(this);
    }
    
    @Transient
    private static String makeSHA1Hash(String json) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA1");
        md.reset();
        byte[] buffer = json.getBytes();
        md.update(buffer);
        byte[] digest = md.digest();

        String hexStr = "";
        for (int i = 0; i < digest.length; i++) {
            hexStr +=  Integer.toString( ( digest[i] & 0xff ) + 0x100, 16).substring( 1 );
        }
        return hexStr;
    }
    
    @Transient
    public static Session fromJSONString(String json) throws NoSuchAlgorithmException {
        String id = makeSHA1Hash(json);

        Session session;
        Gson gson = new GsonBuilder().create();
        session = gson.fromJson(json, Session.class);
        session.setId(id);
        return session;
    }

    public void setId(String id) {
        this.id = id;
    }
    
    public String getId() {
        return id;
    }
    
    public String getBaselayer() {
        return baselayer;
    }

    public void setBaselayer(String baselayer) {
        this.baselayer = baselayer;
    }

    public double getScale() {
        return scale;
    }

    public void setScale(double scale) {
        this.scale = scale;
    }

    public Envelope getExtent() {
        return extent;
    }

    public void setExtent(Envelope extent) {
        this.extent = extent;
    }

    public Point getCenter() {
        return center;
    }

    public void setCenter(Point center) {
        this.center = center;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }
}
