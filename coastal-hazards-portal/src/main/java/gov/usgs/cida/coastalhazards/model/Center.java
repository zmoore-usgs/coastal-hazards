package gov.usgs.cida.coastalhazards.model;

import java.io.Serializable;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name="center")
public class Center implements Serializable {
	private static final long serialVersionUID = 1L;
    
    private int id;
    private double x;
    private double y;

    @Id
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

}
