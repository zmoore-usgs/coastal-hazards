package gov.usgs.cida.coastalhazards.wps;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
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
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 *
 * @author cschroed
 */
public class UnzipProcessTest {
    
    private UnzipProcess instance;
    private static final String TEST_TOKEN = "ASDFQWER";
    private Path tempDir; 
    
    @Before
    public void setUp() throws IOException {
        instance = new UnzipProcess();
        Map<String, String> kvp = new HashMap<>();
        kvp.put(UnzipProcess.TOKEN_PROPERTY_NAME, TEST_TOKEN);
        tempDir = Files.createTempDirectory("temp");
        kvp.put(UnzipProcess.UNZIP_BASE_PROPERTY_NAME, tempDir.toAbsolutePath().toString());
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
     * Test of execute method, of class UnzipProcess.
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
     * Test of execute method, of class UnzipProcess.
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
     * Test of getZipFromUrl method, of class UnzipProcess.
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
     * Test of getZipFromUrl method, of class UnzipProcess.
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
     * Convenience method for returning a sorted list of absolute paths, built from a shared base and several relative paths
     * @param zipDestination
     * @param relativePaths
     * @return 
     */
    private List<String> buildExpectedAbsolutePaths(String zipDestination, String ... relativePaths){
        List<String> expectedPaths = new ArrayList<>();
        for(String relativePath : relativePaths){
            expectedPaths.add(zipDestination + File.separator + relativePath);
        }
        Collections.sort(expectedPaths);
        return expectedPaths;
    }
    /**
     * 
     * @param zipFileResourcePath the classLoader.getResource()-style path to a zip file
     * @param expectedRelativePaths The paths that should be found after unzipping
     */
    public void assertZipFileUnzipsToPaths(String zipFileResourcePath, String... expectedRelativePaths){
        InputStream file = this.getClass().getClassLoader().getResourceAsStream(zipFileResourcePath);
        ZipInputStream zipStream = new ZipInputStream(file);
        String zipDestination = instance.getNewZipDestination();
        List<String> expectedPaths = buildExpectedAbsolutePaths(zipDestination, expectedRelativePaths);
        List<String> actualPaths = instance.unzipToDir(zipStream,zipDestination);
        Collections.sort(actualPaths);
        assertEquals(expectedPaths, actualPaths);
    }
    
   
    /**
     * Test of unzipToDir method, of class UnzipProcess.
     */
    @Test
    public void testUnzipSingleFileZipToDir() {       
        assertZipFileUnzipsToPaths(
            "gov/usgs/cida/coastalhazards/wps/oneFile.zip",
            "test.txt"
        );
    }
    
    /**
     * Test of unzipToDir method, of class UnzipProcess.
     */
    @Test
    public void testUnzipTwoFileZipToDir() {       
        assertZipFileUnzipsToPaths(
            "gov/usgs/cida/coastalhazards/wps/twoFiles.zip",
            "test.txt",
            "test2.txt"
        );
    }
    
    /**
     * Test of unzipToDir method, of class UnzipProcess.
     */
    @Test
    public void testUnzipDeepZipFileToDir() {       
        assertZipFileUnzipsToPaths(
            "gov/usgs/cida/coastalhazards/wps/deepDirs.zip",
            "parent/child/grandchild/test3.txt",
            "parent/child/test2.txt",
            "parent/child2/grandchild/test3.txt",
            "parent/child2/test2.txt",
            "parent/test.txt"
        );
    }
    
    @Test(expected = ProcessException.class)
    public void testGetNewZipDestinationWithMissingBase(){
        instance.getNewZipDestination(null);
    }
    
    @Test
    public void testGetNewZipDestination(){
        String zipDestination = instance.getNewZipDestination("asdf");
        assertTrue("path string should be non-empty", 0 < zipDestination.length());
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
