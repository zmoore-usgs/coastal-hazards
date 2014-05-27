package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.model.Item;
import java.util.List;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ItemUtil {

    /**
     * Gathers the attributes of all items below this one in the "tree"
     * 
     * @param item Item to traverse
     * @return SortedSet of attribute names (sorted for peeking at first item)
     */
    public static SortedSet<String> gatherAttributes(Item item) {
        SortedSet<String> attrs = new TreeSet<>();
        if (item != null) {
            Item.ItemType type = item.getItemType();
            if (type == Item.ItemType.data) {
                attrs.add(item.getAttr());
            } else if (type == Item.ItemType.aggregation) {
                List<Item> children = item.getChildren();
                for (Item child : children) {
                    attrs.addAll(gatherAttributes(child));
                }
            }
        }
        return attrs;
    }
    
    
    
}
