package gov.usgs.cida.coastalhazards.model;

import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.model.ogc.WFSService;
import gov.usgs.cida.coastalhazards.model.ogc.WMSService;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "data_item")
public class DataItem extends Item {
    
    // This will go away, replaced by root nodes
    public enum Type {
        storms,
        vulnerability,
        historical;
    }

	private static final long serialVersionUID = 2L;
	private String name;
	private String metadata;
    /** @deprecated */
	private Type type;
	private String attr;
    /** @deprecated */
    private transient Rank rank;
	private WFSService wfsService;
	private WMSService wmsService;

	@Column(name = "metadata")
	public String getMetadata() {
		return metadata;
	}

	public void setMetadata(String metadata) {
		this.metadata = metadata;
	}

    @Embedded
	public WFSService getWfsService() {
		return wfsService;
	}

	public void setWfsService(WFSService wfsService) {
		this.wfsService = wfsService;
	}

    @Embedded
	public WMSService getWmsService() {
		return wmsService;
	}

	public void setWmsService(WMSService wmsService) {
		this.wmsService = wmsService;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

    @Enumerated(EnumType.STRING)
	public Type getType() {
		return type;
	}

	public void setType(Type type) {
		this.type = type;
	}

	public String getAttr() {
		return attr;
	}

	public void setAttr(String attr) {
		this.attr = attr;
	}

    /** @deprecated */
    @OneToOne
    @PrimaryKeyJoinColumn(name = "id", referencedColumnName = "id")
    public Rank getRank() {
        return rank;
    }
    
    /** @deprecated */
    public void setRank(Rank rank) {
        this.rank = rank;
    }

    public static DataItem fromJSON(String json) {
		DataItem dataItem = null;
		Item item = Item.fromJSON(json);
        if (item instanceof DataItem) {
            dataItem = (DataItem)item;
        } else {
            throw new IllegalArgumentException("JSON input must be of type data");
        }
		return dataItem;
	}
}
