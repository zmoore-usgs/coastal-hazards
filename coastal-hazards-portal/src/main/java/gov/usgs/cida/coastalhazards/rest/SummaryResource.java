package gov.usgs.cida.coastalhazards.rest;

import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.PathParam;
import javax.ws.rs.Consumes;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;

/**
 * REST Web Service
 *
 * @author jordan
 */
@Path("summaries")
public class SummaryResource {

    @Context
    private UriInfo context;

    /**
     * Creates a new instance of TestResource
     */
    public SummaryResource() {
    }

    /**
     * Retrieves representation of an instance of gov.usgs.cida.coastalhazards.rest.TestResource
     * @return an instance of java.lang.String
     */
    @GET
    @Path("{id}")
    @Produces("text/plain")
    public String getText() {
        return "hi";
    }

    /**
     * PUT method for updating or creating an instance of TestResource
     * @param content representation for the resource
     * @return an HTTP response with content of the updated or created resource.
     */
    @PUT
    @Consumes("text/plain")
    public void putText(String content) {
    }
}
