package gov.usgs.cida.coastalhazards.login;

import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author isuftin
 */
@Path("/session")
public class SessionResource {

	@GET
	@Path("/")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSession(@Context HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		Map<String, String> responseMap = new HashMap<String, String>();
		Response response;
		if (session == null || session.getAttribute("oid-info") == null) {
			response = Response.status(Response.Status.NOT_FOUND).build();
		} else {
			Map<String, String> oidInfoMap = (Map<String, String>) session.getAttribute("oid-info");
			responseMap.put("firstname", (String) oidInfoMap.get("oid-firstname"));
			responseMap.put("lastname", (String) oidInfoMap.get("oid-lastname"));
			responseMap.put("country", (String) oidInfoMap.get("oid-country"));
			responseMap.put("language", (String) oidInfoMap.get("oid-language"));
			responseMap.put("email", (String) oidInfoMap.get("oid-email"));
			response = Response.ok(new Gson().toJson(responseMap), MediaType.APPLICATION_JSON_TYPE).build();
		}
		return response;
	}
}
