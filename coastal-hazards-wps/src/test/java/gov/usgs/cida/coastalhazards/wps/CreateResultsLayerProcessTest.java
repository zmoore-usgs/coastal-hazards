package gov.usgs.cida.coastalhazards.wps;

import gov.usgs.cida.coastalhazards.util.FeatureCollectionFromShp;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import org.apache.commons.io.IOUtils;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.opengis.feature.simple.SimpleFeature;

/**
 *
 * @author jiwalker
 */
public class CreateResultsLayerProcessTest {
    
    private static File outTest = null;
    @BeforeClass
    public static void setupAll() throws IOException {
        outTest = File.createTempFile("test", ".shp");
        //outTest.deleteOnExit();
    }
    
    /**
     * Test of execute method, of class CreateResultsLayerProcess.
     */
    @Test
    //@Ignore
    public void testExecute() throws Exception {
        InputStream resourceAsStream = CreateResultsLayerProcessTest.class.getClassLoader()
                                               .getResourceAsStream("gov/usgs/cida/coastalhazards/jersey/NewJerseyN_results.txt");
        URL transects = CreateResultsLayerProcessTest.class.getClassLoader()
                .getResource("gov/usgs/cida/coastalhazards/jersey/NewJerseyNa_transects.shp");
        BufferedReader reader = new BufferedReader(new InputStreamReader(resourceAsStream));
        StringBuffer buffer = new StringBuffer();
        String line = null;
        while (null != (line = reader.readLine())) {
            buffer.append(line);
            buffer.append("\n");
        }
        IOUtils.closeQuietly(reader);
        SimpleFeatureCollection transectfc = (SimpleFeatureCollection)
                FeatureCollectionFromShp.featureCollectionFromShp(transects);
        // need to get the matching transect layer to run against
        CreateResultsLayerProcess createResultsLayerProcess = new CreateResultsLayerProcess(new DummyImportProcess(outTest), new DummyCatalog());
        createResultsLayerProcess.execute(buffer, transectfc, null, null, null, null);
    }
    
    @Test
    public void testReadShapeOut() throws IOException, MalformedURLException {
        URL results = outTest.toURI().toURL();
        SimpleFeatureCollection resultfc = (SimpleFeatureCollection)
                FeatureCollectionFromShp.featureCollectionFromShp(results);
        SimpleFeatureIterator features = resultfc.features();
        while (features.hasNext()) {
            SimpleFeature next = features.next();
            Double attribute = (Double)next.getAttribute("LRR");
            System.out.println("val: " + attribute);
        }
    }
    
    @Test
    public void testParseDouble() {
        String regular = "1.0";
        String uffd = "\ufffd";
        String uffd_w_space = "    \ufffd";
        String question = "?";
        String question_w_space = "    ?";
        String nan = "   NaN";
        assertEquals(Double.parseDouble(regular), 1.0, 0.001);
        assertEquals(Double.parseDouble(nan), Double.NaN, 0.001);
        //assertEquals(Double.parseDouble(uffd), Double.NaN, 0.001);
        //assertEquals(Double.parseDouble(uffd_w_space), Double.NaN, 0.001);
        try {
            //assertEquals(Double.parseDouble(question), Double.NaN, 0.001);
            //assertEquals(Double.parseDouble(question_w_space), Double.NaN, 0.001);
        }
        catch (NumberFormatException nfe) {
            // this is ok
        }
    }
}
