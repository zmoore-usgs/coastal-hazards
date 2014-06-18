package gov.usgs.cida.utilities;

import gov.usgs.cida.coastalhazards.rest.data.util.HttpUtil;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class HTTPCachingUtil {

    public static Response checkModified(Request request, Cacheable cacheableEntity) {
        Response response = null;
        ResponseBuilder preconditions = request.evaluatePreconditions(cacheableEntity.getLastModified());
        if (preconditions != null) {
            response = preconditions.build();
        }
        return response;
    }
    
}
