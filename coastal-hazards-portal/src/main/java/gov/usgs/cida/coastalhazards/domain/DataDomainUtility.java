package gov.usgs.cida.coastalhazards.domain;

import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import org.apache.log4j.Logger;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DataDomainUtility {
    
    private static final Logger log = Logger.getLogger(DataDomainUtility.class);

    public static Set<String> retrieveDomainFromWFS(Item item)  {
        Set<String> domain = new HashSet<>();
        
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
    
    public static Set<String> getDomainAsYears(Set<String> stringDomain) {
        Set<String> yearDomain = new HashSet<>();
        
        for (String date : stringDomain) {
            // We are assuming mm/dd/yyyy format, will break otherwise
            String year = date.substring(date.lastIndexOf("/") + 1);
            yearDomain.add(year);
        }
        
        return yearDomain;
    }
    
}
