package gov.usgs.cida.coastalhazards.service;

import com.google.gson.Gson;
import com.google.gson.JsonIOException;
import com.google.gson.stream.JsonReader;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.LoggerFactory;
    
/**
 *
 * @author isuftin
 */
public class PopularityQueueService extends HttpServlet {

	private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(PopularityQueueService.class);
	private static final long serialVersionUID = 1L;
	private static DynamicReadOnlyProperties props = null;

	@Override
	public void init() throws ServletException {
		super.init();
		props = JNDISingleton.getInstance();
	}

	protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String maxRecords = request.getParameter("maxRecords");
		String bbox = request.getParameter("bbox");

		Map<String, String> responseMap = new HashMap<String, String>();
		if (StringUtils.isNotBlank(bbox)) {
            // make bbox to search on
            // not currently supported
        }
        if (StringUtils.isNotBlank(maxRecords)) {
            // only return this many
            // going to give all for now
        }
        
        JsonReader reader = null;
        try {
            reader = new JsonReader(new InputStreamReader(getClass().getClassLoader().getResourceAsStream("hotness.json")));
            responseMap = new Gson().fromJson(reader, responseMap.getClass());
            RequestResponseHelper.sendSuccessResponse(response, responseMap);
        } catch (JsonIOException ex) {
            responseMap.put("message", ex.getMessage());
            RequestResponseHelper.sendErrorResponse(response, responseMap);
        } finally {
            IOUtils.closeQuietly(reader);
        }
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