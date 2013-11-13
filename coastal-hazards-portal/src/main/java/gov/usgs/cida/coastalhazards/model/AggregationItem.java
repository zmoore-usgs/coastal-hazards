package gov.usgs.cida.coastalhazards.model;

import gov.usgs.cida.coastalhazards.model.summary.Summary;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "aggregation_item")
public class AggregationItem extends Item {

	private static final long serialVersionUID = 2L;
    private List<Item> children;

    @ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(
			name = "aggregation_relationships",
			joinColumns = {
        @JoinColumn(name = "aggregation_id", referencedColumnName = "id")},
			inverseJoinColumns = {
		@JoinColumn(name = "item_id", referencedColumnName = "id")})
    public List<Item> getChildren() {
        return children;
    }

    public void setChildren(List<Item> children) {
        this.children = children;
    }
    
	public static AggregationItem fromJSON(String json) {
		AggregationItem aggregator = null;
		Item item = Item.fromJSON(json);
        if (item instanceof AggregationItem) {
            aggregator = (AggregationItem)item;
        } else {
            throw new IllegalArgumentException("JSON input must be of aggregation type");
        }
		return aggregator;
	}
}
