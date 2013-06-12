package gov.usgs.cida.coastalhazards.session;

import java.io.Serializable;

/**
 *
 * @author isuftin
 */
public class ViewMap implements Serializable {

	private String[] itemIds;

	public ViewMap() {
		this.itemIds = new String[]{};
	}

	public ViewMap(String[] itemIds) {
		this.itemIds = itemIds;
	}

	boolean isValid() {
		boolean isValid = true;

		if (null == itemIds) {
			isValid = false;
		}

		return isValid;
	}

	/**
	 * @return the itemIds
	 */
	public String[] getItemIds() {
		return itemIds;
	}

	/**
	 * @param itemIds the itemIds to set
	 */
	public void setItemIds(String[] itemIds) {
		this.itemIds = itemIds;
	}
}
