package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.rest.data.util.StormUtil;
import gov.usgs.cida.coastalhazards.rest.security.CoastalHazardsTokenBasedSecurityFilter;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 *
 * @author zmoore
 */
@Path(DataURI.STORM_PATH)
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class StormResource {
    @RolesAllowed({CoastalHazardsTokenBasedSecurityFilter.CCH_ADMIN_ROLE})
    @POST
    @Path("/track")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response saveStormTrack(String content, @Context HttpServletRequest request) {
        Response response;
        Item stormTrack = StormUtil.saveStormTrack();

        if(stormTrack != null && stormTrack.getId() != null) {
            Map<String, Object> ok = new HashMap<String, Object>() {
				private static final long serialVersionUID = 2398472L;
				{
					put("id", stormTrack.getId());
				}
			};

			response = Response.ok(GsonUtil.getDefault().toJson(ok, HashMap.class), MediaType.APPLICATION_JSON_TYPE).build();
        } else {
            response = Response.status(500).build();
        }

        return response;
    }
}