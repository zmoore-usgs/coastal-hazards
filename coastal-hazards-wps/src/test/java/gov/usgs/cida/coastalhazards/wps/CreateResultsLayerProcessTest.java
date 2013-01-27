package gov.usgs.cida.coastalhazards.wps;

import java.io.BufferedReader;
import java.io.FileReader;
import java.net.URL;
import org.apache.commons.io.IOUtils;
import org.junit.Ignore;
import org.junit.Test;

/**
 *
 * @author jiwalker
 */
public class CreateResultsLayerProcessTest {
    
    /**
     * Test of execute method, of class CreateResultsLayerProcess.
     */
    @Test
    @Ignore
    public void testExecute() throws Exception {
        URL resource = CreateResultsLayerProcessTest.class.getClassLoader()
                .getResource("gov/usgs/cida/coastalhazards/jersey/NewJerseyN_results");
        BufferedReader reader = new BufferedReader(new FileReader(resource.getFile()));
        StringBuffer buffer = new StringBuffer();
        String line = null;
        while (null != (line = reader.readLine())) {
            buffer.append(line);
            buffer.append("\n");
        }
        IOUtils.closeQuietly(reader);
        
        // need to get the matching transect layer to run against
        CreateResultsLayerProcess createResultsLayerProcess = new CreateResultsLayerProcess(new DummyImportProcess(), new DummyCatalog());
        createResultsLayerProcess.execute(buffer, null, null, null, null);
    }
    
}
