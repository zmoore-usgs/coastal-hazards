package gov.usgs.cida.coastalhazards.model;

import gov.usgs.cida.coastalhazards.model.summary.Summary;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gov.usgs.cida.coastalhazards.gson.serializer.DoubleSerializer;
import gov.usgs.cida.coastalhazards.model.ogc.WFSService;
import gov.usgs.cida.coastalhazards.model.ogc.WMSService;
import gov.usgs.cida.utilities.IdGenerator;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "aggregation")
public class AggregationItem extends Item {

	private static final long serialVersionUID = 2L;
	private static final int doublePrecision = 5;
	private String name;
	private String metadata;
	private String attr;
    private transient Rank rank;
	private Summary summary;

	@Id
    @Override
	public String getId() {
		return super.getId();
	}

	@Column(name = "metadata")
	public String getMetadata() {
		return metadata;
	}

	public void setMetadata(String metadata) {
		this.metadata = metadata;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getAttr() {
		return attr;
	}

	public void setAttr(String attr) {
		this.attr = attr;
	}

    @OneToOne
    @PrimaryKeyJoinColumn(name = "id", referencedColumnName = "id")
    public Rank getRank() {
        return rank;
    }

    public void setRank(Rank rank) {
        this.rank = rank;
    }

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(columnDefinition = "summary_id")
	public Summary getSummary() {
		return summary;
	}

	public void setSummary(Summary summary) {
		this.summary = summary;
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
