package gov.usgs.cida.coastalhazards.model;

import java.io.Serializable;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 *
 * @author Zack Moore <zmoore@usgs.gov>
 */
@Entity
@Table(name = "alias")
public class Alias implements Serializable {
	
	private static final Logger log = LoggerFactory.getLogger(Alias.class);

	private String id;
	private Item item;

	@Id
	@Column(name = "id")
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(columnDefinition = "item_id")
	public Item getItem() {
		return item;
	}

	public void setItem(Item item) {
		this.item = item;
	}
}
