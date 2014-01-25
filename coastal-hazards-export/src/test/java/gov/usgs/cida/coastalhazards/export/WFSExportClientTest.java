package gov.usgs.cida.coastalhazards.export;

import java.io.IOException;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import org.junit.Ignore;

/**
 *
 * @author jiwalker
 */
public class WFSExportClientTest {
    
	@Ignore
    @Test
    public void testWFSExport() throws IOException {
		//Can we pull this out to get served up by a dummy?
        String getCaps = "http://coastalmap.marine.usgs.gov/cmgp/National/cvi_WFS/MapServer/WFSServer?service=WFS&request=GetCapabilities&version=1.1.0";
        WFSExportClient client = new WFSExportClient();
        client.setupDatastoreFromGetCaps(getCaps);
        SimpleFeatureCollection featureCollection = client.getFeatureCollection("National_cvi_WFS:atlantic_cvi", null);
        String id = featureCollection.getID();
        assertThat(id, is(equalTo("featureCollection")));
    }
    
}
