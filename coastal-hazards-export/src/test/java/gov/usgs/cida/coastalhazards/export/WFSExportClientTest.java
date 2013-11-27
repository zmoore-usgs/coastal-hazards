package gov.usgs.cida.coastalhazards.export;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.junit.Test;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

/**
 *
 * @author jiwalker
 */
public class WFSExportClientTest {
    
    @Test
    public void testWFSExport() throws IOException {
        String getCaps = "http://coastalmap.marine.usgs.gov/cmgp/National/cvi_WFS/MapServer/WFSServer?service=WFS&request=GetCapabilities&version=1.0.0";
        WFSExportClient client = new WFSExportClient();
        client.setupDatastoreFromGetCaps(getCaps);
        SimpleFeatureCollection featureCollection = client.getFeatureCollection("National_cvi_WFS:GulfofMexico_CVI");
        String id = featureCollection.getID();
        assertThat(id, is(equalTo("featureCollection")));
    }
    
}
