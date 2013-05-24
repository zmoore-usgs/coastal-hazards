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
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.PathParam;
import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

/**
 * Could also be called item or layer or some other way of describing a singular thing
 *
 * @author jordan
 */
@Path("cards")
public class CardResource {
    
    private static URL itemsUrl;
    private static URL dictionaryUrl;
    private Gson gson = new Gson();
    static {
        itemsUrl = SummaryResource.class.getClassLoader().getResource("hotness.json");
    }

    /**
     * Retrieves representation of an instance of gov.usgs.cida.coastalhazards.rest.TestResource
     * @return an instance of java.lang.String
     */
    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getCard(@PathParam("{id}") String id) throws FileNotFoundException, URISyntaxException {
        String jsonResult = "";
        
        List<Map> cards = cardsList();
        for (Map<String, String> card : cards) {
            if (id.equals(card.get("key"))) {
                jsonResult = gson.toJson(card, Map.class);
            }
        }
        return jsonResult;
    }
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String searchCards(
            @DefaultValue("popularity") @QueryParam("sortBy") String sortBy,
            @DefaultValue("10") @QueryParam("count") int count,
            @DefaultValue("") @QueryParam("bbox") String bbox
            ) {
        String jsonResult = "";
        // hook this up to the database and do the search
        // since it is the same database as csw, we can use those
        // tables if we like (probably shouldn't)
        return null;
    }
    
    private List<Map> cardsList() throws FileNotFoundException, URISyntaxException {
        Map<String, List> items = gson.fromJson(new FileReader(new File(itemsUrl.toURI())), HashMap.class);
        List<Map> cards = items.get("results");
        return cards;
    }
}
