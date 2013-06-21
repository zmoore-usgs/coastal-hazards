package gov.usgs.cida.coastalhazards.login;

import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 *
 * @author isuftin
 */
public class SessionService extends HttpServlet {

	protected void processRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String action = request.getParameter("action");
		
		Map<String, String> responseMap = new HashMap<String, String>();
		
		if ("logout".equals(action.trim().toLowerCase())) {
			HttpSession session = request.getSession(false);
			if (session != null) {
				try {
					session.invalidate();
					Cookie cookie = new Cookie("JSESSIONID", null);
					cookie.setPath(request.getContextPath());
					cookie.setMaxAge(0);
					response.addCookie(cookie);
				} catch (IllegalStateException ex) {
					// Session was already invalidated
				}
			}
		} else if ("get-oid-info".equals(action.trim().toLowerCase())) {
			HttpSession session = request.getSession(false);
			if (session == null || session.getAttribute("oid-info") == null) {
				responseMap.put("error", "OpenID credentials not in session.");
				RequestResponseHelper.sendErrorResponse(response, responseMap);
				return;
			} else {
				Map<String, String> oidInfoMap = (Map<String, String>) session.getAttribute("oid-info");
				responseMap.put("firstname", (String) oidInfoMap.get("oid-firstname"));
				responseMap.put("lastname", (String) oidInfoMap.get("oid-lastname"));
				responseMap.put("country", (String) oidInfoMap.get("oid-country"));
				responseMap.put("language", (String) oidInfoMap.get("oid-language"));
				responseMap.put("email", (String) oidInfoMap.get("oid-email"));
			}
		}
		RequestResponseHelper.sendSuccessResponse(response, responseMap);
	}

	// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
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

	@Override
	public String getServletInfo() {
		return "Short description";
	}// </editor-fold>
}
