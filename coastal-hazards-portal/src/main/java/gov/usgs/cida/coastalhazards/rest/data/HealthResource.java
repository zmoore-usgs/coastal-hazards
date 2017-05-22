package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.jpa.JPAHelper;
import gov.usgs.cida.coastalhazards.jpa.StatusManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.util.Status;
import gov.usgs.cida.coastalhazards.model.util.Status.StatusName;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTReader;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import javax.annotation.security.PermitAll;
import javax.persistence.EntityManagerFactory;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.HEALTH_PATH)
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class HealthResource {
	private static final Logger LOG = LoggerFactory.getLogger(HealthResource.class);
	private static final String geoserverEndpoint;
	private static final String geoserverUser;
	private static final String geoserverPass;
        private static final String pycswEndpoint;
        private static final String pycswVersion;
        private static final String pycswVersionDefault = "2.0.2";
	private static final DynamicReadOnlyProperties props;
	
	static {
		props = JNDISingleton.getInstance();
		geoserverEndpoint = props.getProperty("coastal-hazards.portal.geoserver.endpoint");
		geoserverUser = props.getProperty("coastal-hazards.geoserver.username");
		geoserverPass = props.getProperty("coastal-hazards.geoserver.password");
                pycswVersion = props.getProperty("coastal-hazards.csw.version", pycswVersionDefault);
                pycswEndpoint = props.getProperty("coastal-hazards.csw.external.endpoint");  // includes the / csw/
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response healthCheck() {
		Response response;

		boolean overallHealth = true;
		Map<String, Object> componentCheckMap = new TreeMap<>();

		try {
			EntityManagerFactory emf = JPAHelper.getEntityManagerFactory();
			boolean open = emf.isOpen();
			componentCheckMap.put("EntityManagerFactory", open);
			overallHealth = open && overallHealth;
		}
		catch (Exception e) {
			LOG.warn("Exception occurred while checking health", e);
			componentCheckMap.put("EntityManagerFactory", false);
			overallHealth = false;
		}

		try {
			Gson defaultGson = GsonUtil.getDefault();
			boolean ok = (defaultGson != null);
			componentCheckMap.put("DefaultGson", ok);
			overallHealth = ok && overallHealth;
		}
		catch (Exception e) {
			LOG.warn("Exception occurred while checking health", e);
			componentCheckMap.put("DefaultGson", false);
			overallHealth = false;
		}

		try {
			Gson idGson = GsonUtil.getIdOnlyGson();
			boolean ok = (idGson != null);
			componentCheckMap.put("NonSubtreeGson", ok);
			overallHealth = ok && overallHealth;
		}
		catch (Exception e) {
			LOG.warn("Exception occurred while checking health", e);
			componentCheckMap.put("NonSubtreeGson", false);
			overallHealth = false;
		}

		try {
			Gson subtreeGson = GsonUtil.getSubtreeGson();
			boolean ok = (subtreeGson != null);
			componentCheckMap.put("SubtreeGson", ok);
			overallHealth = ok && overallHealth;
		}
		catch (Exception e) {
			LOG.warn("Exception occurred while checking health", e);
			componentCheckMap.put("SubtreeGson", false);
			overallHealth = false;
		}

		try (ItemManager im = new ItemManager()) {
			Item uber = im.load("uber");
			boolean ok = (uber != null && uber.isEnabled());
			componentCheckMap.put("ItemManager", ok);
			overallHealth = ok && overallHealth;
		}
		catch (Exception e) {
			LOG.warn("Exception occurred while checking health", e);
			componentCheckMap.put("ItemManager", false);
			overallHealth = false;
		}
		
		try {
			Map<String, Boolean> geoserverStatus = new HashMap<>();
			GeoServerRESTReader rest = new GeoServerRESTReader(geoserverEndpoint, geoserverUser, geoserverPass);
			boolean existGeoserver = rest.existGeoserver();
			boolean workspacesConfigured = rest.getWorkspaceNames().contains("proxied");
			// TODO may want to add some more checks
			
			geoserverStatus.put("up", existGeoserver);
			geoserverStatus.put("configured", workspacesConfigured);
			
			componentCheckMap.put("Geoserver", geoserverStatus);
			overallHealth = overallHealth && existGeoserver && workspacesConfigured;
		} catch (Exception e) {
			LOG.warn("Exception occurred while checking health", e);
			componentCheckMap.put("Geoserver", false);
			overallHealth = false;
		}
                
                try { // health check add for pycsw Jira cchs-306
                        boolean hasCswGetCapabilities = false;
                        Map<String, Boolean> pyCswStatus = new HashMap<>();
                        
			String endpointTest = pycswEndpoint + "?service=CSW&request=GetCapabilities&version=" + pycswVersion;
                        HttpGet httpGet = new HttpGet(endpointTest);
                        HttpClient httpclient = new DefaultHttpClient();
                        
                        // Create a custom response handler
                        ResponseHandler<String> responseHandler = new ResponseHandler<String>() {

                            @Override
                            public String handleResponse(
                                final HttpResponse response) throws ClientProtocolException, IOException {
                                int status = response.getStatusLine().getStatusCode();
                                if (status >= 200 && status < 300) {
                                HttpEntity entity = response.getEntity();
                                    return entity != null ? EntityUtils.toString(entity) : null;
                                } else {
                                throw new ClientProtocolException("Unexpected response status: " + status);
                                }
                            }
                        }; // close anonymous inner class
                    
                        String resp = httpclient.execute(httpGet, responseHandler); 
			hasCswGetCapabilities = resp != null;
			
                        pyCswStatus.put("getCapabilities", hasCswGetCapabilities);
			componentCheckMap.put("PyCsw", pyCswStatus);
			overallHealth = overallHealth && hasCswGetCapabilities;
                        
		} catch (Exception e) {
			LOG.warn("Exception occurred while checking csw health", e);
			componentCheckMap.put("Pycsw", false);
			overallHealth = false;
		}
                                             
		try (StatusManager statusMan = new StatusManager()) {
			// NOTE this does not effect the overall health
			boolean staleCache = false;
			Map<Status.StatusName, Status> statuses = statusMan.loadAll();
			Status itemLastUpdate = statuses.get(StatusName.ITEM_UPDATE);
			Status structureLastUpdate = statuses.get(StatusName.STRUCTURE_UPDATE);
			Status cacheClearedDate = statuses.get(StatusName.CACHE_CLEAR);
			Date itemOrStructureUpdate = null;
			if (itemLastUpdate != null) {
				itemOrStructureUpdate = itemLastUpdate.getLastUpdate();
			}
			if (structureLastUpdate != null) {
				Date structureDate = structureLastUpdate.getLastUpdate();
				if (structureDate != null && itemOrStructureUpdate != null && structureDate.after(itemOrStructureUpdate)) {
					itemOrStructureUpdate = structureDate;
				}
			}
			if (cacheClearedDate != null) {
				Date cacheDate = cacheClearedDate.getLastUpdate();
				if (cacheDate != null && itemOrStructureUpdate != null && cacheDate.before(itemOrStructureUpdate)) {
					staleCache = true;
				}
			}
			componentCheckMap.put("TileCacheStale", staleCache);
		}

		Gson gson = GsonUtil.getDefault();
		String json = gson.toJson(componentCheckMap);
		if (overallHealth) {
			response = Response.ok(json, MediaType.APPLICATION_JSON_TYPE).build();
		}
		else {
			response = Response.serverError().entity(json).build();
		}

		return response;
	}

}
