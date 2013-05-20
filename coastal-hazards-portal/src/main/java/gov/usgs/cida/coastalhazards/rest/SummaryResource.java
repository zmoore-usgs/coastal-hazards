package gov.usgs.cida.coastalhazards.rest;

import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.PathParam;
import javax.ws.rs.Consumes;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * REST Web Service
 *
 * @author jordan
 */
@Path("summaries")
public class SummaryResource {

    @GET
    @Path("tiny/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getTinySummary(@PathParam("id") String id) {
        // make sure this is only 140 characters
        return null;
    }
    
    @GET
    @Path("medium/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getMediumSummary(@PathParam("id") String id) {
        // this should fit into the card view
        return null;
    }
    
    @GET
    @Path("long/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getLongSummary(@PathParam("id") String id) {
        // this is the full blown summary, we need to come up with a data structure
        // that represents all the different possible views
        return null;
    }
}
