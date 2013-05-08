package gov.usgs.cida.coastalhazards.util;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.net.URL;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.naming.NamingException;
import org.apache.commons.lang.StringUtils;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.CatalogBuilder;
import org.geoserver.catalog.DataStoreInfo;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.catalog.WorkspaceInfo;
import org.geotools.data.DataAccess;
import org.geotools.data.FeatureSource;
import org.geotools.data.FileDataStore;
import org.geotools.util.DefaultProgressListener;
import org.opengis.feature.Feature;
import org.opengis.feature.type.FeatureType;
import org.opengis.feature.type.Name;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.jndi.JndiTemplate;

/**
 *
 * @author isuftin
 */
public class GeoserverSweeperStartupListener implements InitializingBean {

	private Long maxAge;
	private Long runEveryMs;
	private Catalog catalog;
	private String[] readOnlyWorkspaces;
	private Thread sweeperThread;

	public GeoserverSweeperStartupListener(Catalog catalog) {
		this.catalog = catalog;
	}

	public void destroy() throws Exception {
		this.sweeperThread.interrupt();
		this.sweeperThread.join(this.runEveryMs + 60000);
		// Done
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		JndiTemplate template = new JndiTemplate();

		// Get the maximum age that a layer can be
		try {
			this.maxAge = template.lookup("java:comp/env/coastal-hazards.geoserver.layer.age.maximum", Long.class);
		} catch (NamingException ex) {
			// Init parameter max-age was not set. Setting max-age to 604800000 (7d)
			this.maxAge = 604800000l;
		}

		try {
			this.runEveryMs = template.lookup("java:comp/env/coastal-hazards.geoserver.sweeper.run.every.ms", Long.class);
//			this.runEveryMs = 3600000;
		} catch (NamingException ex) {
			// Init parameter run ever ms was not set, set it for 3600000 (1h)
			this.runEveryMs = 10000l;
//			this.runEveryMs = 3600000l;
		}

		// Get the workspaces we do not touch
		String permWorkspaces = "published";
//		String permWorkspaces = template.lookup("java:comp/env/coastal-hazards.geoserver.workspaces.permanent", String.class);
		if (StringUtils.isNotBlank(permWorkspaces)) {
			this.readOnlyWorkspaces = permWorkspaces.split(",");
			this.sweeperThread = new Thread(new Sweeper(this.catalog, this.maxAge, this.readOnlyWorkspaces, this.runEveryMs), "sweeper-thread");
			this.sweeperThread.start();
		}
	}

	private class Sweeper implements Runnable {

		private Long maxAge;
		private Long runEveryMs;
		private String[] readOnlyWorkspaces;
		private Catalog catalog;

		public Sweeper(Catalog catalog, Long maxAge, String[] readOnlyWorkspaces, Long runEveryMs) {
			this.catalog = catalog;
			this.maxAge = maxAge;
			this.readOnlyWorkspaces = readOnlyWorkspaces;
			this.runEveryMs = runEveryMs;
		}

		@Override
		public void run() {
			try {
				while (!Thread.interrupted()) {
					GeoserverUtils gsUtils = new GeoserverUtils(this.catalog);

					// Get a cleaned list of workspaces
					List<WorkspaceInfo> workspaceInfoList = catalog.getWorkspaces();
					Iterator<WorkspaceInfo> it = workspaceInfoList.iterator();
					while (it.hasNext()) {
						WorkspaceInfo wsInfo = it.next();
						if (java.util.Arrays.asList(readOnlyWorkspaces).contains(wsInfo.getName())) {
							it.remove();
						}
					}

					for (WorkspaceInfo wsInfo : workspaceInfoList) {
						List<DataStoreInfo> dataStoreInfoList = catalog.getDataStoresByWorkspace(wsInfo);
						for (DataStoreInfo dsInfo : dataStoreInfoList) {
							try {
								Map<String, Serializable> params = dsInfo.getConnectionParameters();
								File directory = null;
								for (Map.Entry<String, Serializable> e : params.entrySet()) {
									if (e.getValue() instanceof File) {
										directory = (File) e.getValue();
									} else if (e.getValue() instanceof URL) {
										directory = new File(((URL) e.getValue()).getFile());
									}
									if (directory != null && !"directory".equals(e.getKey())) {
										directory = directory.getParentFile();
									}

									if (directory != null) {
										break;
									}
								}

								DataAccess<? extends FeatureType, ? extends Feature> da = dsInfo.getDataStore(new DefaultProgressListener());
								List<Name> resourceNames = da.getNames();
								for (Name resourceName : resourceNames) {
									FeatureSource<? extends FeatureType, ? extends Feature> featureSource = da.getFeatureSource(resourceName);
									LayerInfo layerInfo = catalog.getLayerByName(resourceName);


								}
							} catch (IOException ex) {
								Logger.getLogger(GeoserverSweeperStartupListener.class.getName()).log(Level.SEVERE, null, ex);
							}
						}
					}

					Thread.sleep(runEveryMs);
				}
			} catch (InterruptedException ex) {
				// Handle exeption
			} finally {
				// Clean up
			}
		}
	}
}
