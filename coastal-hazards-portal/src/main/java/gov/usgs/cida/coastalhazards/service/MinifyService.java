package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.gov.usa.go.GoUsaGovUtils;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
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
public class MinifyService extends HttpServlet {

	private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(MinifyService.class);
	private static final long serialVersionUID = 1L;
	private static DynamicReadOnlyProperties props = null;

	@Override
	public void init() throws ServletException {
		super.init();
		props = JNDISingleton.getInstance();
	}

	protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String action = request.getParameter("action");
		String url = request.getParameter("url");

		Map<String, String> responseMap = new HashMap<String, String>();
		if (StringUtils.isNotBlank(action)) {
			if (StringUtils.isNotBlank(url)) {
				if (action.toLowerCase().equals("minify")) {
					try {
						responseMap.put("response", GoUsaGovUtils.minify(url));
						RequestResponseHelper.sendSuccessResponse(response, responseMap);
					} catch (URISyntaxException ex) {
						responseMap.put("message", ex.getMessage());
						RequestResponseHelper.sendErrorResponse(response, responseMap);
					}
				} else if (action.toLowerCase().equals("expand")) {
					try {
						responseMap.put("response", GoUsaGovUtils.expand(url));
						RequestResponseHelper.sendSuccessResponse(response, responseMap);
					} catch (URISyntaxException ex) {
						responseMap.put("message", ex.getMessage());
						RequestResponseHelper.sendErrorResponse(response, responseMap);
					}
					RequestResponseHelper.sendSuccessResponse(response, responseMap);
				} else if (action.toLowerCase().equals("clicks")) {
					try {
						responseMap.put("response", GoUsaGovUtils.clicks(url));
						RequestResponseHelper.sendSuccessResponse(response, responseMap);
					} catch (URISyntaxException ex) {
						responseMap.put("message", ex.getMessage());
						RequestResponseHelper.sendErrorResponse(response, responseMap);
					}
				}
			} else {
				responseMap.put("message", "parameter 'url' may not be missing or blank");
				RequestResponseHelper.sendErrorResponse(response, responseMap);
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
}
