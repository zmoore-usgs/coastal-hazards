package gov.usgs.cida.utilities;

import java.util.Date;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class HTTPCachingUtil {

	public static Response checkModified(Request request, Cacheable cacheableEntity) {
		return checkModified(request, cacheableEntity.getLastModified());
	}

	public static Response checkModified(Request request, Date modifiedDate) {
		Response response = null;
		ResponseBuilder preconditions = request.evaluatePreconditions(modifiedDate);
		if (preconditions != null) {
			response = preconditions.build();
		}
		return response;
	}

}
