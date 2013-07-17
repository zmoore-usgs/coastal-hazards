package gov.usgs.cida.coastalhazards.model;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
public class TinyGov implements Serializable{

    
    private String fullUrl;
    private String tinyUrl;

    @Id
    @Column(name="full_url", length = 512)
    public String getFullUrl() {
        return fullUrl;
    }

    public void setFullUrl(String fullUrl) {
        this.fullUrl = fullUrl;
    }

    @Column(name="tiny_url", length = 64)
    public String getTinyUrl() {
        return tinyUrl;
    }

    public void setTinyUrl(String tinyUrl) {
        this.tinyUrl = tinyUrl;
    }
    
}
