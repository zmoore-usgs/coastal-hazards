package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.simplehash.SimpleHash;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.util.Date;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
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
        //first get the contents out of the zip file using streams 
        
        if (realFile.isFile())
            LOG.info("Temp file is a File.");
        if (realFile.isDirectory())
            LOG.info("Temp file is a Directory.");

//stream out the file
        //http://stackoverflow.com/questions/29637151/jersey-streamingoutput-as-response-entity
        //http://stackoverflow.com/questions/12012724/example-of-using-streamingoutput-as-response-entity-in-jersey //or this one !
        //http://stackoverflow.com/questions/23869228/how-to-read-file-from-zip-using-inputstream
        //return Response.ok(new FeedReturnStreamingOutput()).build();
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
          
                } finally {
                    // we must always close the output file
                    if (output != null) {
                        output.close();
                    }
                }
          
        }
    }

    private OutputStream getZipContents(File realFile) throws FileNotFoundException, IOException {
        OutputStream result = null;

        // create a buffer to improve copy performance later.
        byte[] buffer = new byte[2048];

        // open the zip file stream
        InputStream theFile = new FileInputStream(realFile);
        ZipInputStream stream = new ZipInputStream(theFile);
        String outdir = getTempFileSubdirectory().getPath(); //args[1];

        try {

            // now iterate through each item in the stream. The get next
            // entry call will return a ZipEntry for each file in the
            // stream
            ZipEntry entry;
            while ((entry = stream.getNextEntry()) != null) {
                String s = String.format("Entry: %s len %d added %TD",
                        entry.getName(), entry.getSize(),
                        new Date(entry.getTime()));
                System.out.println(s);

                // Once we get the entry from the stream, the stream is
                // positioned read to read the raw data, and we keep
                // reading until read returns 0 or less.
                String outpath = outdir + "/" + entry.getName();
                FileOutputStream output = null;
                try {
                    output = new FileOutputStream(outpath);
                    int len = 0;
                    while ((len = stream.read(buffer)) > 0) {
                        output.write(buffer, 0, len);  // call the Jersey helper class here
                    }
                } finally {
                    // we must always close the output file
                    if (output != null) {
                        output.close();
                    }
                }
            }
        } finally {
            // we must always close the zip file.
            stream.close();
        }

        return result;
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
