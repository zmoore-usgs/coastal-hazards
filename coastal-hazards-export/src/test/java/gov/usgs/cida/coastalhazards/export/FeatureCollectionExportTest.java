package gov.usgs.cida.coastalhazards.export;

import java.io.File;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.junit.Ignore;
import org.junit.Test;

/**
 *
 * @author jiwalker
 */
public class FeatureCollectionExportTest {

    /**
     * Test of writeToShapefile method, of class FeatureCollectionExport.
     * ignoring this so it doesn't hit the server too much, mock this out for real test
     */
    @Test
    @Ignore
    public void testWriteToShapefile() throws Exception {
        WFSDataStoreFactory datastore = new WFSDataStoreFactory();
        Map params = new HashMap<>();
        params.put(WFSDataStoreFactory.URL.key, new URL("http://coastalmap.marine.usgs.gov/cmgp/National/cvi_WFS/MapServer/WFSServer?service=WFS&request=GetCapabilities&version=1.0.0"));
        WFSDataStore wfs = datastore.createDataStore(params);
        String[] typeNames = wfs.getTypeNames();
        SimpleFeatureSource featureSource = wfs.getFeatureSource(typeNames[0]);
        
        FeatureCollectionExport featureCollectionExport = new FeatureCollectionExport(featureSource.getFeatures(), new File("/tmp/shpfile"), "test");
        featureCollectionExport.addAttribute("CVI");
        featureCollectionExport.writeToShapefile();
    }
    
}
