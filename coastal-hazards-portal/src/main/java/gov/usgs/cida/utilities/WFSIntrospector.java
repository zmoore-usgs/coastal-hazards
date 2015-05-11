package gov.usgs.cida.utilities;

import gov.usgs.cida.coastalhazards.Attributes;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.data.wfs.protocol.wfs.Version;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class WFSIntrospector {

	private static WFSDataStore createDs(WFSService service) throws IOException {
		WFSDataStoreFactory datastore = new WFSDataStoreFactory();
		WFSDataStore wfs;

		URL getCapsUrl = WFSDataStoreFactory.createGetCapabilitiesRequest(new URL(service.getEndpoint()), Version.v1_1_0);

		Map params = new HashMap<>();
		params.put(WFSDataStoreFactory.URL.key, getCapsUrl);
		params.put(WFSDataStoreFactory.TIMEOUT.key, 5000);
		wfs = datastore.createDataStore(params);
		return wfs;
	}
	
	public static Bbox getBbox(WFSService service) throws IOException {
		WFSDataStore wfs = createDs(service);
		ReferencedEnvelope env = wfs.getFeatureTypeWGS84Bounds(service.getTypeName());
		Bbox bbox = new Bbox();
		bbox.setBbox(env.getMinX(), env.getMinY(), env.getMaxX(), env.getMaxY());
		return bbox;
	}
	
	public static List<String> getAttrs(WFSService service) throws IOException {
		List<String> attrs = new LinkedList<>();
		
		WFSDataStore wfs = createDs(service);
		SimpleFeatureType schema = wfs.getSchema(service.getTypeName());
		List<AttributeDescriptor> attributeDescriptors = schema.getAttributeDescriptors();
		for (AttributeDescriptor desc : attributeDescriptors) {
			String localName = desc.getLocalName();
			attrs.add(localName);
		}
		return attrs;
	}

}
