package gov.usgs.cida.coastalhazards.rest;

import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.PathParam;
import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

/**
 * REST Web Service
 *
 * @author jordan
 */
@Path("cards")
public class CardResource {

    /**
     * Retrieves representation of an instance of gov.usgs.cida.coastalhazards.rest.TestResource
     * @return an instance of java.lang.String
     */
    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getCard(@PathParam("{id}") String id) {
        return "hi";
    }
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String searchCards(
            @DefaultValue("popularity") @QueryParam("sortBy") String sortBy,
            @DefaultValue("10") @QueryParam("count") int count,
            @DefaultValue("") @QueryParam("bbox") String bbox
            ) {
        // hook this up to the database and do the search
        // since it is the same database as csw, we can use those
        // tables if we like (probably shouldn't)
        return null;
    }
}
