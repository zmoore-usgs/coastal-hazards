package gov.usgs.cida.coastalhazards.domain;

import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
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
        } else if (item.getItemType() == Item.ItemType.aggregation || item.getItemType() == Item.ItemType.template) {
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
        Calendar cal = Calendar.getInstance();
        for (String date : stringDomain) {
            // We are assuming mm/dd/yyyy format, will break otherwise
            try {
                Date javaDate = new SimpleDateFormat("MM/dd/yyyy").parse(date);
                cal.setTime(javaDate);
                yearDomain.add(String.valueOf(cal.get(Calendar.YEAR)));
            } catch (ParseException ex) {
                log.error("Invalid date format in data", ex);
            }
            
        }
        
        return yearDomain;
    }
    
}
