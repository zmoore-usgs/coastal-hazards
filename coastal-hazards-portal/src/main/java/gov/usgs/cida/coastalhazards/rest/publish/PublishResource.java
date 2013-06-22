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
	public Response publishEntryRouter(@Context HttpServletRequest req) throws IOException, URISyntaxException {
		HttpSession session = req.getSession(false);
		if (session == null || session.getAttribute("oid-info") == null) {
			return Response.temporaryRedirect(new URI("../components/OpenID/oid-login.jsp")).build();
		} 
		
		Map<String, String> oidInfoMap = ((Map<String, String>) session.getAttribute("oid-info"));
		String email = oidInfoMap.get("oid-email");
		if (StringUtils.isEmpty(email)) {
			return Response.temporaryRedirect(new URI("../components/OpenID/oid-login.jsp")).build();
		}
		return Response.temporaryRedirect(new URI("../components/publish/")).build();
	}
	
}
