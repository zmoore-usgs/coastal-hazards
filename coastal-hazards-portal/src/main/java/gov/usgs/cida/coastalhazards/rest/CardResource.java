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
import javax.ws.rs.Consumes;
import javax.ws.rs.PathParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
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
@Path("/data/item")
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
    public Response getCard(@PathParam("id") String id) {
        String jsonResult = "";
        jsonResult = itemManager.load(id);
        Response response = null;
        if (null == jsonResult) {
            response = Response.status(Response.Status.NOT_FOUND).build();
        } else {
            response = Response.ok(jsonResult, MediaType.APPLICATION_JSON_TYPE).build();
        }
        return response;
    }
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response searchCards(
            @DefaultValue("popularity") @QueryParam("sortBy") String sortBy,
            @DefaultValue("10") @QueryParam("count") int count,
            @DefaultValue("") @QueryParam("bbox") String bbox
            ) {
        String jsonResult = "";
        // need to figure out how to search popularity and bbox yet
        jsonResult = itemManager.query();
        return Response.ok(jsonResult, MediaType.APPLICATION_JSON_TYPE).build();
    }
    
    /**
     * Only allows one card to be posted at a time for now
     * @param content
     * @return 
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response postCard(String content) {
        final String id = itemManager.save(content);
        Response response = null;
        if (null == id) {
            response = Response.status(Response.Status.BAD_REQUEST).build();
        } else {
            Map<String, Object> ok = new HashMap<String, Object>() {{put("id", id);}};
            response = Response.ok(new Gson().toJson(ok, HashMap.class), MediaType.APPLICATION_JSON_TYPE).build();
        }
        return response;       
    }
    
    private List<Map> cardsList() throws FileNotFoundException, URISyntaxException {
        Map<String, List> items = gson.fromJson(new FileReader(new File(itemsUrl.toURI())), HashMap.class);
        List<Map> cards = items.get("results");
        return cards;
    }
}
