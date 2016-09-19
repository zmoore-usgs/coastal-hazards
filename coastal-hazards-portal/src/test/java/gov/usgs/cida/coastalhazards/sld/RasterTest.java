package gov.usgs.cida.coastalhazards.sld;

import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.model.summary.Tiny;
import java.util.LinkedList;
import java.util.List;
import javax.ws.rs.core.Response;
import org.glassfish.jersey.server.mvc.Viewable;
import org.junit.Test;

/**
 *
 * @author smlarson
 */
public class RasterTest {
       @Test
    public void testGenerateSLD() {
        Item item = new Item();
        item.setAttr("GRAY_INDEX");
        item.setId("EHr6oLT5");  //may want h
        item.setType(Item.Type.vulnerability);
        List<Service> services = new LinkedList<>();
        Service wmsService = new Service();
        wmsService.setEndpoint("http://test");
        wmsService.setServiceParameter("0");
        wmsService.setType(Service.ServiceType.source_wms);
        services.add(wmsService);
        item.setServices(services);
        Summary summary = new Summary();
        Tiny tiny = new Tiny();
        tiny.setText("Coastal response to Sea Level");
        summary.setTiny(tiny);
        item.setSummary(summary);
        
        SLDGenerator raster = new SLDGenerator(item, null, Raster.rasterConfig);

        Response response = raster.generateSLD();
        Viewable sld = (Viewable)response.getEntity();
    }
}
