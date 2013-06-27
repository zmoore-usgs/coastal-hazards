package gov.usgs.cida.coastalhazards.model.summary;

import java.io.Serializable;
import javax.persistence.CascadeType;
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
    private Tiny tiny;
    private Medium medium;
    private Full full;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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
    
}
