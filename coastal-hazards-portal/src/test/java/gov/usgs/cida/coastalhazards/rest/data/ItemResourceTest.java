/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.model.Item;
import java.io.IOException;
import java.util.Scanner;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertEquals;
import org.junit.Test;

/**
 *
 * @author owidev
 */
public class ItemResourceTest {
          
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
        
        Item bostonTest = Item.fromJSON(itemString);
	
	assertNotNull(bostonTest);
	assertEquals("google.com",bostonTest.getSummary().getMetadataDownload());
    }
    
    private String loadResourceAsString(String fileName) throws IOException {
        Scanner scanner = new Scanner(getClass().getClassLoader().getResourceAsStream(fileName));
        String contents = scanner.useDelimiter("\\A").next();
        scanner.close();
        return contents;
    }
}
