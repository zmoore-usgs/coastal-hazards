package gov.usgs.cida.coastalhazards.rest;

import com.google.gson.Gson;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.ws.rs.PathParam;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.apache.commons.lang.StringUtils;

/**
 * REST Web Service
 *
 * @author jordan
 */
@Path("summaries")
public class SummaryResource {
    
    private static URL itemsUrl;
    private static URL dictionaryUrl;
    
    static {
        itemsUrl = SummaryResource.class.getClassLoader().getResource("hotness.json");
        dictionaryUrl = SummaryResource.class.getClassLoader().getResource("summary_dictionary.json");
    }

    @GET
    @Path("tiny/{id}")
    @Produces(MediaType.TEXT_PLAIN)
    public String getTinySummary(@PathParam("id") String id) throws FileNotFoundException, URISyntaxException {
        String tinySummary = "";
        String state = null;
        String direction = null;
        
        Gson gson = new Gson();
        Map<String, Map> dictionary = gson.fromJson(new FileReader(new File(dictionaryUrl.toURI())), HashMap.class);
        Map<String, String> states = dictionary.get("states");
        Map<String, String> directions = dictionary.get("cardinal-directions");
        Map<String, List> items = gson.fromJson(new FileReader(new File(itemsUrl.toURI())), HashMap.class);
        List<Map> results = items.get("results");
        for (Map<String, String> item : results) {
            if (item.get("id").equals(id)) {
                if (item.get("type").equals("historical")) {
                    String title = item.get("name");
                    title = title.replaceAll("[,.]", "");
                    for (String stateVal : states.values()) {
                        if (StringUtils.containsIgnoreCase(title, stateVal)) {
                            state = stateVal;
                        }
                    }
                    for (String dirVal : directions.values()) {
                        if (StringUtils.containsIgnoreCase(title, dirVal)) {
                            direction = dirVal;
                        }
                    }
                }
            }
        }
        
        tinySummary = "Rate of change for" + 
                ((direction == null) ? "" : " "+direction) +
                " shoreline of" +
                ((state == null) ? "" : " "+state) +
                " is available at {tinygov} #coastalhazards";
        // make sure this is only 140 characters - hashtag - tinygov
        // start with storms
        // storm name
        // real time info
        // category?
        // Storm template: {typename {class} {name}} is projected to {something} go.usa.gov/xxxx #icanhazards
        // Historical template: Average rate of change for {name} is {avg/period} go.usa.gov/xxxx #icanhazards
        // Vulnerability template: Average vulnerability of {stat} is {avg} for {name} go.usa.gov/xxxx #icanhazards
        // General template: See my coastal hazards assessment of {storm?} ,/and {vulnerability?} ,and? {historical?} go.usa.gov/xxxx #icanhazards
        return tinySummary;
    }
    
    @GET
    @Path("medium/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getMediumSummary(@PathParam("id") String id) {
        // this should fit into the card view
        return null;
    }
    
    @GET
    @Path("long/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getLongSummary(@PathParam("id") String id) {
        // this is the full blown summary, we need to come up with a data structure
        // that represents all the different possible views
        return null;
    }
}
