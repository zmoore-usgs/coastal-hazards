package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import java.io.Serializable;
import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;


/**
 *
 * @author Zack Moore <zmoore@usgs.gov>
 */
@Entity
@Table(name = "alias")
public class Alias implements Serializable {

	private static final long serialVersionUID = 1L;

	private String id;
	private String item_id;

	@Id
	@Column(name = "id")
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	@Column(name = "item_id")
	public String getItemId() {
		return item_id;
	}

	public void setItemId(String item_id) {
		this.item_id = item_id;
	}
	
	public static Alias fromJSON(String json) {
		Alias alias;
		Gson gson = GsonUtil.getDefault();

		alias = gson.fromJson(json, Alias.class);
		
		return alias;
	}
	
	@Override
	public int hashCode() {
		int hash = 7;
		hash = 83 * hash + Objects.hashCode(this.id);
		hash = 83 * hash + Objects.hashCode(this.item_id);
		return hash;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		final Alias other = (Alias) obj;
		if (!Objects.equals(this.id, other.id)) {
			return false;
		}
		if (!Objects.equals(this.item_id, other.item_id)) {
			return false;
		}
		return true;
	}
}
