/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.Bbox;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import javax.ws.rs.core.Response;
import static org.junit.Assert.assertEquals;
import org.junit.Test;
import org.slf4j.LoggerFactory;

/**
 *
 * @author dpatterm
 */
public class MetadataResourceTest {
        
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(MetadataResourceTest.class);
    private static String BTxml = "Boston_transects.xml";
    
    /**
     * Test of getBoundingBoxFromFgdcMetadataAE method, of class MetadataUtil.
     */
    @Test
    public void testGetMetadataWithoutCswBTXml() throws IOException {
        System.out.println("testGetBoundingBoxFromFgdcMetadataAE");
        // This method tests the parsing that occurs in: Bbox result = MetadataUtil.getBoundingBoxFromFgdcMetadata(metadata); // file is ~40kb
        // spdom is the WGS84 bbox, format for the Bbox is "BOX(%f %f, %f %f)"

        //get the metadata from the test file as a string using this package to locate it ...
        String packageName = this.getClass().getCanonicalName();
        System.out.println("PackageName: " + packageName); //PackageName: gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtilTest
        // this is where the test resource is located - gov.usgs.cida.coastalhazards.rest.data + /ne_AEmeta.xml
        String replaced = packageName.replaceAll("[.]", "/");
        String[] names = replaced.split("/MetadataResourceTest");
        String packageNameShort = names[0];
        
        String testFileFullName = packageNameShort + "/" + BTxml;

        String metadataXml = loadResourceAsString(testFileFullName);

        MetadataResource mr = new MetadataResource();
        Response resp = mr.getMetadata(null, metadataXml);
        
        Map<String,List> gsonResp = GsonUtil.getDefault().fromJson((String) resp.getEntity(), Map.class);
        
        assertEquals(gsonResp.size(),3);
    }
    
    
    private String loadResourceAsString(String fileName) throws IOException {
        Scanner scanner = new Scanner(getClass().getClassLoader().getResourceAsStream(fileName));
        String contents = scanner.useDelimiter("\\A").next();
        scanner.close();
        return contents;
    }
}
