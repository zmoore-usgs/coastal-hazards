/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.xml.model.Bounding;
import gov.usgs.cida.coastalhazards.xml.model.Geodetic;
import gov.usgs.cida.coastalhazards.xml.model.Horizsys;
import gov.usgs.cida.coastalhazards.xml.model.Idinfo;
import gov.usgs.cida.coastalhazards.xml.model.Metadata;
import gov.usgs.cida.coastalhazards.xml.model.Spdom;
import gov.usgs.cida.coastalhazards.xml.model.Spref;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.Date;
import java.util.Scanner;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.Ignore;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.slf4j.LoggerFactory;

public class MetadataUtilTest {

    public MetadataUtilTest() {

    }
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(MetadataUtilTest.class);
    private static File workDir; // place to copy
    private static final String tempDir = System.getProperty("java.io.tmpdir");
    private static String AExml = "ne_AEmeta.xml";
    private static String PAExml = "ne_PAEmeta.xml";
    private static String CRxml = "ne_CRmeta.xml";

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

    }

    @After
    public void tearDown() {
        // FileUtils.listFiles(workDir, null, true).stream().forEach((file) -> {
        //FileUtils.deleteQuietly(file);
        //});
        Collection<File> files = FileUtils.listFiles(workDir, null, true);
        for (File file : files) {
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
        String metadata = null;
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
     * Test of getBoundingBoxFromFgdcMetadataCR method, of class MetadataUtil.
     */
    @Test
    public void testGetBoundingBoxFromFgdcMetadataCR() throws IOException {
        System.out.println("testGetBoundingBoxFromFgdcMetadataPAE");
        // This method tests the parsing that occurs in: Bbox result = MetadataUtil.getBoundingBoxFromFgdcMetadata(metadata); // file is ~40kb
        // spdom is the WGS84 bbox, format for the Bbox is "BOX(%f %f, %f %f)"

        //get the metadata from the test file as a string using this package to locate it ...
        String packageName = this.getClass().getCanonicalName();
        System.out.println("PackageName: " + packageName); //PackageName: gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtilTest
        // this is where the test resource is located - gov.usgs.cida.coastalhazards.rest.data + /ne_AEmeta.xml
        String replaced = packageName.replaceAll("[.]", "/");
        String[] names = replaced.split("/util/MetadataUtilTest");
        String packageNameShort = names[0];
        String testFileFullName = packageNameShort + "/" + CRxml;

        String metadataXml = loadResourceAsString(testFileFullName);

        InputStream in = new ByteArrayInputStream(metadataXml.getBytes("UTF-8"));
        Metadata metadata = null;

        // JAXB will require jaxb-api.jar and jaxb-impl.jar part of java 1.6. Much safer way to interrogate xml and maintain than regex
        try {
            //File file = new File(xmlFile);  // FYI: can also be done via file rather than inputStream
            JAXBContext jaxbContext = JAXBContext.newInstance(Metadata.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            metadata = (Metadata) jaxbUnmarshaller.unmarshal(in);

        } catch (JAXBException e) {
            e.printStackTrace();
        }

        assertNotNull(metadata);
        Idinfo idinfo = metadata.getIdinfo();
        Spdom spdom = idinfo.getSpdom();
        Bounding bounding = spdom.getBounding();

        double minx = bounding.getWestbc();
        double miny = bounding.getSouthbc();
        double maxx = bounding.getEastbc();
        double maxy = bounding.getNorthbc();

        Bbox result = new Bbox();
        result.setBbox(minx, miny, maxx, maxy);

        System.out.println("Parsed Bbox is: " + result.getBbox());

        Bbox expResult = new Bbox();
        expResult.setBbox("BOX(-77.830618 35.344738, -66.813170 46.642941)");

        assertNotNull(result);
        assertTrue(expResult.getBbox().startsWith("BOX(-77.830618 35."));
        assertTrue(expResult.getBbox().equalsIgnoreCase(result.getBbox()));
    }

    /**
     * Test of getBoundingBoxFromFgdcMetadataAE method, of class MetadataUtil.
     */
    @Test

    public void testGetBoundingBoxFromFgdcMetadataAE() throws IOException {
        System.out.println("testGetBoundingBoxFromFgdcMetadataAE");
        // This method tests the parsing that occurs in: Bbox result = MetadataUtil.getBoundingBoxFromFgdcMetadata(metadata); // file is ~40kb
        // spdom is the WGS84 bbox, format for the Bbox is "BOX(%f %f, %f %f)"

        //get the metadata from the test file as a string using this package to locate it ...
        String packageName = this.getClass().getCanonicalName();
        System.out.println("PackageName: " + packageName); //PackageName: gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtilTest
        // this is where the test resource is located - gov.usgs.cida.coastalhazards.rest.data + /ne_AEmeta.xml
        String replaced = packageName.replaceAll("[.]", "/");
        String[] names = replaced.split("/util/MetadataUtilTest");
        String packageNameShort = names[0];
        String testFileFullName = packageNameShort + "/" + AExml;

        String metadataXml = loadResourceAsString(testFileFullName);

        InputStream in = new ByteArrayInputStream(metadataXml.getBytes("UTF-8"));
        Metadata metadata = null;

        // JAXB will require jaxb-api.jar and jaxb-impl.jar part of java 1.6. Much safer way to interrogate xml and maintain than regex
        try {
            //File file = new File(xmlFile);  // FYI: can also be done via file rather than inputStream
            JAXBContext jaxbContext = JAXBContext.newInstance(Metadata.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            metadata = (Metadata) jaxbUnmarshaller.unmarshal(in);

        } catch (JAXBException e) {
            e.printStackTrace();
        }

        assertNotNull(metadata);
        Idinfo idinfo = metadata.getIdinfo();
        Spdom spdom = idinfo.getSpdom();
        Bounding bounding = spdom.getBounding();

        double minx = bounding.getWestbc();
        double miny = bounding.getSouthbc();
        double maxx = bounding.getEastbc();
        double maxy = bounding.getNorthbc();

        Bbox result = new Bbox();
        result.setBbox(minx, miny, maxx, maxy);

        System.out.println("Parsed Bbox is: " + result.getBbox());

        Bbox expResult = new Bbox();
        expResult.setBbox("BOX(-77.830618 35.344738, -66.813170 46.642941)");

        assertNotNull(result);
        assertTrue(expResult.getBbox().startsWith("BOX(-77.830618 35."));
        assertTrue(expResult.getBbox().equalsIgnoreCase(result.getBbox()));
    }

    private String loadResourceAsString(String fileName) throws IOException {
        Scanner scanner = new Scanner(getClass().getClassLoader().getResourceAsStream(fileName));
        String contents = scanner.useDelimiter("\\A").next();
        scanner.close();
        return contents;
    }

    /**
     * Test of getCrsFromFgdcMetadata method, of class MetadataUtil.
     */
 
    @Test
    public void testGetCrsFromFgdcMetadata() throws IOException {
        System.out.println("getCrsFromFgdcMetadata");
        //spref is used to determine hte SRS
       
        System.out.println("testGetBoundingBoxFromFgdcMetadataAE");

        //get the metadata from the test file as a string using this package to locate it ...
        String packageName = this.getClass().getCanonicalName();
        System.out.println("PackageName: " + packageName); //PackageName: gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtilTest
        // this is where the test resource is located - gov.usgs.cida.coastalhazards.rest.data + /ne_AEmeta.xml
        String replaced = packageName.replaceAll("[.]", "/");
        String[] names = replaced.split("/util/MetadataUtilTest");
        String packageNameShort = names[0];
        String testFileFullName = packageNameShort + "/" + CRxml;

        String metadataXml = loadResourceAsString(testFileFullName);

        InputStream in = new ByteArrayInputStream(metadataXml.getBytes("UTF-8"));
        Metadata metadata = null;

        // JAXB will require jaxb-api.jar and jaxb-impl.jar part of java 1.6. Much safer way to interrogate xml and maintain than regex
        try {
            //File file = new File(xmlFile);  // FYI: can also be done via file rather than inputStream
            JAXBContext jaxbContext = JAXBContext.newInstance(Metadata.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            metadata = (Metadata) jaxbUnmarshaller.unmarshal(in);

        } catch (JAXBException e) {
            e.printStackTrace();
        }

        assertNotNull(metadata);
        Spref spref = metadata.getSpref();
        Horizsys horizsys = spref.getHorizsys();
        Geodetic geodetic = horizsys.getGeodetic();

        assertNotNull(geodetic);
        String ellips = geodetic.getEllips();
        String horizdn = geodetic.getHorizdn();
        double denflat = geodetic.getDenflat();
        double semiaxis = geodetic.getSemiaxis();

        String expEllips = "GRS 1980";
        String expHorizdn = "North American Datum 1983";
        double expDenflat = 298.257222101;
        double expSemiaxis = 6378137.0;
        
        assertTrue(expEllips.equalsIgnoreCase(ellips));
        assertTrue(expHorizdn.equalsIgnoreCase(horizdn));
        System.out.println("denflat: " + denflat);
        System.out.println("semiaxis: " + semiaxis);
        
        assertEquals(expDenflat, denflat, expDenflat-denflat);
        assertEquals(expSemiaxis, semiaxis,expSemiaxis-semiaxis);
        
        // part II
        String mapprojn = horizsys.getPlanar().getMapproj().getMapprojn();
        double feast = horizsys.getPlanar().getMapproj().getMapprojp().getFeast();
        double fnorth = horizsys.getPlanar().getMapproj().getMapprojp().getFnorth();
        double latprjo = horizsys.getPlanar().getMapproj().getMapprojp().getLatprjo();
        double longcm = horizsys.getPlanar().getMapproj().getMapprojp().getLongcm();
        double stdparll = horizsys.getPlanar().getMapproj().getMapprojp().getStdparll();
        
        String expMapprojn = "Albers Conical Equal Area";
        double expFeast = 0.0;
        double expFnorth = 0.0;
        double expLatprjo = 23.0;
        double expLongcm = -96.0;
        double expStdparll = 45.5;
        
        assertTrue(expMapprojn.equalsIgnoreCase(mapprojn));
        assertEquals(expFeast, feast,expFeast-feast);
        assertEquals(expFnorth, fnorth, expFnorth-fnorth);
        assertEquals(expLatprjo, latprjo,expLatprjo-latprjo);
        assertEquals(expLongcm, longcm, expLongcm-longcm);
        assertEquals(expStdparll, stdparll,expStdparll-stdparll);
        //CoordinateReferenceSystem expResult = null;
        //CoordinateReferenceSystem result = MetadataUtil.getCrsFromFgdcMetadata(metadata);
        //assertEquals(expResult, result);
       
    }

}
