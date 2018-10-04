/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.rest.data.util.MetadataUtil;
import java.io.IOException;
import java.io.StringReader;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import javax.ws.rs.core.Response;
import javax.xml.parsers.DocumentBuilderFactory;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import org.junit.Test;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

/**
 *
 * @author owidev
 */
public class ItemResourceTest {
          
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(MetadataResourceTest.class);
    private static String BTI = "Boston_Item.json";
    
    /**
     * Test of getMetadata method, of class MetadataResource.
     */
    @Test
    public void testGetMetadataWithoutCswBTXml() throws IOException {
        String packageName = this.getClass().getCanonicalName();
        System.out.println("PackageName: " + packageName);
        String replaced = packageName.replaceAll("[.]", "/");
        String[] names = replaced.split("/ItemResourceTest");
        String packageNameShort = names[0];
        
        String testFileFullName = packageNameShort + "/" + BTI;

        String itemString = loadResourceAsString(testFileFullName);
        ItemResource ir = new ItemResource();
        
        // ISSUE IS THAT metadataDownload is currently an object (metadata : {...}  when it should be just a string metadata : ...)
        Response resp = ir.postItem(itemString, null);
        
        assertNotNull(resp);
    }
    
    private String loadResourceAsString(String fileName) throws IOException {
        Scanner scanner = new Scanner(getClass().getClassLoader().getResourceAsStream(fileName));
        String contents = scanner.useDelimiter("\\A").next();
        scanner.close();
        return contents;
    }
}
