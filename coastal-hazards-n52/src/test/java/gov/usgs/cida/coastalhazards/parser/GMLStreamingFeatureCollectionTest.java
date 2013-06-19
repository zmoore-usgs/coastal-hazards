package gov.usgs.cida.coastalhazards.parser;

import java.io.File;
import java.net.URISyntaxException;
import java.net.URL;
import org.junit.Test;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class GMLStreamingFeatureCollectionTest {

    @Test
    public void testParse() throws URISyntaxException {
        URL gml = getClass().getClassLoader().getResource("FeatureCollectionRParserGML.xml");
        GMLStreamingFeatureCollection collection = new GMLStreamingFeatureCollection(new File(gml.toURI()));
    }
    
}
