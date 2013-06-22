package gov.usgs.cida.coastalhazards.rest.publish;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.commons.lang.StringUtils;

/**
 *
 * @author isuftin
 */
@Path("/")
public class PublishResource {
	@GET
	@Path("")
	@Produces(MediaType.TEXT_HTML)
	public Response publishEntryRouter(@Context HttpServletRequest req, @Context HttpServletResponse res) throws IOException, URISyntaxException {
		HttpSession session = req.getSession(false);
		if (session == null || session.getAttribute("oid-info") == null) {
			return Response.temporaryRedirect(new URI("../components/OpenID/oid-login.jsp")).build();
		} 
		
		Map<String, String> oidInfoMap = ((Map<String, String>) session.getAttribute("oid-info"));
		String email = oidInfoMap.get("oid-email");
		if (StringUtils.isEmpty(email)) {
			return Response.temporaryRedirect(new URI("../components/OpenID/oid-login.jsp")).build();
		}
		
		if (isUserAuthorized(email)) {
			return Response.temporaryRedirect(new URI("../components/publish/index.jsp")).build();
		} else {
			return Response.ok("<html><body>SORRY THATS NOT IT</body></html>").build();
		}
	}
	
	private boolean isUserAuthorized(String email) {
		boolean authorized = false; 
		// TOO: Get this from the database
		return authorized;
	}
	
}
