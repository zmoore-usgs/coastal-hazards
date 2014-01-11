package gov.usgs.cida.coastalhazards.rest.publish;

import com.sun.jersey.api.view.Viewable;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.rest.data.MetadataResource;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.commons.io.IOUtils;
import org.apache.commons.jxpath.JXPathContext;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 *
 * @author isuftin
 */
@Path("/")
public class PublishResource {
    
    private static final String cswLocalEndpoint;
    private static final String cswExternalEndpoint;
    private static final DynamicReadOnlyProperties props;
    private static final String NAMESPACE_CSW = "http://www.opengis.net/cat/csw/2.0.2";
    private static final String NAMESPACE_DC = "http://purl.org/dc/elements/1.1/";
    private static final String VERIFICATION_URL = "../OpenID/oid-login.jsp?originating_uri=";

	static {
        props = JNDISingleton.getInstance();
        cswLocalEndpoint = props.getProperty("coastal-hazards.csw.internal.endpoint");
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
        if (!verifyOIDSession(req)) {
            return Response.temporaryRedirect(new URI(VERIFICATION_URL + intent + token)).build();
        }
        return Response.ok(new Viewable("/WEB-INF/jsp/publish/item/index.jsp", token)).build();
    }
    
    private boolean verifyOIDSession(@Context HttpServletRequest req) throws URISyntaxException {
        HttpSession session = req.getSession(false);
        if (session == null
				|| session.getAttribute("oid-info") == null
				|| ((Map<String, String>) session.getAttribute("oid-info")).isEmpty()
				|| StringUtils.isEmpty(((Map<String, String>) session.getAttribute("oid-info")).get("oid-email"))
				|| session.getAttribute("sessionValid") == null
				|| ((Boolean) session.getAttribute("sessionValid")) == false) {
            return false;
		}
        return true;
    }
    
    
    @POST
    @Path("metadata/{token}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response publishItems(@PathParam("token") String metaToken) {
        Response response = null;
        Map<String, String> responseContent = new HashMap<String, String>();
        try {
            String identifier = doCSWTransaction(metaToken);
            if (identifier == null) {
                throw new RuntimeException("Could not get identifier from CSW transaction response");
            }
            String url = cswExternalEndpoint + "?service=CSW&request=GetRecordById&version=2.0.2&typeNames=fgdc:metadata&id=" + identifier +"&outputSchema=http://www.opengis.net/cat/csw/csdgm&elementSetName=full";
            responseContent.put("metadata", url);
            response = Response.ok(GsonUtil.getDefault().toJson(responseContent, HashMap.class)).build();
        } catch (Exception ex) {
            responseContent.put("message", ex.getMessage() == null ? "NPE" : ex.getMessage());
            response = Response.serverError().entity(GsonUtil.getDefault().toJson(responseContent, HashMap.class)).build();
        }
        return response;
    }
    
    private String doCSWTransaction(String metadataId) throws IOException, ParserConfigurationException, SAXException {
        String insertedId = null;
        
        MetadataResource metadata = new MetadataResource();
        Response response = metadata.getFileById(metadataId);
        String xmlWithoutHeader = response.getEntity().toString().replaceAll("<\\?xml[^>]*>", "");
        String cswRequest = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                    + "<csw:Transaction service=\"CSW\" version=\"2.0.2\" xmlns:csw=\"http://www.opengis.net/cat/csw/2.0.2\">"
                    + "<csw:Insert>"
                    + xmlWithoutHeader
                    + "</csw:Insert>"
                    + "</csw:Transaction>";
            HttpUriRequest req = new HttpPost(cswLocalEndpoint);
            HttpClient client = new DefaultHttpClient();
            req.addHeader("Content-Type", "text/xml");
            if (!StringUtils.isBlank(cswRequest) && req instanceof HttpEntityEnclosingRequestBase) {
                StringEntity contentEntity = new StringEntity(cswRequest);
                ((HttpEntityEnclosingRequestBase) req).setEntity(contentEntity);
            }
            HttpResponse resp = client.execute(req);
            StatusLine statusLine = resp.getStatusLine();

            if (statusLine.getStatusCode() != 200) {
                throw new IOException("Error in response from csw");
            }
            String data = IOUtils.toString(resp.getEntity().getContent(), "UTF-8");
            if (data.contains("ExceptionReport")) {
                throw new IOException("Error in response from csw");
            }
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            Document doc = factory.newDocumentBuilder().parse(new ByteArrayInputStream(data.getBytes()));
            JXPathContext ctx = JXPathContext.newContext(doc.getDocumentElement());
            ctx.registerNamespace("csw", NAMESPACE_CSW);
            ctx.registerNamespace("dc", NAMESPACE_DC);
            Node inserted = (Node) ctx.selectSingleNode("//csw:totalInserted/text()");
            if (1 == Integer.parseInt(inserted.getTextContent())) {
                Node idNode = (Node) ctx.selectSingleNode("//dc:identifier/text()");
                insertedId = idNode.getTextContent();
            }
            return insertedId;
    }
}
