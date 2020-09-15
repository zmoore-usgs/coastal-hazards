package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.util.ParsedMetadata;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.coastalhazards.rest.security.ConfiguredRolesAllowed;
import gov.usgs.cida.coastalhazards.rest.security.ConfiguredRolesAllowedDynamicFeature;

import javax.annotation.security.PermitAll;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.httpclient.HttpStatus;
import org.glassfish.jersey.media.multipart.FormDataParam;
/**
 *
 * @author isuftin
 */
@Path(DataURI.METADATA_PATH)
@PermitAll
public class MetadataResource {

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@ConfiguredRolesAllowed(ConfiguredRolesAllowedDynamicFeature.CCH_ADMIN_USER_PROP)
	public Response getMetadata(@Context HttpServletRequest req, @FormDataParam("file") String postBody) {
		Response response;
		ParsedMetadata result = MetadataUtil.parseMetadataXmlFile(postBody);

		if(result != null) {
			response = Response.ok(GsonUtil.getDefault().toJson(result)).build();
		} else {
			response = Response.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).build();
		}

		return response;
	}
}
