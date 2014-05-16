package gov.usgs.cida.coastalhazards.domain;

import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import java.io.IOException;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import org.apache.log4j.Logger;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DataDomainUtility {
    
    private static final Logger log = Logger.getLogger(DataDomainUtility.class);

    public static SortedSet<String> retrieveDomainFromWFS(Item item)  {
        SortedSet<String> domain = new TreeSet<>();
        
        WFSGetDomain client = new WFSGetDomain();
        if (item == null) {
            throw new IllegalArgumentException("Item must be valid data item");
        } else if (item.getItemType() == Item.ItemType.aggregation) {
            for (Item child : item.getChildren()) {
                Set<String> childDomain = retrieveDomainFromWFS(child); // recurse (again, avoiding cycles is important)
                domain.addAll(childDomain);
            }
        } else if (item.getItemType() == Item.ItemType.data) {
            WFSService service = item.fetchWfsService();
            try {
                Set<String> domainValuesAsStrings = client.getDomainValuesAsStrings(service, item.getAttr());
                domain.addAll(domainValuesAsStrings);
            } catch (IOException e) {
                log.error("unable to get domain from wfs", e);
            }
        }
        
        return domain;
    }
    
    public static SortedSet<String> getDomainAsYears(Set<String> stringDomain) {
        SortedSet<String> yearDomain = new TreeSet<>();
        
        for (String date : stringDomain) {
            // We are assuming mm/dd/yyyy format, will break otherwise
            String year = date.substring(date.lastIndexOf("/") + 1);
            yearDomain.add(year);
        }
        
        return yearDomain;
    }
    
}
