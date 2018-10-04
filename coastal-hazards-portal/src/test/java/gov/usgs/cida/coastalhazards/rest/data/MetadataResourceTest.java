/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.rest.data;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.io.IOException;
import java.io.StringReader;
import java.util.Map;
import java.util.Scanner;

import javax.ws.rs.core.Response;
import javax.xml.parsers.DocumentBuilderFactory;

import org.junit.Test;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;

/**
 *
 * @author dpatterm
 */
public class MetadataResourceTest {
        
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(MetadataResourceTest.class);
    private static String BTxml = "Boston_transects.xml";
    
    /**
     * Test of getMetadata method, of class MetadataResource.
     */
    @Test
    public void testGetMetadataWithoutCswBTXml() throws IOException {
        System.out.println("testGetMetadataWithoutCswBTXml");

        //get the metadata from the test file as a string using this package to locate it ...
        String packageName = this.getClass().getCanonicalName();
        System.out.println("PackageName: " + packageName); //PackageName: gov.usgs.cida.coastalhazards.rest.data.MetadataResourceTest
        // this is where the test resource is located - gov.usgs.cida.coastalhazards.rest.data + /Boston_transects.xml
        String replaced = packageName.replaceAll("[.]", "/");
        String[] names = replaced.split("/MetadataResourceTest");
        String packageNameShort = names[0];
        
        String testFileFullName = packageNameShort + "/" + BTxml;

        String metadataXml = loadResourceAsString(testFileFullName);

        MetadataResource mr = new MetadataResource();
        Response resp = mr.getMetadata(null, metadataXml);
        
        System.out.println("Response: " + resp.getEntity());
        
        Map<String,Object> gsonResp = GsonUtil.getDefault().fromJson((String) resp.getEntity(), Map.class);
        
        assertEquals(7,gsonResp.size());
    }
    
    /**
     * Test of extractStringsFromCsw method, of class MetadataUtil.
     */
    @Test
    public void testExtractStringsFromCswDoc() throws IOException {
        System.out.println("testExtractStringsFromCswDoc");
        
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        Document doc = null;
        //get the metadata from the test file as a string using this package to locate it ...
        String packageName = this.getClass().getCanonicalName();
        System.out.println("PackageName: " + packageName); //PackageName: gov.usgs.cida.coastalhazards.rest.data.MetadataResourceTest
        // this is where the test resource is located - gov.usgs.cida.coastalhazards.rest.data + /Boston_transects.xml
        String replaced = packageName.replaceAll("[.]", "/");
        String[] names = replaced.split("/MetadataResourceTest");
        String packageNameShort = names[0];
        
        String testFileFullName = packageNameShort + "/" + BTxml;

        String metadataXml = loadResourceAsString(testFileFullName);
        try{
            doc = factory.newDocumentBuilder().parse(new InputSource(new StringReader(metadataXml)));
        } catch (Exception e){
            log.error("Failed to parse metadata xml document. Error: " + e.getMessage() + ". Stack Trace: " + e.getStackTrace());
        }
        assertNotNull(MetadataUtil.extractStringsFromCswDoc(doc, "//*/placekey"));
        assertEquals(MetadataUtil.extractStringsFromCswDoc(doc, "//*/placekey").size(),5);
        assertEquals(MetadataUtil.extractStringsFromCswDoc(doc, "//*/themekey").size(),28);
        
    }
    
    
    private String loadResourceAsString(String fileName) throws IOException {
        Scanner scanner = new Scanner(getClass().getClassLoader().getResourceAsStream(fileName));
        String contents = scanner.useDelimiter("\\A").next();
        scanner.close();
        return contents;
    }
}
