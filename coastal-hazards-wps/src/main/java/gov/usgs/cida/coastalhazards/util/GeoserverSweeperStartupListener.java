package gov.usgs.cida.coastalhazards.util;

import javax.naming.NamingException;
import org.apache.commons.lang.StringUtils;
import org.geoserver.catalog.Catalog;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.jndi.JndiTemplate;

/**
 *
 * @author isuftin
 */
public class GeoserverSweeperStartupListener implements InitializingBean {

	private Integer maxAge;
	private Catalog catalog;
	private String[] workspaces;

	public GeoserverSweeperStartupListener(Catalog catalog) {
		this.catalog = catalog;
	}
//	private int maxAge;
//
//	public void contextInitialized(ServletContextEvent sce) {
//		ServletContext sc = sce.getServletContext();
//		try {
//			this.maxAge = Integer.parseInt(sc.getInitParameter("max-age"));
//		} catch (NumberFormatException ex) {
//			// Init parameter max-age was not set. Setting max-age to 604800000 (7d)
//			this.maxAge = 604800000;
//		}
//		
//		WebApplicationContext ctx = WebApplicationContextUtils.getRequiredWebApplicationContext(sc);
//		Catalog catalog = (Catalog) ctx.getBean("catalog");
//		String a = "";
//	}
//
//	public void contextDestroyed(ServletContextEvent sce) {
//	}

	public void destroy() throws Exception {
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		JndiTemplate template = new JndiTemplate();

		// Get the maximum age that a layer can be
		try {
			this.maxAge = template.lookup("java:comp/env/coastal-hazards.geoserver.layer.age.maximum", Integer.class);
		} catch (NamingException ex) {
			// Init parameter max-age was not set. Setting max-age to 604800000 (7d)
			this.maxAge = 604800000;
		}

		// Get the workspaces we do not touch
		String permWorkspaces = template.lookup("java:comp/env/coastal-hazards.geoserver.workspaces.permanent", String.class);
		if (StringUtils.isBlank(permWorkspaces)) {
			this.workspaces = new String[0];
		}
	}
}
