package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.rest.data.SummaryResource;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.Ignore;

/**
 *
 * @author jordan
 */
public class SummaryResourceTest {
   
    /**
     * TODO need to fix tiny summary for this to work (turn off @Ignore)
     * Test of getTinySummary method, of class SummaryResource.
     */
    @Test
    @Ignore
    public void testGetTinySummary() throws Exception {
        SummaryResource instance = new SummaryResource();
        String result = instance.getTinySummary("BzNRvCU");
        assertEquals("Rate of change for East shoreline of Hawaii is available at {tinygov} #coastalhazards", result);
    }
}