package gov.usgs.cida.coastalhazards.rest.data;

import javax.ws.rs.core.Response;
import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Ehcache;
import net.sf.ehcache.Element;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.config.Configuration;
import net.sf.ehcache.config.DiskStoreConfiguration;
import net.sf.ehcache.config.MemoryUnit;
import net.sf.ehcache.config.PersistenceConfiguration;
import net.sf.ehcache.store.MemoryStoreEvictionPolicy;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class CacheResourceTest {

	private static final String CACHE_NAME = "proxyCache";
	private static final String CACHE_LOCATION = "${java.io.tmpdir}/ehcache";

	/**
	 * Test of clearCache method, of class CacheResource.
	 */
	@Test
	public void testClearCache() {
		CacheConfiguration ehConfig = new CacheConfiguration()
				.name(CACHE_NAME)
				.memoryStoreEvictionPolicy(MemoryStoreEvictionPolicy.LRU)
				.persistence(new PersistenceConfiguration()
						.strategy(PersistenceConfiguration.Strategy.LOCALTEMPSWAP))
				.timeToLiveSeconds(1000)
				.timeToIdleSeconds(1000)
				.clearOnFlush(true);
		Configuration managerConfig = new Configuration()
				.diskStore(new DiskStoreConfiguration().path(CACHE_LOCATION))
				.maxBytesLocalHeap(1, MemoryUnit.MEGABYTES)
				.maxBytesLocalDisk(100, MemoryUnit.MEGABYTES)
				.dynamicConfig(false)
				.cache(ehConfig);
		CacheManager cacheManager = CacheManager.create(managerConfig);
		Ehcache ehcache = cacheManager.getEhcache(CACHE_NAME);

		for (int i = 0; i < 100; i++) {
			Element e = new Element(i, "value" + i);
			ehcache.put(e);
		}
		assertThat(ehcache.getSize(), is(equalTo(100)));

		CacheResource instance = new CacheResource();
		Response result = instance.clearCache();
		assertThat(result.getStatus(), is(equalTo(200)));

		assertThat(ehcache.getSize(), is(equalTo(0)));
	}

}
