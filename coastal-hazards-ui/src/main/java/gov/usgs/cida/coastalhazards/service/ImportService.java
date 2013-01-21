package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.GeoserverHandler;
import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.file.FileHelper;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTManager;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.filefilter.WildcardFileFilter;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpResponse;
import org.slf4j.LoggerFactory;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 *
 * @author isuftin
 */
public class ImportService extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(ImportService.class);
    private static DynamicReadOnlyProperties props = null;
    private static String uploadDirectory = null;
    private static String geoserverEndpoint = null;
    private static String geoserverUsername = null;
    private static String geoserverPassword = null;
    private static String geoserverDataDir = null;
    private static String DIRECTORY_BASE_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.base";
    private static String DIRECTORY_UPLOAD_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.upload";
    private static String GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.endpoint";
    private static String GEOSERVER_USER_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.username";
    private static String GEOSERVER_PASS_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.password";
    private static String GEOSERVER_DATA_DIR_KEY = "coastal-hazards.geoserver.datadir";
    private static GeoserverHandler geoserverHandler = null;
    private static GeoServerRESTManager gsrm = null;

    @Override
    public void init() throws ServletException {
        super.init();
        props = JNDISingleton.getInstance();
        uploadDirectory = props.getProperty(DIRECTORY_BASE_PARAM_CONFIG_KEY) + props.getProperty(DIRECTORY_UPLOAD_PARAM_CONFIG_KEY);
        geoserverEndpoint = props.getProperty(GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY);
        geoserverUsername = props.getProperty(GEOSERVER_USER_PARAM_CONFIG_KEY);
        geoserverPassword = props.getProperty(GEOSERVER_PASS_PARAM_CONFIG_KEY);
        geoserverDataDir = props.getProperty(GEOSERVER_DATA_DIR_KEY);
        geoserverHandler = new GeoserverHandler(geoserverEndpoint, geoserverUsername, geoserverPassword);
        try {
            gsrm = new GeoServerRESTManager(new URL(geoserverEndpoint), geoserverUsername, geoserverPassword);
        } catch (MalformedURLException ex) {
            Logger.getLogger(ImportService.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, IllegalArgumentException {
        String fileToken = request.getParameter("file-token");
        String featureName = request.getParameter("feature-name");
        String workspace = request.getParameter("workspace");
        String store = request.getParameter("store");
        File shapeFile;
        String name;
        Map<String, String> responseMap = new HashMap<String, String>();

        File fileDirectoryHandle;
        if (StringUtils.isBlank(fileToken)) {
            // If fileToken is blank, create a blank shapefile to import
            fileToken = UUID.randomUUID().toString();
            String fileName = UUID.randomUUID().toString();
            File subdir = new File(uploadDirectory + File.separator + fileToken);
            FileUtils.forceMkdir(subdir);
            File emptyShapeFile = geoserverHandler.createEmptyShapefile(subdir.getPath(), fileName);
            FileHelper.zipFile(emptyShapeFile.getParentFile(), null, null);
            fileDirectoryHandle = new File(new File(uploadDirectory), fileToken);
        } else {
            fileDirectoryHandle = new File(new File(uploadDirectory), fileToken);
        }

        if (StringUtils.isBlank(workspace)) {
            responseMap.put("error", "Parameter 'workspace' cannot be blank");
            RequestResponseHelper.sendErrorResponse(response, responseMap);
            return;
        }

        if (!fileDirectoryHandle.exists() || fileDirectoryHandle.listFiles().length == 0) {
            FileUtils.deleteQuietly(fileDirectoryHandle);
            responseMap.put("error", "The file denoted by token " + fileToken + " does not exist.");
            RequestResponseHelper.sendErrorResponse(response, responseMap);
            return;
        }
        try {
            geoserverHandler.prepareWorkspace(geoserverDataDir, workspace);
        } catch (MalformedURLException ex) {
            responseMap.put("error", "Could not create workspace: " + ex.getMessage());
            RequestResponseHelper.sendErrorResponse(response, responseMap);
            return;
        } catch (URISyntaxException ex) {
            responseMap.put("error", "Could not create workspace: " + ex.getMessage());
            RequestResponseHelper.sendErrorResponse(response, responseMap);
            return;
        }

        FileFilter zipFileFilter = new WildcardFileFilter("*.zip");

        // We assume there is only one file per directory
        shapeFile = fileDirectoryHandle.listFiles(zipFileFilter)[0];
        name = StringUtils.isBlank(featureName) ? FilenameUtils.removeExtension(shapeFile.getName()) : featureName;
        HttpResponse importResponse = geoserverHandler.importFeaturesFromFile(shapeFile, workspace, store, name);
        String responseText = IOUtils.toString(importResponse.getEntity().getContent());

        if (!responseText.toLowerCase().contains("ows:exception")) {
            responseMap.put("file-token", fileToken);
            responseMap.put("feature", responseText);
            responseMap.put("endpoint", geoserverEndpoint);
            RequestResponseHelper.sendSuccessResponse(response, responseMap);
        } else {
            InputSource source = new InputSource(new StringReader(responseText));
            XPath xPath = XPathFactory.newInstance().newXPath();
            NodeList list;
            String error = "";
            try {
                list = (NodeList) xPath.evaluate("//*[local-name()='ExceptionText']", source, XPathConstants.NODESET);
                error = list.item(0).getTextContent();
            } catch (XPathExpressionException ex) {
                Logger.getLogger(ImportService.class.getName()).log(Level.SEVERE, null, ex);
            }

            responseMap.put("file-token", fileToken);
            responseMap.put("error", error);
            RequestResponseHelper.sendErrorResponse(response, responseMap);
        }
    }


    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }
}
