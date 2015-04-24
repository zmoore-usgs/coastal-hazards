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

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.HEALTH_PATH)
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class HealthResource {
	
	private static final String geoserverEndpoint;
	private static final String geoserverUser;
	private static final String geoserverPass;
	private static final DynamicReadOnlyProperties props;
	
	static {
		props = JNDISingleton.getInstance();
		geoserverEndpoint = props.getProperty("coastal-hazards.portal.geoserver.endpoint");
		geoserverUser = props.getProperty("coastal-hazards.geoserver.username");
		geoserverPass = props.getProperty("coastal-hazards.geoserver.password");
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
			componentCheckMap.put("Geoserver", false);
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
