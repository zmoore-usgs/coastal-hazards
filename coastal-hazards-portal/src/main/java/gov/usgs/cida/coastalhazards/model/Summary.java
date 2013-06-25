package gov.usgs.cida.coastalhazards.model;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * This object may be deprecated in favor of an on the fly service
 * *or* we could run the service once and store the results
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "summary")
public class Summary implements Serializable {
	private static final long serialVersionUID = 182763L;

    private transient int id;
    private String tiny;
    private String medium;
    private String full;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTiny() {
        return tiny;
    }

    public void setTiny(String tiny) {
        this.tiny = tiny;
    }

    @Column(length = 1023)
    public String getMedium() {
        return medium;
    }

    public void setMedium(String medium) {
        this.medium = medium;
    }

    @Column(length = 1023, name = "full_text")
    public String getFull() {
        return full;
    }

    public void setFull(String full) {
        this.full = full;
    }
    
}
