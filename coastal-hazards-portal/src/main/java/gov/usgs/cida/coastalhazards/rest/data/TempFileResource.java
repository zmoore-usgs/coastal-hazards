package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.simplehash.SimpleHash;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import org.apache.commons.io.FileUtils;
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
                TEMP_FILE_SUBDIRECTORY = Files.createTempDirectory(TEMP_FILE_SUBDIRECTORY_PATH);  //#TODO# make this a stable location rather than creating a new subdir every time
               // File tempDirectory = FileUtils.getTempDirectory();
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getTempFile(@PathParam("id") String id) throws IOException {
        
        LOG.info("GetTempFile...Looking for File with ID: " + id);
        String realFileName = getFileNameForId(id);
        File realFile = new File(getTempFileSubdirectory(), realFileName);

        LOG.info("_____getTempFile ---searching for file id " + id + " with real file name: " + realFileName + " in the temp dir: " + getTempFileSubdirectory().getAbsolutePath());
        
        if (realFile.isFile())
            LOG.info("Temp file is a File.");
        if (realFile.isDirectory())
            LOG.info("Temp file is a Directory.");

        return Response.ok(new FeedReturnStreamingOutput(new FileInputStream(realFile))).build();
    }

    // Jersey class used to return a output stream
    public class FeedReturnStreamingOutput implements StreamingOutput {
        FileInputStream stream;
        byte[] buffer = new byte[2048];
        
        public FeedReturnStreamingOutput(FileInputStream stream) {
            this.stream = stream;
        }
        @Override
        public void write(OutputStream output)
                throws IOException, WebApplicationException {
                int len = 0;
                
                try{
                    while ((len = stream.read(buffer)) > 0) {  // determine the correct amount of the buffer for the prod server memory capacity
                        output.write(buffer, 0, len);
                    }
                } catch(IOException e) {
                	LOG.error("Issue streaming output", e);
                } finally {
                    // found this that output is not closed here http://stackoverflow.com/questions/39572872/closing-jax-rs-streamingoutputs-outputstream
                    // going to close file stream though
                    if (stream != null) {
                        stream.close();
                    }
                }
          
        }
        
        
    }

    /**
     *
     * @return the subdirectory in which this service will search for files
     */
    public static File getTempFileSubdirectory() {
        String fileDir = TEMP_FILE_SUBDIRECTORY.toFile().toString();
        LOG.info("getTempFileSubdirectory: " + fileDir);
        return (TEMP_FILE_SUBDIRECTORY).toFile();
    }

    /**
     * Given a user-specified id, hash it. This permits users to request any
     * path, including would-be unsafe paths like "../../conf/context.xml". Due
     * to the hex encoding, the hash's destination encoding will always be legal
     * file chars that don't attempt to leave the directory.
     *
     * @param id the client-facing identifier for the file
     * @return the real file name
     */
    public static String getFileNameForId(String id) {
        return SimpleHash.hash(id, "SHA-1");
    }
}
