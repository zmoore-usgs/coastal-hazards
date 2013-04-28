package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.coastalhazards.session.io.SessionFileIO;
import gov.usgs.cida.coastalhazards.session.io.SessionIO;
import gov.usgs.cida.coastalhazards.session.io.SessionIOException;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public class SessionService extends HttpServlet {

	private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(SessionService.class);
	private static final long serialVersionUID = 1L;
	private static DynamicReadOnlyProperties props = null;
	private String fileRepoLocation = null;

	@Override
	public void init() throws ServletException {
		super.init();
		props = JNDISingleton.getInstance();
		fileRepoLocation = props.getProperty("", FileUtils.getTempDirectoryPath());
	}

	/**
	 * Processes requests for both HTTP
	 * <code>GET</code> and
	 * <code>POST</code> methods.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	protected void processRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String action = request.getParameter("action");
		Map<String, String> responseMap = new HashMap<String, String>();
		if (StringUtils.isNotBlank(action)) {
			if (action.toLowerCase().equals("write")) {
				saveSession(request, responseMap, response);
				RequestResponseHelper.sendSuccessResponse(response, responseMap);
			} else if (action.toLowerCase().equals("read")) {
				loadSession(request, responseMap, response);
				RequestResponseHelper.sendSuccessResponse(response, responseMap);
			}
		} else {
			responseMap.put("message", "parameter 'action' may not be missing or blank");
			RequestResponseHelper.sendErrorResponse(response, responseMap);
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

	protected void saveSession(HttpServletRequest request, Map<String, String> responseMap, HttpServletResponse response) {
		String session = request.getParameter("session");
		if (StringUtils.isBlank(session)) {
			responseMap.put("message", "parameter 'session' may not be missing or blank");
			RequestResponseHelper.sendErrorResponse(response, responseMap);
		} else {
			SessionIO sessionIo = new SessionFileIO(new File(this.fileRepoLocation).toURI());
			String id = null;
			try {
				id = sessionIo.save(session);
			} catch (SessionIOException ex) {
				responseMap.put("message", ex.getMessage());
				RequestResponseHelper.sendErrorResponse(response, responseMap);
			}
			responseMap.put("sid", id);
			RequestResponseHelper.sendSuccessResponse(response, responseMap);
		}
	}

	protected void loadSession(HttpServletRequest request, Map<String, String> responseMap, HttpServletResponse response) {
		String sessionId = request.getParameter("sid");
		if (StringUtils.isBlank(sessionId)) {
			responseMap.put("message", "parameter 'id' may not be missing or blank");
			RequestResponseHelper.sendErrorResponse(response, responseMap);
		} else {
			SessionIO sessionIo = new SessionFileIO(new File(this.fileRepoLocation).toURI());
			String session = null;
			try {
				session = sessionIo.load(sessionId);
			} catch (SessionIOException ex) {
				responseMap.put("message", ex.getMessage());
				RequestResponseHelper.sendErrorResponse(response, responseMap);
			}
			responseMap.put("session", session);
			RequestResponseHelper.sendSuccessResponse(response, responseMap);
		}
	}
}
