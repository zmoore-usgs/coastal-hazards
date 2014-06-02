package gov.usgs.cida.coastalhazards.rest.data;

import com.sun.jersey.api.ParamException;
import gov.usgs.cida.utilities.QRCodeGenerator;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;
import net.glxn.qrgen.exception.QRGenerationException;

/**
 * Provides a web service that allows generation of a QR code based on a
 * provided URL. Height and width optional. If height and width omitted, height
 * and width will be 125px
 *
 * @author isuftin
 */
@Path("qr")
public class QRCodeResource {

	static private final int MAX_WIDTH = 4096;
	static private final int MAX_HEIGHT = 4096;

	@GET
	@Produces("image/png")
	public Response generateQRImage(@QueryParam("url") String urlString, @QueryParam("width") int width, @QueryParam("height") int height) {
		URL url;
		Response response;
		QRCodeGenerator qrcr = new QRCodeGenerator();
		File result;
		String decodedUrlString;

		// TODO - Check if on development server and proceed. If not on development, make sure that call is coming 
		// from USGS domain.
		// TODO - Use outputstream to send back to client and clean up file after send is complete. This safeguards
		// against QR code request flood and filling up disk. When generating from a file, files are set to delete on exit
		try {
			decodedUrlString = URLDecoder.decode(urlString, StandardCharsets.UTF_8.name());
			url = new URL(decodedUrlString);
			qrcr.setUrl(url);
		} catch (UnsupportedEncodingException | MalformedURLException | URISyntaxException ex) {
			throw new ParamException.QueryParamException(ex, "Invalid Parameter", "Parameter \"url\" could not be parsed properly");
		}

		if (width > 0 && height > 0) {
			if (width > MAX_WIDTH) {
				qrcr.setWidth(MAX_WIDTH);
			} else {
				qrcr.setWidth(width);
			}

			if (height > MAX_HEIGHT) {
				qrcr.setHeight(MAX_HEIGHT);
			} else {
				qrcr.setHeight(height);
			}
		}

		try {
			result = qrcr.generateToFile();
		} catch (IOException ex) {
			throw new QRGenerationException("File could not be created", ex);
		}

		response = Response.ok(result, "image/png").build();
		return response;
	}
}
