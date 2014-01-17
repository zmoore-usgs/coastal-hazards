package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.JsonSyntaxException;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import gov.usgs.cida.coastalhazards.rest.publish.PublishResource;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.Consumes;
import javax.ws.rs.PathParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.UriInfo;
import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.SAXException;

/**
 * 
 *
 * @author jordan
 */
@Path("item")
public class ItemResource {

	@Context
	private UriInfo context;
	private static ItemManager itemManager;
    private static String cchn52Endpoint;
    private static final DynamicReadOnlyProperties props;

	static {
        props = JNDISingleton.getInstance();
        cchn52Endpoint = props.getProperty("coastal-hazards.n52.endpoint");
		itemManager = new ItemManager();
	}

	/**
	 * Retrieves representation of an instance of gov.usgs.cida.coastalhazards.model.Item
	 *
	 * @param id identifier of requested item
     * @param subtree whether to return all items below this as a subtree
	 * @return JSON representation of the item(s)
	 */
	@GET
	@Path("{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getItem(@PathParam("id") String id, 
            @DefaultValue("false") @QueryParam("subtree") boolean subtree) {
		String jsonResult = itemManager.load(id, subtree);
		Response response;
		if (null == jsonResult) {
			response = Response.status(Response.Status.NOT_FOUND).build();
		} else {
			response = Response.ok(jsonResult, MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}
    
    /**
	 * Retrieves the "uber" item which acts as the root of the tree
	 *
     * @param subtree whether to return the entire subtree (may be very large)
	 * @return JSON representation of items
	 */
	@GET
	@Path("uber")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUberItem(@DefaultValue("false") @QueryParam("subtree") boolean subtree) {
        return getItem(Item.UBER_ID, subtree);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response searchItems(
            @DefaultValue("") @QueryParam("query") List<String> query,
            @DefaultValue("") @QueryParam("type") List<String> type,
			@DefaultValue("popularity") @QueryParam("sortBy") String sortBy,
			@DefaultValue("-1") @QueryParam("count") int count,
			@DefaultValue("") @QueryParam("bbox") String bbox,
            @DefaultValue("false") @QueryParam("subtree") boolean subtree) {
		// need to figure out how to search popularity and bbox yet
		String jsonResult = itemManager.query(query, type, sortBy, count, bbox, subtree);
		return Response.ok(jsonResult, MediaType.APPLICATION_JSON_TYPE).build();
	}

	/**
	 * Only allows one card to be posted at a time for now
	 *
	 * @param content Posted content as text string (should be JSON)
     * @param request passed through context of request
	 * @return
	 */
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response postItem(String content, @Context HttpServletRequest request) {
        Response response;
        HttpSession session = request.getSession();
        if (session == null) {
            response = Response.status(Response.Status.BAD_REQUEST).build();
        } else {
            if (PublishResource.isValidSession(request)) {
                final String id = itemManager.persist(content);

                if (null == id) {
                    response = Response.status(Response.Status.BAD_REQUEST).build();
                } else {
                    Map<String, Object> ok = new HashMap<String, Object>() {
                        private static final long serialVersionUID = 2398472L;
                        {
                            put("id", id);
                        }
                    };
                    response = Response.ok(GsonUtil.getDefault().toJson(ok, HashMap.class), MediaType.APPLICATION_JSON_TYPE).build();
                }
            } else {
                response = Response.status(Response.Status.UNAUTHORIZED).build();
            }
        }
		return response;
	}
    
    /**
     * @param request
     * @param id
     * @param content
     * @return 
     */
    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateItem(@Context HttpServletRequest request, @PathParam("id") String id, String content) {
        Response response = null;
        if (PublishResource.isValidSession(request)) {
            Item dbItem = itemManager.loadItem(id);
            Item updatedItem = Item.fromJSON(content);
            Item mergedItem = Item.copyValues(updatedItem, dbItem);
            final String mergedId = itemManager.merge(mergedItem);
            if (null != mergedId) {
                Map<String, String> ok = new HashMap<String, String>() {{
                    put("id", mergedId);
                }};
                response = Response.ok(GsonUtil.getDefault().toJson(ok, HashMap.class), MediaType.APPLICATION_JSON_TYPE).build();
            } else {
                response = Response.status(Response.Status.BAD_REQUEST).build();
            }
        } else {
            response = Response.status(Status.UNAUTHORIZED).build();
        }
        return response;
    }

    /**
     * This should either be removed or changed to its new purpose.
     * We are no longer previewing unpublished items, but starting out as disabled until they are ready.
     * 
     * @param content
     * @return 
     */
	@POST
	@Path("/preview")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response publishPreviewCard(String content) {
        Response response = Response.serverError().build();
        
        Item item = Item.fromJSON(content);

        try {
            String jsonSummary = MetadataUtil.getSummaryFromWPS(getMetadataUrl(item), item.getAttr());
            // this is not actually summary json object, so we need to change that a bit
            Summary summary = GsonUtil.getDefault().fromJson(jsonSummary, Summary.class);
            item.setSummary(summary);
        } catch (JsonSyntaxException | IOException | ParserConfigurationException | SAXException ex) {
            Map<String,String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            response = Response.serverError().entity(GsonUtil.getDefault().toJson(err, HashMap.class)).build();
        }
        if (item.getSummary() != null) {
            final String id = itemManager.savePreview(item);

            if (null == id) {
                response = Response.status(Response.Status.BAD_REQUEST).build();
            } else {
                Map<String, String> ok = new HashMap<String, String>() {
                    private static final long serialVersionUID = 23918472L;

                    {
                        put("id", id);
                    }
                };
                response = Response.ok(GsonUtil.getDefault().toJson(ok, HashMap.class), MediaType.APPLICATION_JSON_TYPE).build();
            }
        }
		return response;
	}
    
    private static String getMetadataUrl(Item item) {
        String url = "";
        if (item != null) {
            List<Service> services = item.getServices();
            for (Service service : services) {
                if (service.getType() == ServiceType.csw) {
                    url = service.getEndpoint();
                }
            }
        }
        return url;
    }
}
