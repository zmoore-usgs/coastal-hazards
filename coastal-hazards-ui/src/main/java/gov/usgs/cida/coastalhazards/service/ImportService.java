package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
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
    private static String DIRECTORY_BASE_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.base";
    private static String DIRECTORY_UPLOAD_PARAM_CONFIG_KEY = "coastal-hazards.files.directory.upload";

    @Override
    public void init() throws ServletException {
        super.init();
        props = JNDISingleton.getInstance();
        uploadDirectory = props.getProperty(DIRECTORY_BASE_PARAM_CONFIG_KEY) + props.getProperty(DIRECTORY_UPLOAD_PARAM_CONFIG_KEY);
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String fileToken = request.getParameter("file-token");
        File fileDirectoryHandle = new File(new File(uploadDirectory), fileToken);
        File shapeFile = null;
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
        
        
    }

    private static File createWPSReceiveFilesXML(final File uploadedFile, final String wfsEndpoint) throws IOException {

        File wpsRequestFile = null;
        FileOutputStream wpsRequestOutputStream = null;
        FileInputStream uploadedInputStream = null;

        try {
            wpsRequestFile = File.createTempFile("wps.upload.", ".xml");
            wpsRequestOutputStream = new FileOutputStream(wpsRequestFile);
            uploadedInputStream = new FileInputStream(uploadedFile);

            wpsRequestOutputStream.write(new String(
                    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                    + "<wps:Execute service=\"WPS\" version=\"1.0.0\" "
                    + "xmlns:wps=\"http://www.opengis.net/wps/1.0.0\" "
                    + "xmlns:ows=\"http://www.opengis.net/ows/1.1\" "
                    + "xmlns:xlink=\"http://www.w3.org/1999/xlink\" "
                    + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
                    + "xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 "
                    + "http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd\">"
                    + "<ows:Identifier>gov.usgs.cida.gdp.wps.algorithm.filemanagement.ReceiveFiles</ows:Identifier>"
                    + "<wps:DataInputs>"
                    + "<wps:Input>"
                    + "<ows:Identifier>filename</ows:Identifier>"
                    + "<wps:Data>"
                    + "<wps:LiteralData>"
                    + StringEscapeUtils.escapeXml(uploadedFile.getName().replace(".zip", ""))
                    + "</wps:LiteralData>"
                    + "</wps:Data>"
                    + "</wps:Input>"
                    + "<wps:Input>"
                    + "<ows:Identifier>wfs-url</ows:Identifier>"
                    + "<wps:Data>"
                    + "<wps:LiteralData>"
                    + StringEscapeUtils.escapeXml(wfsEndpoint)
                    + "</wps:LiteralData>"
                    + "</wps:Data>"
                    + "</wps:Input>"
                    + "<wps:Input>"
                    + "<ows:Identifier>file</ows:Identifier>"
                    + "<wps:Data>"
                    + "<wps:ComplexData mimeType=\"application/x-zipped-shp\" encoding=\"Base64\">").getBytes());
            IOUtils.copy(uploadedInputStream, new Base64OutputStream(wpsRequestOutputStream, true, 0, null));
            wpsRequestOutputStream.write(new String(
                    "</wps:ComplexData>"
                    + "</wps:Data>"
                    + "</wps:Input>"
                    + "</wps:DataInputs>"
                    + "<wps:ResponseForm>"
                    + "<wps:ResponseDocument>"
                    + "<wps:Output>"
                    + "<ows:Identifier>result</ows:Identifier>"
                    + "</wps:Output>"
                    + "<wps:Output>"
                    + "<ows:Identifier>wfs-url</ows:Identifier>"
                    + "</wps:Output>"
                    + "<wps:Output>"
                    + "<ows:Identifier>featuretype</ows:Identifier>"
                    + "</wps:Output>"
                    + "</wps:ResponseDocument>"
                    + "</wps:ResponseForm>"
                    + "</wps:Execute>").getBytes());
        } finally {
            IOUtils.closeQuietly(wpsRequestOutputStream);
            IOUtils.closeQuietly(uploadedInputStream);
        }
        return wpsRequestFile;
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
