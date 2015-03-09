package gov.usgs.cida.coastalhazards.rest.security;

import java.net.URISyntaxException;
import java.util.HashMap;

import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.server.mvc.Viewable;

@Path("auth")
public class SecurityResources {
    /**
     * This is a dummy endpoint used to check the authorization status user
     * @param req
     * @return
     * @throws URISyntaxException
     */
    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("check")
    @RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
    public Response checkLogin(@Context HttpServletRequest req) throws URISyntaxException {
       return Response.ok("session is authorized").build();
    }
    
    /**
     * Login page
     * @param req
     * @return
     * @throws URISyntaxException
     */
    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("login")
    public Response loginPage(@Context HttpServletRequest req) throws URISyntaxException {
        return Response.ok(new Viewable("/WEB-INF/jsp/login.jsp", new HashMap<>())).build();
    }

}
