/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.model;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.jpa.SessionManager;
import gov.usgs.cida.coastalhazards.model.ogc.OGCService;
import gov.usgs.cida.coastalhazards.session.io.SessionIO;
import gov.usgs.cida.coastalhazards.session.io.SessionIOException;
import java.util.Set;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

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
"            \"bbox\": [-159.35, 21.96, -159.29, 22.17]"
            + "}";
    
    @Test
    public void testDB() throws SessionIOException {
        ItemManager manager = new ItemManager();
		String id;
		
		id = manager.save(itemJSON);
		assertNotNull(id);
		
		String json = manager.load(id);
		assertNotNull(json);
    }
}