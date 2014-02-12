package gov.usgs.cida.coastalhazards.util.ogc;

import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class WFSServiceTest {

    /**
     * Test of checkValidity method, of class WFSService.
     * Valid service url
     */
    @Test
    public void testValid() {
        WFSService instance = new WFSService();
        instance.setEndpoint("http://example.com:1234/geoserver/wfs");
        instance.setTypeName("test");
        boolean expResult = true;
        boolean result = instance.checkValidity();
        assertEquals(expResult, result);
    }
    
    /**
     * Test of checkValidity method, of class WFSService.
     * Only testing this for now, do the rest later
     * invalid service URL
     */
    @Test
    public void testInvalid() {
        WFSService instance = new WFSService();
        instance.setEndpoint("''");
        instance.setTypeName("test");
        boolean expResult = false;
        boolean result = instance.checkValidity();
        assertEquals(expResult, result);
    }
    
}
