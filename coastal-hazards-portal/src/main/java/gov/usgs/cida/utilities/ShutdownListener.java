package gov.usgs.cida.utilities;

import gov.usgs.cida.coastalhazards.jpa.JPAHelper;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Web application lifecycle listener.
 *
 * @author jiwalker
 */
public class ShutdownListener implements ServletContextListener {
    
    private static final Logger LOG = LoggerFactory.getLogger(ShutdownListener.class);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // anything that needs to be set up on startup
        LOG.debug("Coastal Change Hazards Portal initialized");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        JPAHelper.closeEntityManagerFactory();
        LOG.debug("Coastal Change Hazards Portal destroyed");
    }
}
