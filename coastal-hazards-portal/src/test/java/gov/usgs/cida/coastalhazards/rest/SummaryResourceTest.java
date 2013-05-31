package gov.usgs.cida.coastalhazards.rest;

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
public class SummaryResourceTest {
   
    /**
     * Test of getTinySummary method, of class SummaryResource.
     */
    @Test
    public void testGetTinySummary() throws Exception {
        SummaryResource instance = new SummaryResource();
        String result = instance.getTinySummary("BzNRvCU");
        assertEquals("Rate of change for East shoreline of Hawaii is available at {tinygov} #coastalhazards", result);
    }
}