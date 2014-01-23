package gov.usgs.cida.coastalhazards.export;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.data.wfs.protocol.wfs.Version;
import org.opengis.filter.Filter;

/**
 * Client only deals with simple feature collections
 * 
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class WFSExportClient implements WFSClientInterface {
    
    private static final int TIMEOUT = 5000;

    private WFSDataStoreFactory datastore;
    private WFSDataStore wfs;
    public WFSExportClient() {
        datastore = new WFSDataStoreFactory();
        wfs = null;
    }
    
    @Override
    public void setupDatastoreFromGetCaps(String getCapsUrlString) throws MalformedURLException, IOException {
        URL getCapsUrl = new URL(getCapsUrlString);

        Map params = new HashMap<>();
        params.put(WFSDataStoreFactory.URL.key, getCapsUrl);
        params.put(WFSDataStoreFactory.TIMEOUT.key, TIMEOUT);
        params.put(WFSDataStoreFactory.WFS_STRATEGY.key, "arcgis");
        wfs = datastore.createDataStore(params);
    }
    
    @Override
    public void setupDatastoreFromEndpoint(String wfsUrl) throws MalformedURLException, IOException {
        URL getCapsUrl = WFSDataStoreFactory.createGetCapabilitiesRequest(new URL(wfsUrl), Version.v1_1_0);

        Map params = new HashMap<>();
        params.put(WFSDataStoreFactory.URL.key, getCapsUrl);
        params.put(WFSDataStoreFactory.TIMEOUT.key, TIMEOUT);
        params.put(WFSDataStoreFactory.WFS_STRATEGY.key, "arcgis");
        wfs = datastore.createDataStore(params);
    }
    
    @Override
    public SimpleFeatureCollection getFeatureCollection(String typeName, Filter filter) throws IOException {
        if (wfs == null) {
            throw new IllegalStateException("Must set up datastore prior to accessing wfs");
        }
        SimpleFeatureSource featureSource = wfs.getFeatureSource(typeName);
        SimpleFeatureCollection sfc = null;
        if (filter != null) {
            sfc = featureSource.getFeatures(filter);
        } else {
            sfc = featureSource.getFeatures();
        }
        return sfc;
    }
    
    @Override
    public String[] getTypeNames() throws IOException {
        if (wfs == null) {
            throw new IllegalStateException("Must set up datastore prior to accessing wfs");
        }
        String[] typeNames = wfs.getTypeNames();
        return typeNames;
    }
}
