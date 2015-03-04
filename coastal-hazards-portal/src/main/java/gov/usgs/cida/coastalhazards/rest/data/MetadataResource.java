package gov.usgs.cida.coastalhazards.rest.data;

import com.google.gson.JsonSyntaxException;

import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import gov.usgs.cida.utilities.communication.FormUploadHandler;
import gov.usgs.cida.utilities.string.StringHelper;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URISyntaxException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.annotation.security.PermitAll;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.xml.sax.SAXException;

/**
 *
 * @author isuftin
 */
@Path("/metadata")
@PermitAll //says that all methods, unless otherwise secured, will be allowed by default
public class MetadataResource {
    
	private static final int FILE_UPLOAD_MAX_SIZE = 15728640;
	private static final String FILENAME_PARAM = "qqfile";
	private static File UPLOAD_DIR;

	public MetadataResource() {
		super();
		UPLOAD_DIR = new File(FileUtils.getTempDirectoryPath() + "/metadata-upload");
	}
    
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response acceptMetadata(@Context HttpServletRequest req) throws IOException {
		int maxFileSize = FILE_UPLOAD_MAX_SIZE;
		int fileSize = Integer.parseInt(req.getHeader("Content-Length"));
		File tempFile = File.createTempFile(UUID.randomUUID().toString(), "temp");
		Map<String, String> responseContent = new HashMap<>();
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
		} catch (FileUploadException | IOException ex) {
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
		return Response.ok(GsonUtil.getDefault().toJson(responseContent, HashMap.class), MediaType.APPLICATION_JSON_TYPE).build();

	}

    @GET
	@Path("{fid}")
	@Produces(MediaType.APPLICATION_XML)
	public Response getFileById(@PathParam("fid") String fid) throws IOException {
		File readFile = new File(UPLOAD_DIR, fid);
		Map<String, String> responseContent = new HashMap<>();
		if (!readFile.exists()) {
			return Response.status(Response.Status.NOT_FOUND).build();
		} else if (!readFile.canRead()) {
			responseContent.put("message", "Metadata Not Accessible");
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(responseContent).build();
		} else {
			return Response.ok(IOUtils.toString(new FileInputStream(readFile)), MediaType.APPLICATION_XML_TYPE).build();
		}
	}
    
	@GET
    @Path("/summarize/itemid/{itemid}/attribute/{attr}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getMetadataSummaryByAttribtueUsingItemID(@PathParam("itemid") String itemId,
        @PathParam("attr") String attr) throws URISyntaxException {
        Response response;
        try (ItemManager itemManager = new ItemManager()) {
			Item item = itemManager.load(itemId);
            String jsonSummary = MetadataUtil.getSummaryFromWPS(getMetadataUrl(item), attr);
            Summary summary = GsonUtil.getDefault().fromJson(jsonSummary, Summary.class);
            response = Response.ok(GsonUtil.getDefault().toJson(summary, Summary.class), MediaType.APPLICATION_JSON_TYPE).build();
        } catch (IOException | ParserConfigurationException | SAXException | JsonSyntaxException ex) {
            Map<String,String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            response = Response.serverError().entity(GsonUtil.getDefault().toJson(err, HashMap.class)).build();
        }
        return response;
    }
	
    @GET
    @Path("/summarize/fid/{fid}/attribute/{attr}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getMetadataSummaryByAttribtueUsingFD(@PathParam("fid") String fid,
        @PathParam("attr") String attr) throws URISyntaxException {
        Response response;
        try {
            String jsonSummary = MetadataUtil.getSummaryFromWPS(fid, attr);
            Summary summary = GsonUtil.getDefault().fromJson(jsonSummary, Summary.class);
            response = Response.ok(GsonUtil.getDefault().toJson(summary, Summary.class), MediaType.APPLICATION_JSON_TYPE).build();
        } catch (IOException | ParserConfigurationException | SAXException | JsonSyntaxException ex) {
            Map<String,String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            response = Response.serverError().entity(GsonUtil.getDefault().toJson(err, HashMap.class)).build();
        }
        return response;
    }
    
	private static String getMetadataUrl(Item item) {
        String url = "";
        if (item != null) {
            List<Service> services = item.getServices();
            for (Service service : services) {
                if (service.getType() == Service.ServiceType.csw) {
                    url = service.getEndpoint();
                }
            }
        }
        return url;
    }
	
}
