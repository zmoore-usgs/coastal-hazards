package gov.usgs.cida.utilities;

import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.data.wfs.protocol.wfs.Version;
import org.geotools.geometry.jts.ReferencedEnvelope;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class WFSIntrospector {

	public static Bbox getBbox(WFSService service) throws IOException {
		WFSDataStoreFactory datastore = new WFSDataStoreFactory();
		WFSDataStore wfs;

		URL getCapsUrl = WFSDataStoreFactory.createGetCapabilitiesRequest(new URL(service.getEndpoint()), Version.v1_1_0);

		Map params = new HashMap<>();
		params.put(WFSDataStoreFactory.URL.key, getCapsUrl);
		params.put(WFSDataStoreFactory.TIMEOUT.key, 5000);
		wfs = datastore.createDataStore(params);
		ReferencedEnvelope env = wfs.getFeatureTypeWGS84Bounds(service.getTypeName());
		Bbox bbox = new Bbox();
		bbox.setBbox(env.getMinX(), env.getMinY(), env.getMaxX(), env.getMaxY());
		return bbox;
	}

}
