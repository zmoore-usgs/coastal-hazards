package gov.usgs.cida.coastalhazards.domain;

import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.data.wfs.protocol.wfs.Version;
import org.geotools.data.wfs.protocol.wfs.WFSException;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class WFSGetDomain {
    
    private static final Logger log = LoggerFactory.getLogger(WFSGetDomain.class);

    private static final int TIMEOUT_MILLISECONDS = 30 * 1000;
    
    private WFSDataStoreFactory datastore;
    
    public WFSGetDomain() {
        datastore = new WFSDataStoreFactory();
    }
    
    public Set<String> getDomainValuesAsStrings(WFSService service, String attribute) throws IOException {
        Set<String> domain = new HashSet<>();
        
        URL getCapsUrl = WFSDataStoreFactory.createGetCapabilitiesRequest(new URL(service.getEndpoint()), Version.v1_1_0);
        log.debug("Getting domains from wfs at " + getCapsUrl);
        
        Map params = new HashMap<>();
        params.put(WFSDataStoreFactory.URL.key, getCapsUrl);
        params.put(WFSDataStoreFactory.TIMEOUT.key, TIMEOUT_MILLISECONDS);
        WFSDataStore wfs = datastore.createDataStore(params);
        if (wfs == null) {
            log.debug("Could not set up WFS datastore");
            throw new WFSException("Could not set up WFS datastore");
        }
        try {
            Query query = new Query(service.getTypeName(), Filter.INCLUDE, new String[] {attribute});

            SimpleFeatureSource featureSource = wfs.getFeatureSource(service.getTypeName());
            SimpleFeatureCollection features = featureSource.getFeatures(query);
            SimpleFeatureIterator iterator = features.features();
            while (iterator.hasNext()) {
                SimpleFeature next = iterator.next();
                Object attr = next.getAttribute(attribute);
                if (attr instanceof String) {
                    String attrVal = (String) attr;
                    domain.add(attrVal);
                } else {
                    throw new UnsupportedOperationException("Currently only string attributes are allowed");
                }
            }
        } finally {
            wfs.dispose();
        }
        return domain;
    }
}
