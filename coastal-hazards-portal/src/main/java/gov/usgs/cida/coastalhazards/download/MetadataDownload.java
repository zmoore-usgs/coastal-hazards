package gov.usgs.cida.coastalhazards.download;

import gov.usgs.cida.utilities.ShutdownListener;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.TransformerFactoryConfigurationError;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.apache.commons.io.IOUtils;
import org.apache.commons.jxpath.JXPathContext;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.DefaultHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class MetadataDownload {

    private static final Logger LOG = LoggerFactory.getLogger(MetadataDownload.class);
    
    private final URL metadata;
    private final File filename;
    
    public MetadataDownload(URL metadata, File filename) {
        this.metadata = metadata;
        this.filename = filename;
    }
    
    public void stage() {
        FileOutputStream fos = null;
        try {
            TransformerFactory transFactory = TransformerFactory.newInstance();
            transFactory.setAttribute("indent-number", 2);
            Transformer transformer = transFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");

            HttpUriRequest req = new HttpGet(metadata.toURI());
            HttpClient client = new DefaultHttpClient();
            HttpResponse resp = client.execute(req);
            StatusLine statusLine = resp.getStatusLine();

            if (statusLine.getStatusCode() != 200) {
                throw new IOException("Error in response from csw");
            }
            String data = IOUtils.toString(resp.getEntity().getContent(), "UTF-8");
            if (data.contains("ExceptionReport")) {
                throw new IOException("Error in response from csw");
            }

            DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
            docFactory.setNamespaceAware(true);
            Document doc = docFactory.newDocumentBuilder().parse(new ByteArrayInputStream(data.getBytes()));
            JXPathContext ctx = JXPathContext.newContext(doc.getDocumentElement());

            Node metadataNode = (Node) ctx.selectSingleNode("metadata");

            DOMSource source = new DOMSource(metadataNode);
            fos = new FileOutputStream(filename);
            StreamResult result = new StreamResult(fos);
            transformer.transform(source, result);
        } catch(IOException | TransformerFactoryConfigurationError | URISyntaxException |
                TransformerException | SAXException | ParserConfigurationException ex) {
            LOG.error("Unable to perform metadata export", ex);
            throw new RuntimeException("Unable to perform metadata export", ex);
        } finally {
            IOUtils.closeQuietly(fos);
        }
    }
    
}
