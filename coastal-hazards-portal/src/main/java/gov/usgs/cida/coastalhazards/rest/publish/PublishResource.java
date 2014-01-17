package gov.usgs.cida.coastalhazards.rest.publish;

import com.sun.jersey.api.view.Viewable;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.oid.OpenIDConsumerService;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.SAXException;

/**
 *
 * @author isuftin
 */
@Path("/")
public class PublishResource {
    
    private static final String cswExternalEndpoint;
    private static final DynamicReadOnlyProperties props;

	static {
        props = JNDISingleton.getInstance();
        cswExternalEndpoint = props.getProperty("coastal-hazards.csw.endpoint");
    }

    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/item/")
    public Response viewBlankItem(@Context HttpServletRequest req) throws URISyntaxException {
       return viewItemById(req, "");
    }
    
    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/item/{token}")
    public Response viewItemById(@Context HttpServletRequest req, @PathParam("token") String token) throws URISyntaxException {
        String intent = "/publish/item/";
        Map<String, String> map = new HashMap<>();
        map.put("id", token);
        if (!OpenIDConsumerService.verifyOIDSession(req)) {
            return Response.temporaryRedirect(new URI(OpenIDConsumerService.VERIFICATION_URL  + intent + token)).build();
        }
        return Response.ok(new Viewable("/WEB-INF/jsp/publish/item/index.jsp", map)).build();
    }
    
    @POST
    @Path("metadata/{token}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response publishItems(@Context HttpServletRequest req, @PathParam("token") String metaToken) throws URISyntaxException {
        Response response = null;
        Map<String, String> responseContent = new HashMap<>();
        String intent = "/metadata/";
        
        if (!OpenIDConsumerService.verifyOIDSession(req)) {
            return Response.temporaryRedirect(new URI(OpenIDConsumerService.VERIFICATION_URL  + intent + metaToken)).build();
        }
        
        try {
            String identifier = MetadataUtil.doCSWTransaction(metaToken);
            if (identifier == null) {
                throw new RuntimeException("Could not get identifier from CSW transaction response");
            }
            String url = cswExternalEndpoint + "?service=CSW&request=GetRecordById&version=2.0.2&typeNames=fgdc:metadata&id=" + identifier +"&outputSchema=http://www.opengis.net/cat/csw/csdgm&elementSetName=full";
            responseContent.put("metadata", url);
            response = Response.ok(GsonUtil.getDefault().toJson(responseContent, HashMap.class)).build();
        } catch (IOException | RuntimeException | ParserConfigurationException | SAXException ex) {
            responseContent.put("message", ex.getMessage() == null ? "NPE" : ex.getMessage());
            response = Response.serverError().entity(GsonUtil.getDefault().toJson(responseContent, HashMap.class)).build();
        }
        return response;
    }
    
}
