package gov.usgs.cida.coastalhazards.rest.data;

import com.sun.jersey.api.NotFoundException;
import com.sun.jersey.api.ParamException;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.utilities.QRCodeGenerator;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

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
	static private final String BASE_URL = JNDISingleton.getInstance().getProperty("coastal-hazards.public.url",
			"http://marine.usgs.gov/coastalchangehazardsportal");

	/**
	 * Produces a QR code that directs to back of card for a given item ID
	 *
	 * @param id
	 * @param width
	 * @param height
	 * @return
	 */
	@GET
	@Path("info/item/{id}")
	@Produces("image/png")
	public Response generateQRImageUsingItemID(@PathParam("id") String id, @QueryParam("width") int width, @QueryParam("height") int height) throws IOException {
		URL url;
		String urlString = "ui/info/item/" + id;
		Response response;
		QRCodeGenerator qrcr = new QRCodeGenerator();

		// Make sure the item exists in the database
		try (ItemManager itemManager = new ItemManager()) {
			Item item = itemManager.load(id);
			if (item == null) {
				throw new NotFoundException();
			}
		}

		// Check if the base URL doesn't contain a trailing slash. If not, attach one to the beginning of url string
		if (BASE_URL.charAt(BASE_URL.length() - 1) != '/') {
			urlString = "/" + urlString;
		}

		// Create the URL string
		urlString = BASE_URL + urlString;

		try {
			url = new URL(urlString);
			qrcr.setUrl(url);
		} catch (MalformedURLException | URISyntaxException ex) {
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

		try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
			qrcr.writeToOutputStream(baos);
			baos.flush();
			response = Response.ok(baos.toByteArray(), "image/png").build();
		}

		return response;
	}
}
