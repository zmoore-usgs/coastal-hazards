package gov.usgs.cida.coastalhazards.model;

import gov.usgs.cida.coastalhazards.model.summary.Summary;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gov.usgs.cida.coastalhazards.gson.serializer.DoubleSerializer;
import gov.usgs.cida.coastalhazards.model.ogc.WFSService;
import gov.usgs.cida.coastalhazards.model.ogc.WMSService;
import gov.usgs.cida.utilities.IdGenerator;
import java.io.Serializable;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
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
@Table(name = "item")
public class DataItem extends Item {
    
    // This will go away, replaced by root nodes
    public enum Type {
        storms,
        vulnerability,
        historical;
    }

	private static final long serialVersionUID = 2L;
	private static final int doublePrecision = 5;
	private String name;
	private String metadata;
	private Type type;
	private String attr;
    private transient Rank rank;
	private double[] bbox;
	private WFSService wfsService;
	private WMSService wmsService;
	private Summary summary;
    

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

    @OneToOne
    @PrimaryKeyJoinColumn(name = "id", referencedColumnName = "id")
    public Rank getRank() {
        return rank;
    }

    public void setRank(Rank rank) {
        this.rank = rank;
    }

	public double[] getBbox() {
		return bbox;
	}

	public void setBbox(double[] bbox) {
		this.bbox = bbox;
	}

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(columnDefinition = "summary_id")
	public Summary getSummary() {
		return summary;
	}

	public void setSummary(Summary summary) {
		this.summary = summary;
	}

}
