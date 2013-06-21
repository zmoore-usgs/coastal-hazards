package gov.usgs.cida.coastalhazards.login;

import com.sun.jersey.api.view.Viewable;
import java.net.URI;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

/**
 *
 * @author isuftin
 */
@Path("/")
public class LoginRouter {

	@Context
	private UriInfo uriInfo;
	private final String BASE_PATH = "/components/OpenID/";

	@GET
	@Produces("text/html")
	@Path("/login")
	public Response useJspAtLoginPath() {
		return Response.ok(new Viewable(BASE_PATH + "oid-login.jsp")).build();
	}

	@GET
	@Produces("text/html")
	@Path("/logout")
	public Response useJspAtLogoutPath() {
		return Response.ok(new Viewable(BASE_PATH + "oid-logout.jsp")).build();
	}

	@GET
	@Produces("text/html")
	@Path("/verify")
	public Response useJspAtVerifyPath() {
		return Response.ok(new Viewable(BASE_PATH + "oid-verify.jsp")).build();
	}

	@GET
	@Produces("text/html")
	@Path("/redirect")
	public Response useJspAtRedirectPath() {
		return Response.ok(new Viewable(BASE_PATH + "oid-formredirection.jsp")).build();
	}

	@POST
	@Produces("text/html")
	@Path("/consumer")
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	public Response useLoginConsumer() {
		URI servletPath = uriInfo.getBaseUriBuilder().path("/login-openid-servlet").build();
		return Response.seeOther(servletPath).build();
	}
}
