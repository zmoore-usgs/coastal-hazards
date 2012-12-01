package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.GeoserverHandler;
import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.codec.binary.Base64OutputStream;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.LoggerFactory;

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
    private static String DIRECTORY_BASE_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.base";
    private static String DIRECTORY_UPLOAD_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.upload";
    private static String GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.endpoint";
    private static String GEOSERVER_USER_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.username";
    private static String GEOSERVER_PASS_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.password";
    private static GeoserverHandler geoserverHandler = null;
    
    @Override
    public void init() throws ServletException {
        super.init();
        props = JNDISingleton.getInstance();
        uploadDirectory = props.getProperty(DIRECTORY_BASE_PARAM_CONFIG_KEY) + props.getProperty(DIRECTORY_UPLOAD_PARAM_CONFIG_KEY);
        geoserverEndpoint = props.getProperty(GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY);
        geoserverUsername = props.getProperty(GEOSERVER_USER_PARAM_CONFIG_KEY);
        geoserverPassword = props.getProperty(GEOSERVER_PASS_PARAM_CONFIG_KEY);
        geoserverHandler = new GeoserverHandler(geoserverEndpoint, geoserverUsername, geoserverPassword);
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String fileToken = request.getParameter("file-token");
        File fileDirectoryHandle = new File(new File(uploadDirectory), fileToken);
        File shapeFile;
        Map<String, String> responseMap = new HashMap<String, String>();
        
        if (StringUtils.isBlank(fileToken)) {
            responseMap.put("error", "Parameter 'file-token' cannot be blank");
            RequestResponseHelper.sendErrorResponse(response, responseMap);
            return;
        }
        
        if (!fileDirectoryHandle.exists() || fileDirectoryHandle.listFiles().length == 0) {
            FileUtils.deleteQuietly(fileDirectoryHandle);
            responseMap.put("error", "The file denoted by token " + fileToken + " does not exist.");
            RequestResponseHelper.sendErrorResponse(response, responseMap);
            return;
        }
        
        // We assume there is only one file per directory
        shapeFile = fileDirectoryHandle.listFiles()[0];
        String importResult = geoserverHandler.importFeatures(shapeFile, "ch-input", FilenameUtils.removeExtension(shapeFile.getName()));
        
        responseMap.put("file-token", fileToken);
        responseMap.put("endpoint", importResult);
        RequestResponseHelper.sendSuccessResponse(response, responseMap);
        
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP
     * <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP
     * <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}
