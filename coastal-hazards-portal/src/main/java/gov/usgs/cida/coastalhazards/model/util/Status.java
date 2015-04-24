package gov.usgs.cida.coastalhazards.model.util;

import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "status")
public class Status {

	private int id;
	private StatusName statusName;
	private Date lastUpdate;

	public enum StatusName {
		ITEM_UPDATE,
		STRUCTURE_UPDATE,
		CACHE_CLEAR,
		UNKNOWN;
	}

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	@Enumerated(EnumType.STRING)
	@Column(name = "status_name")
	public StatusName getStatusName() {
		return statusName;
	}

	public void setStatusName(StatusName statusName) {
		this.statusName = statusName;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "last_update")
	public Date getLastUpdate() {
		return lastUpdate;
	}

	public void setLastUpdate(Date lastUpdate) {
		this.lastUpdate = lastUpdate;
	}

	@PrePersist
	@PreUpdate
	protected void onCreate() {
		this.lastUpdate = new Date();
	}
}
