/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Service;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.Ignore;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

public class MetadataUtilTest {
    
    public MetadataUtilTest() {
        
    }
    private static File workDir; // place to copy
    private static final String tempDir = System.getProperty("java.io.tmpdir");
    private static File AExml;
    private static File PAExml;
    private static File CRxml;   
    
    @BeforeClass
    public static void setUpClass() throws IOException {
		workDir = new File(tempDir, String.valueOf(new Date().getTime()));
		FileUtils.deleteQuietly(workDir);
		FileUtils.forceMkdir(workDir);
    }
    
    @AfterClass
    public static void tearDownClass() {
        FileUtils.deleteQuietly(workDir);
    }
    
    @Before
    public void setUp() throws IOException, URISyntaxException {
        String packagePath = "/";
        FileUtils.copyDirectory(new File(getClass().getResource(packagePath).toURI()), workDir);
	AExml = new File(workDir, "ne_AEmeta.xml");
	PAExml = new File(workDir, "ne_PAEmeta.xml");
	CRxml = new File(workDir, "ne_CREmeta.xml");
    }
    
    @After
    public void tearDown() {
       // FileUtils.listFiles(workDir, null, true).stream().forEach((file) -> {
			//FileUtils.deleteQuietly(file);
		//});
        Collection<File> files= FileUtils.listFiles(workDir, null, true);
        for (File file:files){
            FileUtils.deleteQuietly(file);
        }
    }

    /**
     * Test of doCSWInsertFromUploadId method, of class MetadataUtil.
     */
    @Ignore
    @Test
    public void testDoCSWInsertFromUploadId() throws Exception {
        System.out.println("doCSWInsertFromUploadId");
        String metadataId = "";
        String expResult = "";
        String result = MetadataUtil.doCSWInsertFromUploadId(metadataId);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of doCSWInsertFromString method, of class MetadataUtil.
     */
    @Ignore
    @Test
    public void testDoCSWInsertFromString() throws Exception {
        System.out.println("doCSWInsertFromString");
        String metadata = "";
        String expResult = "";
        String result = MetadataUtil.doCSWInsertFromString(metadata);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of stripXMLProlog method, of class MetadataUtil.
     */
    @Ignore
    @Test
    public void testStripXMLProlog() {
        System.out.println("stripXMLProlog");
        String xml = "";
        String expResult = "";
        String result = MetadataUtil.stripXMLProlog(xml);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of getSummaryFromWPS method, of class MetadataUtil.
     */
    @Ignore
    @Test
    public void testGetSummaryFromWPS() throws Exception {
        System.out.println("getSummaryFromWPS");
        String metadataEndpoint = "";
        String attr = "";
        String expResult = "";
        String result = MetadataUtil.getSummaryFromWPS(metadataEndpoint, attr);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of extractMetadataFromShp method, of class MetadataUtil.
     */
    @Ignore
    @Test
    public void testExtractMetadataFromShp() {
        System.out.println("extractMetadataFromShp");
        InputStream is = null;
        String expResult = "";
        String result = MetadataUtil.extractMetadataFromShp(is);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of getMetadataByIdUrl method, of class MetadataUtil.
     */
    @Ignore
    @Test
    public void testGetMetadataByIdUrl() {
        System.out.println("getMetadataByIdUrl");
        String id = "";
        String expResult = "";
        String result = MetadataUtil.getMetadataByIdUrl(id);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of makeCSWServiceForUrl method, of class MetadataUtil.
     */
    @Ignore
    @Test
    public void testMakeCSWServiceForUrl() {
        System.out.println("makeCSWServiceForUrl");
        String url = "";
        Service expResult = null;
        Service result = MetadataUtil.makeCSWServiceForUrl(url);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of getBoundingBoxFromFgdcMetadata method, of class MetadataUtil.
     */
    @Ignore
    @Test
    public void testGetBoundingBoxFromFgdcMetadata() {
        System.out.println("getBoundingBoxFromFgdcMetadata");
        // spdom is the WGS84 bbox, format for the Bbox is "BOX(%f %f, %f %f)"

        String metadata = AExml.toString(); //should probably stream or use SAX??
        Bbox expResult = null;
        Bbox result = MetadataUtil.getBoundingBoxFromFgdcMetadata(metadata); // file is 40kb
        
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of getCrsFromFgdcMetadata method, of class MetadataUtil.
     */
    @Ignore
    @Test
    public void testGetCrsFromFgdcMetadata() {
        System.out.println("getCrsFromFgdcMetadata");
        //spref is used to determine hte SRS
        String metadata = "";
        CoordinateReferenceSystem expResult = null;
        CoordinateReferenceSystem result = MetadataUtil.getCrsFromFgdcMetadata(metadata);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }
    
}
