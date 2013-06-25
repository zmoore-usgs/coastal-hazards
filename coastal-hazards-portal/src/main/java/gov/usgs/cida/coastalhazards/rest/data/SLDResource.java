package gov.usgs.cida.coastalhazards.rest.data;

import com.sun.jersey.api.view.Viewable;
import java.awt.Color;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("sld")
public class SLDResource {

	@GET
	@Path("redwhite/{id}/{attr}")
	@Produces(MediaType.APPLICATION_XML)
	public Response getRedWhiteSLD(
			@PathParam("id") String id,
			@PathParam("attr") String attr) {

        RedWhiteParams sldParams = new RedWhiteParams();
        
		float[] thresholds = makeSteps(0.0f, 100.1f, sldParams.getNUMBER_OF_BINS() + 1);
		String[] colors = makeColors("#FFFFFF", "#FF0000", sldParams.getNUMBER_OF_BINS());
        
		sldParams.setId(id);
        sldParams.setAttr(attr);
        sldParams.setThresholds(thresholds);
        sldParams.setColors(colors);
        
		return Response.ok(new Viewable("/redwhite.jsp", sldParams)).build();
	}

	protected static float[] makeSteps(float start, float end, int count) {
		float[] steps = new float[count];
		if (count < 2) {
			throw new IllegalArgumentException("Count must be 2 or more");
		}
		// range is negative if end < start
		float range = end - start;
		float stepSize = range / (count - 1);
		for (int i = 0; i < count; i++) {
			steps[i] = start + (stepSize * i);
		}
		return steps;
	}

	protected static String[] makeColors(String hexStart, String hexEnd, int count) {
		String[] result = new String[count];
		Color startColor = Color.decode(hexStart);
		Color endColor = Color.decode(hexEnd);
		float[] reds = makeSteps((float) startColor.getRed(), (float) endColor.getRed(), count);
		float[] greens = makeSteps((float) startColor.getGreen(), (float) endColor.getGreen(), count);
		float[] blues = makeSteps((float) startColor.getBlue(), (float) endColor.getBlue(), count);
		for (int i = 0; i < count; i++) {
			int rgb = (int) blues[i] | ((int) greens[i] << 8) | ((int) reds[i] << 16);
			String gradient = String.format("#%06X", (0xFFFFFF & rgb));
			result[i] = gradient;
		}
		return result;
	}
}
