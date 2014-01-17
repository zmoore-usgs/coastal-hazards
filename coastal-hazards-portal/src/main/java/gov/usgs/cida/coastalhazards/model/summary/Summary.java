package gov.usgs.cida.coastalhazards.model.summary;

import java.io.Serializable;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;

/**
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "summary")
public class Summary implements Serializable {
	private static final long serialVersionUID = 182763L;

    private transient int id;
    private String version;
    private Tiny tiny;
    private Medium medium;
    private Full full;
    private String keywords;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    @Embedded
    public Tiny getTiny() {
        return tiny;
    }

    public void setTiny(Tiny tiny) {
        this.tiny = tiny;
    }

    @Embedded
    public Medium getMedium() {
        return medium;
    }

    public void setMedium(Medium medium) {
        this.medium = medium;
    }

    @OneToOne(cascade = CascadeType.ALL)
    public Full getFull() {
        return full;
    }

    public void setFull(Full full) {
        this.full = full;
    }

    @Column(length = 2048)
    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }
    
    public static Summary copyValues(final Summary from, final Summary to) {
        Summary summary = new Summary();
        summary.setId(to.getId());
        summary.setVersion(from.getVersion());
        summary.setTiny(from.getTiny());
        summary.setMedium(from.getMedium());
        summary.setFull(Full.copyValues(from.getFull(), to.getFull()));
        summary.setKeywords(from.getKeywords());
        return summary;
    }
}
