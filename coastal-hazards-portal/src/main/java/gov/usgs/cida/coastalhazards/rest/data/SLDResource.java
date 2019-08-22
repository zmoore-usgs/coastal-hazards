package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.sld.SLDGenerator;
import gov.usgs.cida.utilities.PerformanceProfiler;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path(DataURI.SLD_PATH)
public class SLDResource {
	private static transient final Logger LOG = LoggerFactory.getLogger(SLDResource.class);
	/**
	 * XML representation of the SLD document related to a specific item ;qs=1
	 * is required to make this the default response when no accepts header is
	 * given
	 *
	 * @param id item ID
	 * @param ribbon which ribbon to represent (not required)
	 * @return response with SLD XML representation
	 */
	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_XML + ";qs=1")
	public Response getSLD(@PathParam("id") String id, @QueryParam("ribbon") Integer ribbon, @QueryParam("selectedItem") String selectedId) {
		PerformanceProfiler.startTimer("SLDResource.getSLD - " + id);
		Response response = null;

		try (ItemManager manager = new ItemManager()) {
		    if(selectedId == null || selectedId.length() == 0){
			selectedId = id;
		    }
		    
		    PerformanceProfiler.startTimer("SLDResource.getSLD_ItemManager.load - " + id);
		    Item item = manager.load(id);
		    PerformanceProfiler.stopDebug("SLDResource.getSLD_ItemManager.load - " + id);

		    if (item == null) {
			    response = Response.status(Response.Status.NOT_FOUND).build();
		    }
		    
		    else {
			PerformanceProfiler.startTimer("SLDResource.getSLD_getGenerator - " + id);
			SLDGenerator generator = SLDGenerator.getGenerator(item, selectedId, ribbon);
			PerformanceProfiler.stopDebug("SLDResource.getSLD_getGenerator - " + id);
			if (generator != null) {
			    PerformanceProfiler.startTimer("SLDResource.getSLD_generateSLD - " + id);
			    response = generator.generateSLD();
			    PerformanceProfiler.stopDebug("SLDResource.getSLD_generateSLD - " + id);
			}
		    }
		} catch(Exception e){
			LOG.error("Error while getting SLD.", e);
			response = Response.status(500).build();
		}
		PerformanceProfiler.stopDebug("SLDResource.getSLD - " + id);
		return response;
	}

	/**
	 * JSON representation of the contents of the SLD, this is primarily for
	 * building a UI legend ;qs=0 is to make this a lower priority than the xml
	 * document, must say accepts=application/json to get this document
	 *
	 * @param id item ID
	 * @param ribbon Not used currently, but represents which ribbon to
	 * represent
	 * @return JSON document with SLD info
	 */
	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON + ";qs=0")
	public Response getSLDInfo(@PathParam("id") String id, @QueryParam("ribbon") Integer ribbon, @QueryParam("selectedItem") String selectedId) {
	    PerformanceProfiler.startTimer("SLDResource.getSLDInfo - " + id);
	    Response response;

	    try (ItemManager manager = new ItemManager()) {
		if(selectedId == null || selectedId.length() == 0){
		    selectedId = id;
		}
		
		PerformanceProfiler.startTimer("SLDResource.getSLD_ItemManager.load - " + id);
		Item item = manager.load(id);
		PerformanceProfiler.stopDebug("SLDResource.getSLD_ItemManager.load - " + id);

		if (item == null) {
			response = Response.status(Response.Status.NOT_FOUND).build();
		}
		else {
			PerformanceProfiler.startTimer("SLDResource.getSLDInfo_getGenerator - " + id);
			SLDGenerator generator = SLDGenerator.getGenerator(item, selectedId, ribbon);
			PerformanceProfiler.stopDebug("SLDResource.getSLDInfo_getGenerator - " + id);
			if (generator == null) {
			    response = Response.status(Response.Status.NOT_FOUND).build();
			}
			else {
			    PerformanceProfiler.startTimer("SLDResource.getSLDInfo_generateSLDInfo - " + id);
			    response = generator.generateSLDInfo();
			    PerformanceProfiler.stopDebug("SLDResource.getSLDInfo_generateSLDInfo - " + id);
			}
		}
	    } catch(Exception e){
		LOG.error("Error while getting SLD info", e);
		response = Response.status(500).build();
	    }
	    PerformanceProfiler.stopDebug("SLDResource.getSLDInfo - " + id);
	    return response;
	}
}
