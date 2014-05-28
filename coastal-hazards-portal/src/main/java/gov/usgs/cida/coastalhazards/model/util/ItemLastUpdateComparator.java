package gov.usgs.cida.coastalhazards.model.util;

import gov.usgs.cida.coastalhazards.model.Item;
import java.util.Comparator;

public class ItemLastUpdateComparator implements Comparator<Item>{

	@Override
	public int compare(Item o1, Item o2) {
		return o1.getLastUpdate().compareTo(o2.getLastUpdate());
	}
	
}
