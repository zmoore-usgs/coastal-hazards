package gov.usgs.cida.coastalhazards.export;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.data.wfs.protocol.wfs.Version;

/**
 * Client only deals with simple feature collections
 * 
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class WFSExportClient {

    private WFSDataStoreFactory datastore;
    private WFSDataStore wfs;
    public WFSExportClient() {
        datastore = new WFSDataStoreFactory();
        wfs = null;
    }
    
    public void setupDatastoreFromGetCaps(String getCapsUrlString) throws MalformedURLException, IOException {
        URL getCapsUrl = new URL(getCapsUrlString);

        Map params = new HashMap<>();
        params.put(WFSDataStoreFactory.URL.key, getCapsUrl);
        wfs = datastore.createDataStore(params);
    }
    
    public void setupDatastoreFromEndpoint(String wfsUrl) throws MalformedURLException, IOException {
        URL getCapsUrl = WFSDataStoreFactory.createGetCapabilitiesRequest(new URL(wfsUrl), Version.v1_0_0);

        Map params = new HashMap<>();
        params.put(WFSDataStoreFactory.URL.key, getCapsUrl);
        wfs = datastore.createDataStore(params);
    }
    
    public SimpleFeatureCollection getFeatureCollection(String typeName) throws IOException {
        if (wfs == null) {
            throw new IllegalStateException("Must set up datastore prior to accessing wfs");
        }
        SimpleFeatureSource featureSource = wfs.getFeatureSource(typeName);
        return featureSource.getFeatures();
    }
    
    public String[] getTypeNames() throws IOException {
        if (wfs == null) {
            throw new IllegalStateException("Must set up datastore prior to accessing wfs");
        }
        String[] typeNames = wfs.getTypeNames();
        return typeNames;
    }
    
    /**
     * This can be used to see whether two feature collections should be retrieved, or merged into one
     * @param urlA
     * @param typeNameA
     * @param urlB
     * @param typeNameB
     * @return 
     */
    public static boolean testEquality(String urlA, String typeNameA, String urlB, String typeNameB) throws MalformedURLException {
        URL a = new URL(urlA);
        URL b = new URL(urlB);
        // I'm not assuming case insensitivity, so case does matter
        boolean equality = a.getHost().equals(b.getHost()) &&
                a.getPort() == b.getPort() &&
                a.getPath().equals(b.getPath()) &&
                typeNameA.equals(typeNameB);
        return equality;
    }
}
