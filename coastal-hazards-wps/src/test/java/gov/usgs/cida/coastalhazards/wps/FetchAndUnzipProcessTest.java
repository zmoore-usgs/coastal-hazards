package gov.usgs.cida.coastalhazards.wps;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipInputStream;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;
import org.geotools.process.ProcessException;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;
import org.xml.sax.helpers.XMLReaderFactory;

/**
 *
 * @author cschroed
 */
public class FetchAndUnzipProcessTest {
    
    private FetchAndUnzipProcess instance;
    private static final String TEST_TOKEN = "ASDFQWER";
    private Path tempDir; 
    
    @Before
    public void setUp() throws IOException {
        instance = new FetchAndUnzipProcess();
        Map<String, String> kvp = new HashMap<>();
        kvp.put(FetchAndUnzipProcess.TOKEN_PROPERTY_NAME, TEST_TOKEN);
        tempDir = Files.createTempDirectory("temp");
        kvp.put(FetchAndUnzipProcess.UNZIP_BASE_PROPERTY_NAME, tempDir.toAbsolutePath().toString());
        instance.setProperties(new DynamicReadOnlyProperties(kvp));
    }
    
    @After
    public void tearDown() throws IOException { 
        //delete all temp files recursively
        Files.walkFileTree(tempDir, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.delete(file);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                Files.delete(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }
    
    /**
     * Test of execute method, of class FetchAndUnzipProcess.
     */
    @Test
    public void testExecuteWithBadAuth() {
        try{
            instance.execute("http://owi.usgs.gov", TEST_TOKEN + "wrong");
        } catch(ProcessException ex){
            if(!(ex.getCause() instanceof SecurityException)){
                fail("when presented with a bad token, a SecurityException wrapped in a Process Exception should be thrown");
            }
        }
    }
  
    /**
     * Test of execute method, of class FetchAndUnzipProcess.
     */
    @Test
    public void testIsAuthorizedWithBadAuth() {
        try{
            instance.isAuthorized(TEST_TOKEN + "wrong");
        } catch(ProcessException ex){
            if(!(ex.getCause() instanceof SecurityException)){
                fail("when presented with a bad token, a SecurityException wrapped in a Process Exception should be thrown");
            }
        }
    }
    @Test
    public void testIsAuthorizedWithGoodAuth() {
        assertTrue("the correct token should be authorized", instance.isAuthorized(TEST_TOKEN));
    }
    /**
     * Test of getZipFromUrl method, of class FetchAndUnzipProcess.
     */
    @Test
    public void testGetZipFromBadUrl() {
        int[] badCodes = new int[]{ 400, 401, 404, 500, 501};
        for(int badCode : badCodes){
            HttpClient client = mockHttpClient(badCode, null);
            try{
                instance.getZipFromUrl("http://owi.usgs.gov", client);
                fail("Should throw exception on HTTP error");
            } catch (ProcessException ex){
                //do nothing, this is expected
            }
        }
        return; //Exceptions were thrown on all HTTP errors
    }

    /**
     * Test of getZipFromUrl method, of class FetchAndUnzipProcess.
     */
    @Test
    public void testGetZipFromGoodUrls() {
        int[] goodCodes = new int[]{200, 301, 302, 304, 307};
        byte[] empty = new byte[]{};
        for(int goodCode : goodCodes){
            HttpClient client = mockHttpClient(goodCode, new ByteArrayInputStream(empty));
            try{
                ZipInputStream zipStream = instance.getZipFromUrl("http://owi.usgs.gov", client);
                assertNotNull(zipStream);
            } catch (ProcessException ex){
                fail("Should not throw exception on good HTTP status codes");
            }
        }
        return; //No Exceptions were thrown on any HTTP status codes
    }

    /**
     * Test of unzipToDir method, of class FetchAndUnzipProcess.
     */
    @Test
    public void testUnzipSingleFileZipToDir() throws FileNotFoundException, IOException {
        String zipFileResourcePath = "gov/usgs/cida/coastalhazards/wps/oneFile.zip";

        InputStream file = this.getClass().getClassLoader().getResourceAsStream(zipFileResourcePath);
        ZipInputStream zipStream = new ZipInputStream(file);
        File zipDestination = instance.getNewZipDestination();
        File actualFile = instance.unzipToDir(zipStream,zipDestination);
        assertTrue(actualFile.exists());
        assertTrue(actualFile.canRead());
        assertTrue(actualFile.isFile());
        String actualContents = new String(Files.readAllBytes(actualFile.toPath()));
        String expectedContents = "test\n";
        assertEquals(expectedContents, actualContents);
    }
    @Test
    public void testMakeSafeFileName(){
        for(int i = 0; i < 1000; i++){
                String fileName = instance.makeSafeFileName();
                assertTrue("'" + fileName +"' is not a valid XML elment name", isValidXmlElementName(fileName));
        }
    }
        public boolean isValidXmlElementName(String name){
                String xml = "<" + name + "/>";
                boolean valid = false;
                try{
                        XMLReader parser = XMLReaderFactory.createXMLReader();
                        parser.setContentHandler(new DefaultHandler());
                        InputSource source = new InputSource(new ByteArrayInputStream(xml.getBytes()));
                        parser.parse(source);
                        valid = true;
                } catch (Exception e){
                        valid = false;
                }
                return valid;
        }
    @Test(expected = ProcessException.class)
    public void testGetNewZipDestinationWithMissingBase(){
        instance.getNewZipDestination(null);
    }
    
    @Test
    public void testGetNewZipDestination(){
        File zipDestination = instance.getNewZipDestination("asdf");
        assertNotNull(zipDestination);
        assertTrue("path string should be non-empty", 0 < zipDestination.getAbsolutePath().length());
    }
    
    public HttpClient mockHttpClient(int code, InputStream content){
        
        
        StatusLine statusLine = mock(StatusLine.class);
        when(statusLine.getStatusCode()).thenReturn(code);
        
        HttpEntity entity = mock(HttpEntity.class);
        
        try {
            when(entity.getContent()).thenReturn(content);
        } catch (IOException | IllegalStateException ex) {
            throw new RuntimeException(ex);
        }
        
        HttpResponse response = mock(HttpResponse.class);
        when(response.getStatusLine()).thenReturn(statusLine);
        when(response.getEntity()).thenReturn(entity);
        
        HttpClient client = mock(HttpClient.class);
        try {
            when(client.execute(any(HttpUriRequest.class))).thenReturn(response);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
        
        return client;
    }
    
}
