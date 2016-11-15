/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.metadata.CRSParameters;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.xml.model.Bounding;
import gov.usgs.cida.coastalhazards.xml.model.Horizsys;
import gov.usgs.cida.coastalhazards.xml.model.Idinfo;
import gov.usgs.cida.coastalhazards.xml.model.Metadata;
import gov.usgs.cida.coastalhazards.xml.model.Spdom;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.Date;
import java.util.Scanner;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import org.apache.commons.io.FileUtils;
import org.geotools.referencing.CRS;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.Ignore;
import org.opengis.referencing.FactoryException;
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

        //Spref spref = metadata.getSpref();
        Horizsys horizsys = metadata.getSpref().getHorizsys();

        assertNotNull(horizsys);

        String expEllips = "GRS 1980";
        String expHorizdn = "North American Datum 1983";
        double expDenflat = 298.257222101;
        double expSemiaxis = 6378137.0;

        // part I
        String ellips = horizsys.getGeodetic().getEllips();
        String horizdn = horizsys.getGeodetic().getHorizdn();
        double denflat = horizsys.getGeodetic().getDenflat();
        double semiaxis = horizsys.getGeodetic().getSemiaxis();

        assertTrue(expEllips.equalsIgnoreCase(ellips));
        assertTrue(expHorizdn.equalsIgnoreCase(horizdn));
        assertEquals(expDenflat, denflat, expDenflat - denflat);
        assertEquals(expSemiaxis, semiaxis, expSemiaxis - semiaxis);
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
        double expStdparll = 45.5; // the second of the two children

        assertTrue(expMapprojn.equalsIgnoreCase(mapprojn));
        assertEquals(expFeast, feast, expFeast - feast);
        assertEquals(expFnorth, fnorth, expFnorth - fnorth);
        assertEquals(expLatprjo, latprjo, expLatprjo - latprjo);
        assertEquals(expLongcm, longcm, expLongcm - longcm);
        assertEquals(expStdparll, stdparll, expStdparll - stdparll);
        //CoordinateReferenceSystem expResult = null;
        //CoordinateReferenceSystem result = MetadataUtil.getCrsFromFgdcMetadata(metadata);
        //assertEquals(expResult, result);

    }

    public void testBuildWKt(String ellips, String horizdn, double denflat, double semiaxis) {
        String replaceMe = "REPLACEME";
        final String lineSep = System.getProperty("line.separator", "\n");

        String wktExample = "GEOGCS[" + "\"GRS 1980\"," + "  DATUM[" + "    \"WGS_1984\","
                + "    SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],"
                + "    TOWGS84[0,0,0,0,0,0,0]," + "    AUTHORITY[\"EPSG\",\"6326\"]],"
                + "  PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],"
                + "  UNIT[\"DMSH\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9108\"]],"
                + "  AXIS[\"Lat\",NORTH]," + "  AXIS[\"Long\",EAST],"
                + "  AUTHORITY[\"EPSG\",\"4326\"]]";

        /*    PROJCRS["NAD83 / Conus Albers",
  BASEGEODCRS["NAD83",
    DATUM["North American Datum 1983",
      ELLIPSOID["GRS 1980",6378137,298.257222101,LENGTHUNIT["metre",1.0]]]],
  CONVERSION["Conus Albers",
    METHOD["Albers Equal Area",ID["EPSG",9822]],
    PARAMETER["Latitude of false origin",23,ANGLEUNIT["degree",0.01745329252]],
    PARAMETER["Longitude of false origin",-96,ANGLEUNIT["degree",0.01745329252]],
    PARAMETER["Latitude of 1st standard parallel",29.5,ANGLEUNIT["degree",0.01745329252]],
    PARAMETER["Latitude of 2nd standard parallel",45.5,ANGLEUNIT["degree",0.01745329252]],
    PARAMETER["Easting at false origin",0,LENGTHUNIT["metre",1.0]],
    PARAMETER["Northing at false origin",0,LENGTHUNIT["metre",1.0]]],
  CS[cartesian,2],
    AXIS["easting (X)",east,ORDER[1]],
    AXIS["northing (Y)",north,ORDER[2]],
    LENGTHUNIT["metre",1.0],
  ID["EPSG",5070]] */
        StringBuilder builder = new StringBuilder(500);

        builder.append("GEOGCS[");
        builder.append("\"");  // quote
        builder.append(replaceMe);  //ellips
        builder.append("\"");  // quote
        builder.append(",");   // comma
        builder.append(lineSep);

        builder.append("DATUM[");
        builder.append("\"");  // quote
        builder.append(replaceMe);  //horizdn
        builder.append("\"");  // quote
        builder.append(",");   // comma
        builder.append(lineSep);

        builder.append("SPHEROID[");
        builder.append("\"");  // quote
        builder.append(replaceMe); // WGS 84
        builder.append("\"");  // quote
        builder.append(",");   // comma                
        builder.append(replaceMe); //semiaxis
        builder.append(",");   // comma
        builder.append(replaceMe); //denflat
        builder.append(",");   // comma
        builder.append(lineSep);

        builder.append(getAuthorityText(12345));
        builder.append(",");   // comma
        builder.append(lineSep);

        builder.append(getAuthorityText(12345));
        builder.append(",");   // comma
        builder.append(lineSep);

        builder.append("PRIMEM[");
        builder.append("\"");  // quote
        builder.append(replaceMe);
        builder.append("\"");  // quote
        builder.append(",");
        builder.append(replaceMe);
        builder.append(",");   // comma
        builder.append(lineSep);

        builder.append(getAuthorityText(12345));
        builder.append(",");   // comma
        builder.append(lineSep);

        builder.append("UNIT[");
        builder.append("\"");  // quote
        builder.append(replaceMe);
        builder.append("\"");  // quote
        builder.append(",");
        builder.append(replaceMe);
        builder.append(",");   // comma
        builder.append(lineSep);

        builder.append(getAuthorityText(12345));
        builder.append(",");   // comma
        builder.append(lineSep);

        builder.append(getAuthorityText(12345));

        String wkt = builder.toString();

        System.out.println(wkt);
        assertNotNull(wkt);
    }

    private String getAuthorityText(int epsgCode) {
        StringBuilder builder = new StringBuilder(300);
        builder.append("AUTHORITY[");
        builder.append("\"");  // quote
        builder.append("EPSG");
        builder.append("\"");  // quote
        builder.append(",");
        builder.append("\"");  // quote
        builder.append(epsgCode);
        builder.append("\"");  // quote
        builder.append("]]");

        return builder.toString();
    }

    @Test
    public void testTrimMetatdataId() {  //for LayerResource 
        //trim the metadataId to just the id  urn:uuid:e28612b4-a6d2-11e6-a70c-0242ac120007  -> e28612b4-a6d2-11e6-a70c-0242ac120007
        String metadataId = "urn:uuid:e28612b4-a6d2-11e6-a70c-0242ac120007";
        String expResult = "e28612b4-a6d2-11e6-a70c-0242ac120007";

        String delim = "[:]+";
        String[] tokens = metadataId.split(delim);
        String parsedMetaId = tokens[tokens.length - 1];

        assertEquals(expResult, parsedMetaId);
    }

    @Test
    public void testFilePathBuilder() throws FactoryException, IOException {
        final String TEMP_FILE_SUBDIRECTORY_PATH = "cch-temp";
        //java.nio.file.Path TEMP_FILE_SUBDIRECTORY =Files.createDirectory(Paths.get(TEMP_FILE_SUBDIRECTORY_PATH));
        //  TEMP_FILE_SUBDIRECTORY = Files.createDirectory(Paths.get(TEMP_FILE_SUBDIRECTORY_PATH));
        String tempPath = FileUtils.getTempDirectoryPath() + TEMP_FILE_SUBDIRECTORY_PATH;
        java.nio.file.Path TEMP_FILE_SUBDIRECTORY = Paths.get(tempPath);

        String fileDir = TEMP_FILE_SUBDIRECTORY.toFile().toString();
        System.out.println("getTempFileUtils: " + fileDir);

        String tempDir = System.getProperty("java.io.tmpdir") + "cch-temp";
        System.out.println("get System temp file: " + tempDir);

        java.nio.file.Path path = Paths.get(System.getProperty("java.io.tmpdir"));
        try (DirectoryStream<java.nio.file.Path> newDirectoryStream = Files.newDirectoryStream(path, TEMP_FILE_SUBDIRECTORY_PATH + "*")) {
            for (final java.nio.file.Path newDirectoryStreamItem : newDirectoryStream) {
                System.out.println("DIR that would be DELETED: " + newDirectoryStreamItem.getFileName());
                // Files.delete(newDirectoryStreamItem);
            }
        } catch (final Exception e) { // empty
            System.out.println(e);
        }

        assertEquals(fileDir, tempDir);
    }

    @Test
    public void testWktBuilder() throws FactoryException {
        String expString = getStringFromWKTBuilder();

        CRSParameters parms = new CRSParameters();
        parms.setDenflat(298.257222101);
        parms.setEllips("GRS 1980");
        parms.setFeast(0.0);
        parms.setFnorth(0.0);
        parms.setGcs("GCS_North_American_1983");
        parms.setHorizdn("North American Datum 1983");
        parms.setLatprjo(23.0);
        parms.setLengthUnit("Meter");
        parms.setLengthValue(1.0);
        parms.setLongcm(-96.0);
        parms.setMapprojn("Albers Conical Equal Area");
        parms.setPrimeM("Greenwich\",0.0]");
        parms.setProjection("Albers");
        parms.setSemiaxis(6378137.0);
        parms.setStdparll(45.5);
        parms.setUnit("Degree\",0.0174532925199433]]");

        String built = buildWkt(parms);
        System.out.println("String builtVia wkt parm dto: " + built);

        assertEquals(expString, built);

    }

    private String buildWkt(CRSParameters parms) {
        StringBuilder builder = new StringBuilder(500);
        final String lineSep = System.getProperty("line.separator", "\n");

        builder.append("PROJCS[")
                .append("\"") // quote
                .append(parms.getMapprojn())
                .append("\"") // quote
                .append(",") // comma
                .append(lineSep)
                .append("GEOGCS[")
                .append("\"") // quote
                .append(parms.getGcs()) // replace if the Gcs is found in the meta-data
                .append("\"") // quote
                .append(",") // comma
                .append(lineSep)
                .append("DATUM[")
                .append("\"") // quote
                .append(parms.getHorizdn())
                .append("\"") // quote
                .append(",") // comma
                .append(lineSep)
                .append("SPHEROID[")
                .append("\"") // quote
                .append(parms.getEllips())
                .append("\"") // quote
                .append(",") // comma                
                .append(parms.getSemiaxis())
                .append(",") // comma
                .append(parms.getDenflat())
                .append("]]")
                .append(",") // comma
                .append(lineSep)
                .append("PRIMEM[")
                .append("\"") // quote
                .append(parms.getPrimeM())
                .append(",")
                .append(lineSep)
                .append("UNIT[")
                .append("\"") // quote
                .append(parms.getUnit()) //get pa
                .append(",")
                .append(lineSep)
                .append("PROJECTION[")
                .append("\"") // quote
                .append(parms.getProjection())
                .append("\"]") // quote
                .append(",")
                .append(lineSep)
                .append(getParameterNode("False_Easting", parms.getFeast()))
                .append(",")
                .append(lineSep)
                .append(getParameterNode("False_Northing", parms.getFnorth()))
                .append(",")
                .append(lineSep)
                .append(getParameterNode("Central_Meridian", parms.getLongcm()))
                .append(",")
                .append(lineSep)
                .append(getParameterNode("Standard_Parallel_1", 29.5)) //#TODO# relace with value
                .append(",")
                .append(lineSep)
                .append(getParameterNode("Standard_Parallel_2", parms.getStdparll()))
                .append(",")
                .append(lineSep)
                .append(getParameterNode("Latitude_Of_Origin", parms.getLatprjo()))
                .append(",")
                .append(lineSep)
                .append("UNIT[")
                .append("\"") // quote
                .append(parms.getLengthUnit()) //Meter
                .append("\"") // quote
                .append(",")
                .append(parms.getLengthValue()) 
                .append("]]");
        
        return builder.toString();
    }

    private String getStringFromWKTBuilder() throws FactoryException {
        final String lineSep = System.getProperty("line.separator", "\n");

        String ellips = "GRS 1980";
        String horizdn = "North American Datum 1983";
        double denflat = 298.257222101;
        double semiaxis = 6378137.0;

        String mapprojn = "Albers Conical Equal Area";
        double feast = 0.0;
        double fnorth = 0.0;
        double latprjo = 23.0;
        double longcm = -96.0;
        double stdparll = 45.5; // the second of the two children     

        String defaultGcs = "GCS_North_American_1983";
        String defaultPrimeM = "Greenwich\",0.0]";
        String defaultUnit = "Degree\",0.0174532925199433]]";
        String defaultProjection = "Albers";
        String defaultLengthUnit = "Meter";
        double defaultLengthValue = 1.0;
        StringBuilder builder = new StringBuilder(500);

        builder.append("PROJCS[")
        .append("\"")  // quote
        .append(mapprojn)
        .append("\"")  // quote
        .append(",")   // comma
        .append(lineSep)

        .append("GEOGCS[")
        .append("\"")  // quote
        .append(defaultGcs)  // replace if the Gcs is found in the meta-data
        .append("\"")  // quote
        .append(",")   // comma
        .append(lineSep)

        .append("DATUM[")
        .append("\"")  // quote
        .append(horizdn)
        .append("\"")  // quote
        .append(",")   // comma
        .append(lineSep)

        .append("SPHEROID[")
        .append("\"")  // quote
        .append(ellips)
        .append("\"")  // quote
        .append(",")   // comma                
        .append(semiaxis)
        .append(",")   // comma
        .append(denflat)
        .append("]]")
        .append(",")   // comma
        .append(lineSep)

        .append("PRIMEM[")
        .append("\"")  // quote
        .append(defaultPrimeM)
        .append(",")
        .append(lineSep)

        .append("UNIT[")
        .append("\"")  // quote
        .append(defaultUnit)  //get pa
        .append(",")
        .append(lineSep)

        .append("PROJECTION[")
        .append("\"")  // quote
        .append(defaultProjection)
        .append("\"]")  // quote
        .append(",")
        .append(lineSep)

        .append(getParameterNode("False_Easting", feast))
        .append(",")
        .append(lineSep)

        .append(getParameterNode("False_Northing", fnorth))
        .append(",")
        .append(lineSep)

        .append(getParameterNode("Central_Meridian", longcm))
        .append(",")
        .append(lineSep)

        .append(getParameterNode("Standard_Parallel_1", 29.5)) //#TODO# relace with value
        .append(",")
        .append(lineSep)

        .append(getParameterNode("Standard_Parallel_2", stdparll))
        .append(",")
        .append(lineSep)

        .append(getParameterNode("Latitude_Of_Origin", latprjo))
        .append(",")
        .append(lineSep)

        .append("UNIT[")
        .append("\"")  // quote
        .append(defaultLengthUnit) //Meter
        .append("\"")  // quote
        .append(",")
        .append(defaultLengthValue)
        .append("]]");

        String wkt = builder.toString();
        System.out.println("Hand created WKT: " + wkt);

        assertNotNull(wkt);
        CoordinateReferenceSystem crs = CRS.parseWKT(wkt);
        assertNotNull(crs);
        // use some CRSUtils.lookup() feature to get the EPSG code
        Integer eCode = CRS.lookupEpsgCode(crs, true);
        String idCode = CRS.lookupIdentifier(crs, true);

        System.out.println("EPSG: " + eCode);
        System.out.println("Id : " + idCode);
        assertNotNull(idCode);
        //assertNull(wkt); // force a fail to see the output
        return wkt;
    }

    private static String getParameterNode(String name, double value) {
        //exp PARAMETER["False_Easting",0.0]
        StringBuilder sb = new StringBuilder(50);

        sb.append("PARAMETER[")
        .append("\"")  // quote
        .append(name)
        .append("\"")  // quote
        .append(",")   // comma
        .append(value)
        .append("]");

        return sb.toString();
    }
}
