package gov.usgs.cida.coastalhazards.rest;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.ws.rs.PathParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

/**
 * Could also be called item or layer or some other way of describing a singular thing
 *
 * @author jordan
 */
@Path("cards")
public class CardResource {
    
    @Context
    private UriInfo context;
    
    private static URL itemsUrl;
    private static URL dictionaryUrl;
    private Gson gson = new Gson();
    private static ItemManager itemManager;
    static {
        itemsUrl = SummaryResource.class.getClassLoader().getResource("hotness.json");
        itemManager = new ItemManager();
    }

    /**
     * Retrieves representation of an instance of gov.usgs.cida.coastalhazards.rest.TestResource
	 * @param id 
	 * @return an instance of java.lang.String
	 * @throws FileNotFoundException
	 * @throws URISyntaxException  
     */
    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getCard(@PathParam("id") String id) {
        String jsonResult = "";
        jsonResult = itemManager.load(id);
        Response response = null;
        if (null == jsonResult) {
            response = Response.status(Response.Status.NOT_FOUND).build();
        } else {
            response = Response.ok(jsonResult, MediaType.APPLICATION_JSON_TYPE).build();
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
