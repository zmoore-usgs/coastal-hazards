package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
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
}
