package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.communication.UploadHandler;
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

public class UploadService extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(UploadService.class);
    private static DynamicReadOnlyProperties props = null;
    private static String uploadDirectory = null;
    // Config param string constants
    private static String FILE_UPLOAD_MAX_SIZE_CONFIG_KEY = "coastal-hazards.files.upload.max-size";
    private static String FILE_UPLOAD_FILENAME_PARAM_CONFIG_KEY = "coastal-hazards.files.upload.filename-param";
    private static String DIRECTORY_BASE_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.base";
    private static String DIRECTORY_UPLOAD_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.upload";
    // Config defaults
    private static int FILE_UPLOAD_MAX_SIZE_DEFAULT = 15728640;
    private static String FILE_UPLOAD_FILENAME_PARAM_DEFAULT = "qqfile";

    @Override
    public void init() throws ServletException {
        super.init();
        props = JNDISingleton.getInstance();
        uploadDirectory = props.getProperty(DIRECTORY_BASE_PARAM_CONFIG_KEY) + props.getProperty(DIRECTORY_UPLOAD_PARAM_CONFIG_KEY);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
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
        Map<String, String> responseMap = new HashMap<String, String>();

        try {
            maxFileSize = Integer.parseInt(props.get(FILE_UPLOAD_MAX_SIZE_CONFIG_KEY));
        } catch (NumberFormatException nfe) {
            LOG.info("JNDI property '" + FILE_UPLOAD_MAX_SIZE_CONFIG_KEY + "' not set or is an invalid value. Using: " + maxFileSize);
        }

        // Check that the incoming file is not larger than our limit
        if (maxFileSize > 0 && fileSize > maxFileSize) {
            LOG.info("Upload exceeds max file size of " + maxFileSize + " bytes");
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
            UploadHandler.saveFileFromRequest(request, fileParamKey, uploadDestinationFile);
        } catch (FileUploadException ex) {
            LOG.warn("Could not save file.", ex);
            responseMap.put("error", "Could not save file.");
            responseMap.put("exception", ex.getMessage());
            RequestResponseHelper.sendErrorResponse(response, responseMap);
            return;
        } catch (IOException ex) {
            LOG.warn("Could not save file.", ex);
            responseMap.put("error", "Could not save file.");
            responseMap.put("exception", ex.getMessage());
            RequestResponseHelper.sendErrorResponse(response, responseMap);
            return;
        }
        Enumeration<? extends ZipEntry> entries = new ZipFile(uploadDestinationFile).entries();
        Boolean needsMacFix = false;
        while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();
            String entryName = entry.getName();
            if ((entry.isDirectory() && entryName.toLowerCase().contains("MACOSX"))
                    || entryName.charAt(0) == '.') {
                needsMacFix = true;
            }
        }
        if (needsMacFix) {
            FileHelper.fixMacZip(uploadDestinationFile);
        }

        responseMap.put("file-token", destinationDirectoryChild);
        responseMap.put("file-checksum", Long.toString(FileUtils.checksumCRC32(uploadDestinationFile)));
        responseMap.put("file-size", Long.toString(FileUtils.sizeOf(uploadDestinationFile)));
        responseMap.put("file-name", fileName);

        RequestResponseHelper.sendSuccessResponse(response, responseMap);
    }
}
