package gov.usgs.cida.coastalhazards.model.summary;

import gov.usgs.cida.utilities.StringPrecondition;
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

	public static final int VERSION_MAX_LENGTH = 15;

	private transient int id;
	private String version;
	private Tiny tiny;
	private Legend legend;
	private Medium medium;
	private Full full;
	private String keywords;
	private Download download;
	private String metadataDownload;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	@Column(name = "version", length = VERSION_MAX_LENGTH)
	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		StringPrecondition.checkStringArgument(version, VERSION_MAX_LENGTH);
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
	public Legend getLegend() {
		return legend;
	}

	public void setLegend(Legend legend) {
		this.legend = legend;
	}
	
	@Embedded
	public Download getDownload() {
		return download;
	}
	
	public void setDownload(Download download) {
		this.download = download;
	}

	@Column(name = "metadata_download_link")
	public String getMetadataDownload() {
		return metadataDownload;
	}
	
	public void setMetadataDownload(String metadataDownload) {
		this.metadataDownload = metadataDownload;
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

	public String getKeywords() {
		return keywords;
	}

	public void setKeywords(String keywords) {
		this.keywords = keywords;
	}

	public static Summary copyValues(final Summary from, final Summary to) {
		Summary summary = null;
		if (null != from) {
			summary = new Summary();
			if (to != null) {
				summary.setId(to.getId());
			}
			summary.setVersion(from.getVersion());
			summary.setTiny(from.getTiny());
			summary.setLegend(from.getLegend());
			summary.setMedium(from.getMedium());
			summary.setDownload(from.getDownload());
			summary.setMetadataDownload(from.getMetadataDownload());
			Full toFull = new Full();
			if (to != null && to.getFull() != null) {
				toFull = to.getFull();
			}
			summary.setFull(Full.copyValues(from.getFull(), toFull));
			summary.setKeywords(from.getKeywords());
		}
		return summary;
	}
}
