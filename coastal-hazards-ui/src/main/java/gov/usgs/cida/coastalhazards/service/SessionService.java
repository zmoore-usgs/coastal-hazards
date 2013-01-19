package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.GeoserverHandler;
import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import it.geosolutions.geoserver.rest.GeoServerRESTManager;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang.StringUtils;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public class SessionService extends HttpServlet {

    private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(ImportService.class);
    private static DynamicReadOnlyProperties props = null;
    private static GeoserverHandler geoserverHandler = null;
    private static String geoserverEndpoint = null;
    private static String geoserverUsername = null;
    private static String geoserverPassword = null;
    private static String geoserverDataDir = null;
    private static String GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.endpoint";
    private static String GEOSERVER_USER_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.username";
    private static String GEOSERVER_PASS_PARAM_CONFIG_KEY = "coastal-hazards.geoserver.password";
    private static String GEOSERVER_DATA_DIR_KEY = "coastal-hazards.geoserver.datadir";

    @Override
    public void init() throws ServletException {
        super.init();
        props = JNDISingleton.getInstance();
        geoserverEndpoint = props.getProperty(GEOSERVER_ENDPOINT_PARAM_CONFIG_KEY);
        geoserverUsername = props.getProperty(GEOSERVER_USER_PARAM_CONFIG_KEY);
        geoserverPassword = props.getProperty(GEOSERVER_PASS_PARAM_CONFIG_KEY);
        geoserverDataDir = props.getProperty(GEOSERVER_DATA_DIR_KEY);
        geoserverHandler = new GeoserverHandler(geoserverEndpoint, geoserverUsername, geoserverPassword);
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getParameter("action");
        String workspace = request.getParameter("workspace");
        Map<String, String> responseMap = new HashMap<String, String>();

        if (!StringUtils.isEmpty(action) && "prepare".equals(action.trim().toLowerCase())) {
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
        }
        
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
