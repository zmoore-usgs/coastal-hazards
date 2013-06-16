/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.model;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.session.io.SessionIOException;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.Ignore;

/**
 *
 * @author jordan
 */
public class ItemTest {
    
   String itemJSON =  "{\"metadata\": \"testMetaUrl\"," +
"            \"wfsService\": {\n" +
"                    \"endpoint\": \"http://cida.usgs.gov/qa/DSASweb/geoserver/published/wfs\",\n" +
"                    \"typeName\": \"published:KauaiE_shorelines\"\n" +
"                },\n" +
"                \"wmsService\": {\n" +
"                    \"endpoint\": \"http://cida.usgs.gov/qa/DSASweb/geoserver/published/wms\",\n" +
"                    \"layers\": \"KauaiE_shorelines\"\n" +
"                }," +
"            \"name\": \"Linear Regression Rate of shorelines in eastern Kauai, HI\",\n" +
"            \"type\": \"historical\",\n" +
"            \"attr\": \"LRR\",\n" +
"            \"bbox\": [-159.35, 21.96, -159.29, 22.17]," +
"            \"summary\": {" +
"               \"tiny\": \"Linear Regression Rate of shorelines in eastern Kauai, HI\"," +
"               \"medium\": \"This dataset includes shorelines ranging from 1927 to 2008 in the Kauai East coastal region from Pilaa to Nawiliwili. Linear Regression Rate is a shoreline change metric calculated using the Digital Shoreline Analysis System. Data sources: aerial photographs, coastal survey maps\"," +
"               \"info\": \"temporary placeholder\"" + 
"            }" +             
"           }";
    
    @Test
    @Ignore //need to figure out how to do local db test
    public void testDB() throws SessionIOException {
        ItemManager manager = new ItemManager();
		String id;
		
		id = manager.save(itemJSON);
		assertNotNull(id);
		
		String json = manager.load(id);
		assertNotNull(json);
    }
}