package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.Gson;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.communication.FormUploadHandler;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import gov.usgs.cida.utilities.string.StringHelper;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author isuftin
 */
@Path("metadata")
public class MetadataResource {

	private static int FILE_UPLOAD_MAX_SIZE = 15728640;
	private static String FILENAME_PARAM = "qqfile";
	private static DynamicReadOnlyProperties props = null;
	private static File UPLOAD_DIR;

	public MetadataResource() {
		super();
		props = JNDISingleton.getInstance();
		UPLOAD_DIR = new File(FileUtils.getTempDirectoryPath() + "/metadata-upload");
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response acceptMetadata(@Context HttpServletRequest req) throws IOException {
		int maxFileSize = FILE_UPLOAD_MAX_SIZE;
		int fileSize = Integer.parseInt(req.getHeader("Content-Length"));
		File tempFile = File.createTempFile(UUID.randomUUID().toString(), "temp");
		Map<String, String> responseContent = new HashMap<String, String>();
		String fileName;

		if (maxFileSize > 0 && fileSize > maxFileSize) {
			responseContent.put("message", "File too large");
			responseContent.put("success", "false");
			return Response.notAcceptable(null).entity(responseContent).build();
		}

		try {
			FileUtils.forceMkdir(UPLOAD_DIR);
		} catch (IOException ex) {
			return Response.serverError().build();
		}

		try {
			FormUploadHandler.saveFileFromRequest(req, FILENAME_PARAM, tempFile);
		} catch (FileUploadException ex) {
			responseContent.put("message", ex.getMessage());
			responseContent.put("success", "false");
			return Response.serverError().entity(responseContent).build();
		} catch (IOException ex) {
			responseContent.put("message", ex.getMessage());
			responseContent.put("success", "false");
			return Response.serverError().entity(responseContent).build();
		}

		try {
			fileName = StringHelper.makeSHA1Hash(IOUtils.toString(new FileInputStream(tempFile)));
		} catch (NoSuchAlgorithmException ex) {
			responseContent.put("message", ex.getMessage());
			responseContent.put("success", "false");
			return Response.serverError().entity(responseContent).build();
		}

		File savedFile = new File(UPLOAD_DIR, fileName);
		if (savedFile.exists()) {
			responseContent.put("fid", fileName);
		} else {
			FileUtils.moveFile(tempFile, savedFile);
			responseContent.put("fid", fileName);
		}
		responseContent.put("success", "true");
		return Response.ok(new Gson().toJson(responseContent, HashMap.class), MediaType.APPLICATION_JSON_TYPE).build();

	}

	@GET
	@Path("{fid}")
	@Produces(MediaType.APPLICATION_XML)
	public Response getFileById(@PathParam("fid") String fid) throws IOException {
		File readFile = new File(UPLOAD_DIR, fid);
		Map<String, String> responseContent = new HashMap<String, String>();
		if (!readFile.exists()) {
			return Response.status(Response.Status.NOT_FOUND).build();
		} else if (!readFile.canRead()) {
			responseContent.put("message", "Metadata Not Accessible");
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(responseContent).build();
		} else {
			return Response.ok(IOUtils.toString(new FileInputStream(readFile)), MediaType.APPLICATION_XML_TYPE).build();
		}
	}
}
