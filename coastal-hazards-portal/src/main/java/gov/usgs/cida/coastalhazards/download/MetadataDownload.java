package gov.usgs.cida.coastalhazards.download;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.net.URISyntaxException;
import java.net.URL;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactoryConfigurationError;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.sax.SAXTransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
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
    private static final String XSLT = "<xsl:stylesheet version=\"1.0\"" +
        " xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\" xmlns:xalan=\"http://xml.apache.org/xslt\">" +
        "    <xsl:output method=\"xml\" indent=\"yes\" xalan:indent-amount=\"2\"/>" +
        "    <xsl:template match=\"@* | node()\">" +
        "        <xsl:copy>" +
        "            <xsl:apply-templates select=\"@* | node()\"/>" +
        "        </xsl:copy>" +
        "    </xsl:template>" +
        "    <xsl:strip-space elements=\"*\"/>" +
        "</xsl:stylesheet>";
    
    private final URL metadata;
    private final File filename;
    
    public MetadataDownload(URL metadata, File filename) {
        this.metadata = metadata;
        this.filename = filename;
    }
    
    public void stage() {
        FileOutputStream fos = null;
        try {
            Transformer transformer = SAXTransformerFactory.newInstance()
                    .newTransformer(new StreamSource(new StringReader(XSLT)));

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
            if (metadataNode != null) {
                // Append processing steps here
                Source source = new DOMSource(metadataNode);
                fos = new FileOutputStream(filename);
                StreamResult result = new StreamResult(fos);
                transformer.transform(source, result);
            } else {
                LOG.error("Metadata improperly formatted or not accessible");
                throw new RuntimeException("Metadata improperly formatted or not accessible");
            }
        } catch(IOException | TransformerFactoryConfigurationError | URISyntaxException |
                TransformerException | SAXException | ParserConfigurationException ex) {
            LOG.error("Unable to perform metadata export", ex);
            throw new RuntimeException("Unable to perform metadata export", ex);
        } finally {
            IOUtils.closeQuietly(fos);
        }
    }
    
}
