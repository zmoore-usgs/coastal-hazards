package gov.usgs.cida.coastalhazards.oid.session;

import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

/**
 *
 * @author isuftin
 */
@Path("/session")
public class SessionResource {

	public static boolean isValidSession(HttpServletRequest request) {
		boolean valid = false;
		HttpSession session = request.getSession();
		if (session != null) {
			valid = (session.getAttribute("sessionValid") == null) ? false : (Boolean) session.getAttribute("sessionValid");
		}
		return valid;
	}

	@GET
	@Path("/oid")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSession(@Context HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		Map<String, String> responseMap = new HashMap<String, String>();
		Response response;
		if (session == null || session.getAttribute("oid-info") == null) {
			response = Response.status(Response.Status.NOT_FOUND).build();
		} else {
			Map<String, String> oidInfoMap = ((Map<String, String>) session.getAttribute("oid-info"));
			responseMap.put("firstname", oidInfoMap.get("oid-firstname"));
			responseMap.put("lastname", oidInfoMap.get("oid-lastname"));
			responseMap.put("country", oidInfoMap.get("oid-country"));
			responseMap.put("language", oidInfoMap.get("oid-language"));
			responseMap.put("email", oidInfoMap.get("oid-email"));
			response = Response.ok(GsonUtil.getDefault().toJson(responseMap),
                    MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}

	@DELETE
	@Path("/")
	public Response deleteSession(@Context HttpServletRequest request) {
		Response response = Response.ok().build();
		HttpSession session = request.getSession(false);
		if (session != null) {
			try {
				session.invalidate();
				NewCookie cookie = new NewCookie("JSESSIONID", null, request.getContextPath(), null, null, 0, false);
				response = Response.ok().cookie(cookie).build();
			} catch (IllegalStateException ex) {
				response = Response.serverError().build();
			}
		}
		return response;
	}
}
