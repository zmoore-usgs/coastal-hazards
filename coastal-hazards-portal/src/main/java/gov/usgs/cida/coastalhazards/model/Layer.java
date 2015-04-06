package gov.usgs.cida.coastalhazards.model;

import java.io.Serializable;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import org.hibernate.annotations.IndexColumn;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "layer")
public class Layer implements Serializable {
	
	private static final Logger log = LoggerFactory.getLogger(Layer.class);
	private static final long serialVersionUID = 1377960586550331014L;

	private String id;
	private List<Service> services;
        private Bbox bbox;

	@Id
	@Column(name = "id")
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinTable(name = "service_layer",
			joinColumns = {
				@JoinColumn(name = "layer_id", referencedColumnName = "id")
			},
			inverseJoinColumns = {
				@JoinColumn(name = "service_id", referencedColumnName = "id")
			})
	@IndexColumn(name = "list_index")
	public List<Service> getServices() {
		return services;
	}

	public void setServices(List<Service> services) {
		this.services = services;
	}
	
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(columnDefinition = "bbox_id")
	public Bbox getBbox() {
		return bbox;
	}

	public void setBbox(Bbox bbox) {
		this.bbox = bbox;
	}
}
