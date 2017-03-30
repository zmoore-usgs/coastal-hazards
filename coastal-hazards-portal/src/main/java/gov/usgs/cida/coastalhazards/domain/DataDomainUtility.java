package gov.usgs.cida.coastalhazards.domain;

import gov.usgs.cida.coastalhazards.jpa.DataDomainManager;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.util.DataDomain;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
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
    
	public static SortedSet<String> getOnlyVisibleDomainValues(Item rootItem, DataDomainManager manager){
		ItemManager items = new ItemManager();
		List<String> childItems = rootItem.getDisplayedChildren();
		SortedSet<String> domainValues = new TreeSet();
				
		if(childItems.isEmpty()){
			return domainValues;
		} 		
				
		//Loop through the remaining children with the created variables
		for(int i = 0; i < childItems.size(); i++){
			Item child = items.load(childItems.get(i));
			
			if(child.getItemType() == Item.ItemType.aggregation){
				domainValues.addAll(getOnlyVisibleDomainValues(child, manager));
			} else {
				DataDomain domain = manager.getDomainForItem(child);
				SortedSet<String> values = domain.getDomainValues();
				domainValues.addAll(values);
			}
		}
		
		return domainValues;
	}
}
