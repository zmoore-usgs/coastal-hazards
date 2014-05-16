package gov.usgs.cida.coastalhazards.domain;

import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import java.util.Set;
import org.junit.Ignore;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class WFSGetDomainTest {
    
    public WFSGetDomainTest() {
    }

    /**
     * Test of getDomainValuesAsStrings method, of class WFSGetDomain.
     */
    @Test
    @Ignore // ignoring until I can actually mock this sort of thing out
    public void testGetDomainValuesAsStrings() throws Exception {
        WFSService service = new WFSService();
        service.setEndpoint("http://marine.usgs.gov/coastalchangehazardsportal/geoserver/proxied/ows");
        service.setTypeName("proxied:MauiK_shorelines");
        WFSGetDomain instance = new WFSGetDomain();
        Set<String> result = instance.getDomainValuesAsStrings(service, "DATE_");
        assertThat(19, is(equalTo(result.size())));
    }
    
}
