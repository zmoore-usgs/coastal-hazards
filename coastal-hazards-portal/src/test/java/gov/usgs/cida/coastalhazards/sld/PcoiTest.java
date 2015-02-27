package gov.usgs.cida.coastalhazards.sld;

import static org.junit.Assert.assertEquals;
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

import org.glassfish.jersey.server.mvc.Viewable;
import org.junit.Test;

import com.google.gson.Gson;

/**
 *
 * @author jiwalker
 */
public class PcoiTest {
    
    /**
     * Test of generateSLDInfo method, of class Pcoi.
     */
    @Test
    public void testGenerateSLDInfo() {
        Item item = new Item();
        item.setAttr("PCOL1");
        item.setId("abcde");
        item.setType(Item.Type.storms);
        List<Service> services = new LinkedList<>();
        Service wmsService = new Service();
        wmsService.setEndpoint("http://test");
        wmsService.setServiceParameter("0");
        wmsService.setType(ServiceType.source_wms);
        services.add(wmsService);
        item.setServices(services);
        Summary summary = new Summary();
        Tiny tiny = new Tiny();
        tiny.setText("Pcoi");
        summary.setTiny(tiny);
        item.setSummary(summary);
        
        SLDGenerator pcoi = new SLDGenerator(item, null, Pcoi.pcoi);
        Response response = pcoi.generateSLDInfo();
        String json = (String)response.getEntity();
        Map<String, Object> sldInfo = new Gson().fromJson(json, HashMap.class);
        List<Object> bins = (List)sldInfo.get("bins");
        Map<String,Object> bin = (Map)bins.get(0);
        Double lowerBound = (Double)bin.get("lowerBound");
        String color = (String)bin.get("color");
        assertEquals(lowerBound, 0.0f, 0.01f);
        assertEquals(color, "#FFFFFE");
    }
    
    @Test
    public void testGenerateSLD() {
        Item item = new Item();
        item.setAttr("PCOL1");
        item.setId("abcde");
        item.setType(Item.Type.storms);
        List<Service> services = new LinkedList<>();
        Service wmsService = new Service();
        wmsService.setEndpoint("http://test");
        wmsService.setServiceParameter("0");
        wmsService.setType(ServiceType.source_wms);
        services.add(wmsService);
        item.setServices(services);
        Summary summary = new Summary();
        Tiny tiny = new Tiny();
        tiny.setText("Pcoi");
        summary.setTiny(tiny);
        item.setSummary(summary);
        
        SLDGenerator pcoi = new SLDGenerator(item, null, Pcoi.pcoi);
        Response response = pcoi.generateSLD();
        Viewable sld = (Viewable)response.getEntity(); //TODO?
    }

}