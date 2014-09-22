package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.coastalhazards.uncy.Xploder;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.communication.FormUploadHandler;
import gov.usgs.cida.utilities.file.FileHelper;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.File;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import javax.servlet.ServletException;
import javax.servlet.http.*;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.io.FileUtils;
import org.slf4j.LoggerFactory;

/**
 * Receives a shape file from a client and saves it to the file system
 *
 * @author isuftin
 */
public class UploadService extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(UploadService.class);
	private static DynamicReadOnlyProperties props = null;
	private static String uploadDirectory = null;

	private static final String FILE_UPLOAD_MAX_SIZE_CONFIG_KEY = "coastal-hazards.files.upload.max-size";
	private static final String FILE_UPLOAD_FILENAME_PARAM_CONFIG_KEY = "coastal-hazards.files.upload.filename-param";
	private static final String DIRECTORY_BASE_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.base";
	private static final String DIRECTORY_UPLOAD_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.upload";
	private static final int FILE_UPLOAD_MAX_SIZE_DEFAULT = 15728640;
	private static final String FILE_UPLOAD_FILENAME_PARAM_DEFAULT = "qqfile";

	@Override
	public void init() throws ServletException {
		super.init();
		props = JNDISingleton.getInstance();
		uploadDirectory = props.getProperty(DIRECTORY_BASE_PARAM_CONFIG_KEY) + props.getProperty(DIRECTORY_UPLOAD_PARAM_CONFIG_KEY);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		int maxFileSize = FILE_UPLOAD_MAX_SIZE_DEFAULT;
		int fileSize = Integer.parseInt(request.getHeader("Content-Length"));
		String fileParamKey = props.getProperty(FILE_UPLOAD_FILENAME_PARAM_CONFIG_KEY, FILE_UPLOAD_FILENAME_PARAM_DEFAULT);
		String fileName = request.getParameter(fileParamKey);
		String destinationDirectoryChild = UUID.randomUUID().toString();
		File uploadDestinationDirectory = new File(new File(uploadDirectory), destinationDirectoryChild);
		File uploadDestinationFile = new File(uploadDestinationDirectory, fileName);
		Map<String, String> responseMap = new HashMap<>();

		try {
			maxFileSize = Integer.parseInt(props.get(FILE_UPLOAD_MAX_SIZE_CONFIG_KEY));
		} catch (NumberFormatException nfe) {
			LOG.info("JNDI property '{}' not set or is an invalid value. Using: {}", FILE_UPLOAD_MAX_SIZE_CONFIG_KEY, maxFileSize);
		}

		// Check that the incoming file is not larger than our limit
		if (maxFileSize > 0 && fileSize > maxFileSize) {
			LOG.info("Upload exceeds max file size of {} bytes", maxFileSize);
			responseMap.put("error", "Upload exceeds max file size of " + maxFileSize + " bytes");
			RequestResponseHelper.sendErrorResponse(response, responseMap);
			return;
		}

		// Create destination directory
		try {
			FileUtils.forceMkdir(uploadDestinationDirectory);
		} catch (IOException ioe) {
			LOG.warn("Could not save file.", ioe);
			responseMap.put("error", "Could not save file.");
			responseMap.put("exception", ioe.getMessage());
			RequestResponseHelper.sendErrorResponse(response, responseMap);
			return;
		}

		// Save the file to the upload directory
		try {
			FormUploadHandler.saveFileFromRequest(request, fileParamKey, uploadDestinationFile);
		} catch (FileUploadException | IOException ex) {
			LOG.warn("Could not save file.", ex);
			responseMap.put("error", "Could not save file.");
			responseMap.put("exception", ex.getMessage());
			RequestResponseHelper.sendErrorResponse(response, responseMap);
			return;
		}

		boolean hasHidden = false;
		boolean needsLidarExplosion = false;
		try (ZipFile zipFile = new ZipFile(uploadDestinationFile)) {
			Enumeration<? extends ZipEntry> entries = zipFile.entries();
			while (entries.hasMoreElements()) {
				ZipEntry entry = entries.nextElement();
				if (FileHelper.entryIsHidden(entry)) {
					hasHidden = true;
				}
				if (entry.getName().endsWith("_uncertainty.dbf")) {
					needsLidarExplosion = true;
				}
			}
		}
		
		if (hasHidden) {
			FileHelper.removeHiddenEntries(uploadDestinationFile);
		}

		if (needsLidarExplosion) {
			// add another zipfile to the upload directory, with exploded point data
			ZipInterpolator exploder = new ZipInterpolator();

			try {
				File xplodedFile = exploder.explode(uploadDestinationFile);

				responseMap.put("pts-file-checksum", Long.toString(FileUtils.checksumCRC32(xplodedFile)));
				responseMap.put("pts-file-size", Long.toString(FileUtils.sizeOf(xplodedFile)));
				responseMap.put("pts-file-name", xplodedFile.getName());

			} catch (Exception e) {
				throw new RuntimeException("Problem exploding shapefile zip file", e);
			}
		}

		responseMap.put("file-token", destinationDirectoryChild);
		responseMap.put("file-checksum", Long.toString(FileUtils.checksumCRC32(uploadDestinationFile)));
		responseMap.put("file-size", Long.toString(FileUtils.sizeOf(uploadDestinationFile)));
		responseMap.put("file-name", fileName);

		RequestResponseHelper.sendSuccessResponse(response, responseMap);
	}
}
