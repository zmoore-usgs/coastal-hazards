package gov.usgs.cida.coastalhazards.sld;

import com.google.gson.Gson;
import com.sun.jersey.api.view.Viewable;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.model.summary.Tiny;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import javax.ws.rs.core.Response;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
@Ignore // Need to ignore for now, I added database dependency :(
public class ShorelineTest {
    
    /**
     * Test of generateSLDInfo method, of class Shoreline.
     */
    @Test
    public void testGenerateSLDInfo() {
        Item item = new Item();
        item.setAttr("Date_");
        item.setId("abcde");
        item.setType(Item.Type.historical);
        List<Service> services = new LinkedList<>();
        Service wmsService = new Service();
        wmsService.setEndpoint("http://test");
        wmsService.setServiceParameter("0");
        wmsService.setType(ServiceType.source_wms);
        services.add(wmsService);
        item.setServices(services);
        Summary summary = new Summary();
        Tiny tiny = new Tiny();
        tiny.setText("Shoreline");
        summary.setTiny(tiny);
        item.setSummary(summary);
        
        SLDGenerator shoreline = new SLDGenerator(item, null, Shorelines.shorelines);
        Response response = shoreline.generateSLDInfo();
        String json = (String)response.getEntity();
        Map<String, Object> sldInfo = new Gson().fromJson(json, HashMap.class);
        List<Object> bins = (List)sldInfo.get("bins");
        Map<String,Object> bin = (Map)bins.get(0);
        Double year0 = ((List<Double>)bin.get("years")).get(0);
        String color = (String)bin.get("color");
        assertEquals(year0, 0.0f, 0.01f);
        assertEquals(color, "#ff0000");
    }
    
    @Test
    public void testGenerateSLD() {
        Item item = new Item();
        item.setAttr("DATE_");
        item.setId("abcde");
        item.setType(Item.Type.historical);
        List<Service> services = new LinkedList<>();
        Service wmsService = new Service();
        wmsService.setEndpoint("http://test");
        wmsService.setServiceParameter("0");
        wmsService.setType(ServiceType.source_wms);
        services.add(wmsService);
        item.setServices(services);
        Summary summary = new Summary();
        Tiny tiny = new Tiny();
        tiny.setText("Shoreline");
        summary.setTiny(tiny);
        item.setSummary(summary);
        
        SLDGenerator shoreline = new SLDGenerator(item, null, Shorelines.shorelines);

        Response response = shoreline.generateSLD();
        Viewable sld = (Viewable)response.getEntity();
    }

}