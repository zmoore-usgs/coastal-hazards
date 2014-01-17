package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.oid.OpenIDConsumerService;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.HttpClientSingleton;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.PUT;
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
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 * Works with ArcGIS and Geoserver services for service like importing layers
 * 
 * @author isuftin
 */
@Path("/import")
public class ImportResource {
	
	private static final String geoserverEndpoing;
	private static final DynamicReadOnlyProperties props;
	
	static {
        props = JNDISingleton.getInstance();
        geoserverEndpoing = props.getProperty("coastal-hazards.geoserver.endpoint");
	}
	
	@PUT
	@Path("/{endpoint}/{layer}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response importLayerToGeoserver(@Context HttpServletRequest req, @PathParam("endpoint") String endpoint, @PathParam("layer") String layer) throws URISyntaxException, UnsupportedEncodingException, IOException, ParserConfigurationException, SAXException {
		if (!OpenIDConsumerService.verifyOIDSession(req)) {
			return Response.status(Response.Status.FORBIDDEN).build();
        } else if (StringUtils.isBlank(layer) || StringUtils.isBlank(endpoint)) {
			return Response.status(Response.Status.PRECONDITION_FAILED).build();
		}
		
		URI endpointUri = new URI(endpoint);
		HttpClient client = HttpClientSingleton.getInstance();
		HttpPost post = new HttpPost(geoserverEndpoing + "wps");
		StringEntity importRquest = new StringEntity(createImportRequest(endpointUri, layer), Charset.forName("UTF-8"));
		
		post.addHeader("Content-Type", "text/xml");
		post.setEntity(importRquest);
		
		HttpResponse response = client.execute(post);
		StatusLine statusLine = response.getStatusLine();

        if (statusLine.getStatusCode() != 200) {
            throw new IOException("Error in response from wps");
        }
		
		String data = IOUtils.toString(response.getEntity().getContent(), "UTF-8");
		if (data.contains("ExceptionReport")) {
            String error = "Error in response from wps";
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            Document doc = factory.newDocumentBuilder().parse(new ByteArrayInputStream(data.getBytes()));
            JXPathContext ctx = JXPathContext.newContext(doc.getDocumentElement());
            ctx.registerNamespace("ows", "http://www.opengis.net/ows/1.1");
            List<Node> nodes = ctx.selectNodes("ows:Exception/ows:ExceptionText/text()");
            if (nodes != null && !nodes.isEmpty()) {
                StringBuilder builder = new StringBuilder();
                for (Node node : nodes) {
                    builder.append(node.getTextContent()).append(System.lineSeparator());
                }
                error = builder.toString();
            }
            throw new RuntimeException(error);
        }
        return Response.ok(new StringEntity(data)).build();
	}
	
	private String createImportRequest(final URI endpoint, final String layer) {
		String getFeaturesCall = createGetFeaturesCall(endpoint, layer);
		String defaultImportWorkspace = "workspace";
		String defaultImportStore = "store";
		String defaultImportSRS = "EPSG:3857";
		String defaultImportSRSHandling = "NONE";
		StringBuilder sb = new StringBuilder()
				.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?><wps:Execute version=\"1.0.0\" service=\"WPS\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.opengis.net/wps/1.0.0\" xmlns:wfs=\"http://www.opengis.net/wfs\" xmlns:wps=\"http://www.opengis.net/wps/1.0.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:gml=\"http://www.opengis.net/gml\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:wcs=\"http://www.opengis.net/wcs/1.1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd\">")
				.append("<ows:Identifier>gs:Import</ows:Identifier>")
				.append("<wps:DataInputs>")
				.append("<wps:Input>")
				.append("<ows:Identifier>features</ows:Identifier>")
				.append("<wps:Reference mimeType=\"text/xml; subtype=wfs-collection/1.0\" xlink:href=\"").append(getFeaturesCall).append("\" method=\"GET\"/>")
				.append("</wps:Input>")
				.append("<wps:Input>")
				.append("<ows:Identifier>workspace</ows:Identifier>")
				.append("<wps:Data>")
				.append("<wps:LiteralData>").append(defaultImportWorkspace).append("</wps:LiteralData>")
				.append("</wps:Data>")
				.append("</wps:Input>")
				.append("<wps:Input>")
				.append("<ows:Identifier>store</ows:Identifier>")
				.append("<wps:Data>")
				.append("<wps:LiteralData>").append(defaultImportStore).append("</wps:LiteralData>")
				.append("</wps:Data>")
				.append("</wps:Input>")
				.append("<wps:Input>")
				.append("<ows:Identifier>srs</ows:Identifier>")
				.append("<wps:Data>")
				.append("<wps:LiteralData>").append(defaultImportSRS).append("</wps:LiteralData>")
				.append("</wps:Data>")
				.append("</wps:Input>")
				.append("<wps:Input>")
				.append("<ows:Identifier>srsHandling</ows:Identifier>")
				.append("<wps:Data>")
				.append("<wps:LiteralData>").append(defaultImportSRSHandling).append("</wps:LiteralData>")
				.append("</wps:Data>")
				.append("</wps:Input>")
				.append("</wps:DataInputs>")
				.append("<wps:ResponseForm>")
				.append("<wps:RawDataOutput>")
				.append("<ows:Identifier>layerName</ows:Identifier>")
				.append("</wps:RawDataOutput>")
				.append("</wps:ResponseForm>")
				.append("</wps:Execute>");
		
		return sb.toString();
	}

	private String createGetFeaturesCall(final URI endpoint, final String layer) {
		StringBuilder getFeaturesCall = new StringBuilder(endpoint.toString())
				.append("?service=wfs&amp;version=1.0.0&amp;request=GetFeature&amp;typeNames=")
				.append(layer);	
		return getFeaturesCall.toString();
	}
}
