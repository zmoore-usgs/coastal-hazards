package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.simplehash.SimpleHash;
import java.io.File;
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
                //only need to create one temp subdirectory per class load
                TEMP_FILE_SUBDIRECTORY = Files.createTempDirectory(TEMP_FILE_SUBDIRECTORY_PATH);
            } catch (IOException ex) {
                throw new RuntimeException(ex);
            }
        }
        
	@GET
	@Path("/{id}")
        @Produces(MediaType.APPLICATION_OCTET_STREAM)
	public Response getTempFile(@PathParam("id") String id) throws IOException {
		
                String realFileName = getFileNameForId(id);
                File realFile = new File(getTempFileSubdirectory(), realFileName);
                
                //stream out the file
                //http://stackoverflow.com/questions/29637151/jersey-streamingoutput-as-response-entity
                
                return null;
	}
        /**
         * 
         * @return the subdirectory in which this service will search for files
         */
        public static File getTempFileSubdirectory(){
            return (TEMP_FILE_SUBDIRECTORY).toFile();
        }
        
        /**
         * Given a user-specified id, hash it. This permits users to request any
         * path, including would-be unsafe paths like "../../conf/context.xml".
         * Due to the hex encoding, the hash's destination encoding will always 
         * be legal file chars that don't attempt to leave the directory.
         * @param id the client-facing identifier for the file
         * @return the real file name
         */
        public static String getFileNameForId(String id){
            return SimpleHash.hash(id, "SHA-1");
        }
}
