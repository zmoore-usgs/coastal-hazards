package gov.usgs.cida.coastalhazards.wps;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipInputStream;
import org.apache.http.Header;
import org.apache.http.HeaderIterator;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.ProtocolVersion;
import org.apache.http.StatusLine;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.HttpContext;
import org.geotools.process.ProcessException;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.rules.TemporaryFolder;

/**
 *
 * @author cschroed
 */
public class UnzipProcessTest {
    
    private UnzipProcess instance;
    private static final String TEST_TOKEN = "ASDFQWER";
    private Path tempDir; 

    public UnzipProcessTest() {
        
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() throws IOException {
        instance = new UnzipProcess();
        Map<String, String> kvp = new HashMap<>();
        kvp.put(UnzipProcess.TOKEN_PROPERTY_NAME, TEST_TOKEN);
        tempDir = Files.createTempDirectory("temp");
        kvp.put(UnzipProcess.UNZIP_BASE_NAME, tempDir.toAbsolutePath().toString());
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
    public void testExecute() {
        fail("The test case is a prototype.");
    }

    /**
     * Test of getZipFromUrl method, of class UnzipProcess.
     */
    @Test
    public void testGetZipFromBadUrl() {
        int[] badCodes = new int[]{ 400, 401, 404, 500, 501};
        for(int badCode : badCodes){
            HttpClient client = new MockHttpClient(badCode, null);
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
     * Test of unzipToDir method, of class UnzipProcess.
     */
    @Test
    public void testUnzipToDir() {
        fail("The test case is a prototype.");
    }
    
    class MockHttpClient implements HttpClient {
        int statusCode;
        InputStream content;
        public MockHttpClient(int statusCode, InputStream content){
            this.statusCode = statusCode;
            this.content = content;
        }
        @Override
        public HttpParams getParams() {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public ClientConnectionManager getConnectionManager() {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public HttpResponse execute(HttpUriRequest request) throws IOException, ClientProtocolException {
            return new HttpResponse(){
                @Override
                public StatusLine getStatusLine() {
                    return new StatusLine() {
                        @Override
                        public ProtocolVersion getProtocolVersion() {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }

                        @Override
                        public int getStatusCode() {
                            return statusCode;
                        }

                        @Override
                        public String getReasonPhrase() {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }
                    };
                }

                @Override
                public void setStatusLine(StatusLine statusline) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void setStatusLine(ProtocolVersion ver, int code) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void setStatusLine(ProtocolVersion ver, int code, String reason) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void setStatusCode(int code) throws IllegalStateException {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void setReasonPhrase(String reason) throws IllegalStateException {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public HttpEntity getEntity() {
                    return new HttpEntity(){
                        @Override
                        public boolean isRepeatable() {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }

                        @Override
                        public boolean isChunked() {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }

                        @Override
                        public long getContentLength() {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }

                        @Override
                        public Header getContentType() {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }

                        @Override
                        public Header getContentEncoding() {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }

                        @Override
                        public InputStream getContent() throws IOException, IllegalStateException {
                            return content;
                        }

                        @Override
                        public void writeTo(OutputStream outstream) throws IOException {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }

                        @Override
                        public boolean isStreaming() {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }

                        @Override
                        public void consumeContent() throws IOException {
                            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                        }
                        
                    };
                }

                @Override
                public void setEntity(HttpEntity entity) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public Locale getLocale() {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void setLocale(Locale loc) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public ProtocolVersion getProtocolVersion() {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public boolean containsHeader(String name) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public Header[] getHeaders(String name) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public Header getFirstHeader(String name) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public Header getLastHeader(String name) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public Header[] getAllHeaders() {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void addHeader(Header header) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void addHeader(String name, String value) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void setHeader(Header header) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void setHeader(String name, String value) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void setHeaders(Header[] headers) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void removeHeader(Header header) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void removeHeaders(String name) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public HeaderIterator headerIterator() {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public HeaderIterator headerIterator(String name) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public HttpParams getParams() {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }

                @Override
                public void setParams(HttpParams params) {
                    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
                }
                
            };
        }

        @Override
        public HttpResponse execute(HttpUriRequest request, HttpContext context) throws IOException, ClientProtocolException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public HttpResponse execute(HttpHost target, HttpRequest request) throws IOException, ClientProtocolException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public HttpResponse execute(HttpHost target, HttpRequest request, HttpContext context) throws IOException, ClientProtocolException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public <T> T execute(HttpUriRequest request, ResponseHandler<? extends T> responseHandler) throws IOException, ClientProtocolException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public <T> T execute(HttpUriRequest request, ResponseHandler<? extends T> responseHandler, HttpContext context) throws IOException, ClientProtocolException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public <T> T execute(HttpHost target, HttpRequest request, ResponseHandler<? extends T> responseHandler) throws IOException, ClientProtocolException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public <T> T execute(HttpHost target, HttpRequest request, ResponseHandler<? extends T> responseHandler, HttpContext context) throws IOException, ClientProtocolException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }
        
    }
}
