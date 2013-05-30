package gov.usgs.cida.coastalhazards.rest;

import java.awt.Color;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Path("sld")
public class SLDResource {

    @GET
    @Path("redwhite/{id}/{attr}")
    @Produces(MediaType.APPLICATION_XML)
    public String getRedWhiteSLD(
            @PathParam("id") String id,
            @PathParam("attr") String attr) {
        String result = "";
        StringBuilder sld = new StringBuilder();
        sld.append("<sld:StyledLayerDescriptor")
            .append(" xmlns=\"http://www.opengis.net/ogc\"")
            .append(" xmlns:sld=\"http://www.opengis.net/sld\"") 
            .append(" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"")
            .append(" version=\"1.0.0\"")
            .append(" xsi:schemaLocation=\"http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd\">")

            .append("<sld:NamedLayer>")
            .append("<sld:Name>")
                .append(id)
            .append("</sld:Name>")
            .append("<sld:UserStyle>")
            .append("<sld:Name>redWhiteMap</sld:Name>")
            .append("<sld:Title>Red to White ColorMap</sld:Title>")
            .append("<sld:FeatureTypeStyle>") 
            .append("<sld:Rule>")
            .append("<sld:LineSymbolizer>")
            .append("<sld:ColorMap>")
            .append("<sld:ColorMapEntry color=\"#FFFFF\" quantity=\"0.0\"/>")
            .append("<sld:ColorMapEntry color=\"#FF0000\" quantity=\"100.0\"/>")
            .append("</sld:ColorMap>")
            .append("</sld:LineSymbolizer>")
            .append("</sld:Rule>")
            .append("</sld:FeatureTypeStyle>") 
            .append("</sld:UserStyle>")
            .append("</sld:NamedLayer>")
            .append("</sld:StyledLayerDescriptor>");
                
            result = sld.toString();
            return result;
    }
    
    protected static float[] makeSteps(float min, float max, int count) {
        float[] steps = new float[count];
        if (min > max) {
            throw new IllegalArgumentException("Min cannot be greater than max");
        }
        if (count < 2) {
            throw new IllegalArgumentException("Count must be 2 or more");
        }
        float range = max - min;
        float stepSize = range / (count - 1);
        for (int i=0; i<count; i++) {
            steps[i] = min + (stepSize * i);
        }
        return steps;
    }
    
    protected static String[] makeColors(String hexStart, String hexEnd, int count) {
        
        Color startColor = Color.decode(hexStart);
    }
}
