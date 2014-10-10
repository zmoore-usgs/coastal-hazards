package gov.usgs.cida.coastalhazards;

import gov.usgs.cida.coastalhazards.service.util.Property;
import gov.usgs.cida.coastalhazards.service.util.PropertyUtil;
import java.io.File;
import java.io.IOException;
import java.text.MessageFormat;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.apache.commons.io.FileUtils;
import org.slf4j.LoggerFactory;

/**
 * Web application lifecycle listener.
 *
 * @author isuftin
 */
public class InitListener implements ServletContextListener {

	private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(InitListener.class);

	@Override
	public void contextInitialized(ServletContextEvent sce) {
		LOGGER.info("Coastal Hazards UI Application Initializing.");
		ServletContext sc = sce.getServletContext();
		String key = Property.JDBC_NAME.getKey();
		String initParameter = sc.getInitParameter(key);
		System.setProperty(key, initParameter);
		
		String baseDir = PropertyUtil.getProperty(Property.DIRECTORIES_BASE, FileUtils.getTempDirectoryPath() + "/coastal-hazards");
		String workDir = PropertyUtil.getProperty(Property.DIRECTORIES_WORK, "/work");
		String uploadDir = PropertyUtil.getProperty(Property.DIRECTORIES_UPLOAD, "/upload");
		File baseDirFile, workDirFile, uploadDirFile;
		
		baseDirFile = new File(baseDir);
		workDirFile = new File(baseDirFile, workDir);
		uploadDirFile = new File(baseDirFile, uploadDir);

		if (!baseDirFile.exists()) {
			createDir(baseDirFile);
		}

		if (!workDirFile.exists()) {
			createDir(workDirFile);
		}

		if (!uploadDirFile.exists()) {
			createDir(uploadDirFile);
		}

		// TODO- Create file cleanup service for work and upload directories
		LOGGER.info("Coastal Hazards UI Application Initialized.");
	}

	@Override
	public void contextDestroyed(ServletContextEvent sce) {
		LOGGER.info("Coastal Hazards UI Application Destroying.");
		// Do stuff here for application cleanup
		LOGGER.info("Coastal Hazards UI Application Destroyed.");
	}

	private void createDir(File directory) {
		try {
			FileUtils.forceMkdir(directory);
		} catch (IOException ex) {
			LOGGER.error(MessageFormat.format("** Work application directory ({0}) could not be created -- the application should not be expected to function normally", directory.getPath()), ex);
		}
	}
}
