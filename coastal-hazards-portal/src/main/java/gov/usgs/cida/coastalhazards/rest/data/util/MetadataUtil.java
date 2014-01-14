package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.rest.data.MetadataResource;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
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
public class MetadataUtil {

    private static final String cchn52Endpoint;
    private static final DynamicReadOnlyProperties props;
    
    static {
        props = JNDISingleton.getInstance();
        cchn52Endpoint = props.getProperty("coastal-hazards.n52.endpoint");
	}
    
    /**
     * I really don't like this in its current form, we should rethink this process and move this around
     * 
     * @param metadataId id of metadata file to send to R process
     * @param attr attribute summary is for
     * @return
     * @throws IOException
     * @throws ParserConfigurationException
     * @throws SAXException 
     */
    static public String getSummaryFromWPS(String metadataId, String attr) throws IOException, ParserConfigurationException, SAXException {
        MetadataResource metadata = new MetadataResource();
        Response response = metadata.getFileById(metadataId);
        String xmlWithoutHeader = response.getEntity().toString().replaceAll("<\\?xml[^>]*>", "");
        String wpsRequest = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<wps:Execute xmlns:wps=\"http://www.opengis.net/wps/1.0.0\" xmlns:wfs=\"http://www.opengis.net/wfs\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" service=\"WPS\" version=\"1.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd\">"
                + "<ows:Identifier>org.n52.wps.server.r.item.summary</ows:Identifier>"
                + "<wps:DataInputs>"
                + "<wps:Input>"
                + "<ows:Identifier>input</ows:Identifier>"
                + "<wps:Data>"
                + "<wps:ComplexData mimeType=\"text/xml\">"
                + xmlWithoutHeader
                + "</wps:ComplexData>"
                + "</wps:Data>"
                + "</wps:Input>"
                + "<wps:Input>"
                + "<ows:Identifier>attr</ows:Identifier>"
                + "<wps:Data>"
                + "<wps:LiteralData>" + attr + "</wps:LiteralData>"
                + "</wps:Data>"
                + "</wps:Input>"
                + "</wps:DataInputs>"
                + "<wps:ResponseForm>"
                + "<wps:RawDataOutput>"
                + "<ows:Identifier>output</ows:Identifier>"
                + "</wps:RawDataOutput>"
                + "</wps:ResponseForm>"
                + "</wps:Execute>";
        HttpUriRequest req = new HttpPost(cchn52Endpoint + "/WebProcessingService");
        HttpClient client = new DefaultHttpClient();
        req.addHeader("Content-Type", "text/xml");
        if (!StringUtils.isBlank(wpsRequest) && req instanceof HttpEntityEnclosingRequestBase) {
            StringEntity contentEntity = new StringEntity(wpsRequest);
            ((HttpEntityEnclosingRequestBase) req).setEntity(contentEntity);
        }
        HttpResponse resp = client.execute(req);
        StatusLine statusLine = resp.getStatusLine();

        if (statusLine.getStatusCode() != 200) {
            throw new IOException("Error in response from wps");
        }
        String data = IOUtils.toString(resp.getEntity().getContent(), "UTF-8");
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
        return data;
    }
}
