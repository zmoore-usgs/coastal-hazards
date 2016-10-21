package gov.usgs.cida.coastalhazards.rest.data;

import java.io.IOException;
import java.nio.file.Files;
import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path(DataURI.TEMP_FILE_PATH)
@PermitAll
public class TempFileResource {

	private static final Logger LOG = LoggerFactory.getLogger(TempFileResource.class);
        private static final String TEMP_FILE_SUBDIRECTORY_PATH = "cch-temp";
        private static java.nio.file.Path TEMP_FILE_SUBDIRECTORY;
        static {
            try {
                TEMP_FILE_SUBDIRECTORY = Files.createTempDirectory(TEMP_FILE_SUBDIRECTORY_PATH);
            } catch (IOException ex) {
                throw new RuntimeException(ex);
            }
        }
	@GET
	@Path("/")
        @Produces(MediaType.APPLICATION_OCTET_STREAM)
	public Response getTempFile(@PathParam("id") String id) throws IOException {
		//stream out the file
                //http://stackoverflow.com/questions/29637151/jersey-streamingoutput-as-response-entity
                return null;
	}
        public java.nio.file.Path getTempFileSubdirectory(){
            return TEMP_FILE_SUBDIRECTORY;
        }
}
