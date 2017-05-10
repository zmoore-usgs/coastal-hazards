package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.coastalhazards.AuthenticationUtil;
import gov.usgs.cida.coastalhazards.jpa.DataDomainManager;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import java.util.List;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.NotFoundException;
import org.apache.commons.lang.StringUtils;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import org.glassfish.jersey.server.mvc.jsp.JspMvcFeature;
import org.glassfish.jersey.servlet.ServletProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@ApplicationPath(DataURI.DATA_SERVICE_ENDPOINT)
public class DataRestApplication extends ResourceConfig {

	private static final Logger LOG = LoggerFactory.getLogger(DataRestApplication.class);	

	public DataRestApplication() {
		packages(this.getClass().getPackage().getName());
                property(JspMvcFeature.TEMPLATE_BASE_PATH, "/WEB-INF/jsp");
		property(ServletProperties.FILTER_STATIC_CONTENT_REGEX, "(/WEB-INF/jsp/*)");
		register(JspMvcFeature.class);
                register(MultiPartFeature.class);
		//security
		register(RolesAllowedDynamicFeature.class);
		if (!AuthClientSingleton.isInitialized()) {
			AuthenticationUtil.initCCHAuthClient();
		}
		register(CoastalHazardsTokenBasedSecurityFilter.class);
		
		//regenerate data domains on startup
		try (ItemManager itemManager = new ItemManager(); DataDomainManager domainManager = new DataDomainManager()) {
		    LOG.info("Regenerating Data Domains...");
		    List<Item> rootItems = itemManager.loadRootItems();

		    if(rootItems.size() == 1){
			List<String> generatedIds = domainManager.regenerateAllDomains(rootItems.get(0));
			LOG.info("Regenerated Data Domains for: {" + StringUtils.join(generatedIds, ", "), "}");
		    } else {
			throw new NotFoundException("Root Item could not be idenfitied");
		    }
		} catch (Exception e) {
		    LOG.info("Filed to generate data domains. Error: " + e.getMessage());
		}
	}
}
