package gov.usgs.cida.coastalhazards.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Immutable
@Table(name="ranking")
public class Rank {
    
    
    private String id;
    private double totalScore;

    @Id
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Column(name = "total_score")
    public double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(double totalScore) {
        this.totalScore = totalScore;
    }

}
