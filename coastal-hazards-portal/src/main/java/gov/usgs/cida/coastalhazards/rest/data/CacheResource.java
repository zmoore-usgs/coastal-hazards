package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.jpa.StatusManager;
import gov.usgs.cida.coastalhazards.model.util.Status;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.ws.rs.DELETE;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Ehcache;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.config.Configuration;
import net.sf.ehcache.config.DiskStoreConfiguration;
import net.sf.ehcache.config.MemoryUnit;
import net.sf.ehcache.config.PersistenceConfiguration;
import net.sf.ehcache.store.MemoryStoreEvictionPolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.CACHE_PATH)
@PermitAll
public class CacheResource {
	
	private static final Logger log = LoggerFactory.getLogger(CacheResource.class);

	private static final String CACHE_NAME_PROP = "coastal-hazards.portal.geoserver.cache.name";
	private static final String CACHE_NAME = "proxyCache";
	private static final String CACHE_LOCATION_PROP = "coastal-hazards.portal.geoserver.cache.location";
	private static final String CACHE_LOCATION = "${java.io.tmpdir}/ehcache";
	
	private static final String cacheLocation;
	private static final String cacheName;

	static {
		DynamicReadOnlyProperties props = JNDISingleton.getInstance();
		cacheLocation = props.getProperty(CACHE_LOCATION_PROP, CACHE_LOCATION);
		cacheName = props.getProperty(CACHE_NAME_PROP, CACHE_NAME);
	}

	@Path("/")
	@DELETE
	@RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
	public Response deleteCache() {
		Response response = null;
		
		try (StatusManager statusMan = new StatusManager()) {
			if (clearCache()) {
				Status clearedStatus = new Status();
				clearedStatus.setStatusName(Status.StatusName.CACHE_CLEAR);
				statusMan.save(clearedStatus);
				response = Response.ok().build();
			} else {
				response = Response.serverError().entity("Error clearing cache").build();
			}
		} catch (Exception e) {
			log.error("Unable to clear cache", e);
			response = Response.serverError().entity("Unable to clear cache").build();
		}
		return response;
	}
	
	boolean clearCache() {
		boolean cleared = false;
		
		try {
			CacheConfiguration ehConfig = new CacheConfiguration()
				.name(cacheName)
				.memoryStoreEvictionPolicy(MemoryStoreEvictionPolicy.LRU)
				.persistence(new PersistenceConfiguration()
					.strategy(PersistenceConfiguration.Strategy.LOCALTEMPSWAP))
				.maxBytesLocalDisk(10, MemoryUnit.MEGABYTES)
				.maxBytesLocalHeap(1, MemoryUnit.MEGABYTES)
				.clearOnFlush(true);
			Configuration managerConfig = new Configuration()
				.diskStore(new DiskStoreConfiguration().path(cacheLocation))
				.dynamicConfig(false)
				.cache(ehConfig);
			CacheManager cacheManager = CacheManager.create(managerConfig);
			Ehcache ehcache = cacheManager.getEhcache(cacheName);
			if (ehcache != null) {
				ehcache.flush();
				ehcache.removeAll();
				cleared = true;
			} else {
				cleared = false;
			}
		} catch (Exception e) {
			log.debug("Unable to clear cache", e);
			cleared = false;
		}
		
		return cleared;
	}
}
