<%-- 
    Document   : raster_ae
    Created on : Sep 16, 2016, 11:47:08 AM
    Author     : smlarson
--%>

<?xml version="1.0" encoding="UTF-8"?>
<%@page contentType="text/xml" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%-- <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
    <NamedLayer>
        <Name>Raster Interval</Name>
        <UserStyle>
        <Title>Raster SLD Tiff Test</Title>
        <FeatureTypeStyle>
    <Rule>
        <RasterSymbolizer>
            <Opacity>1.0</Opacity>
            <ColorMap type="intervals" extended="true">
                <ColorMapEntry color="#285A94" quantity="-12.0"/>
                <ColorMapEntry color="#005BE7" quantity="-1.0"/>
                <ColorMapEntry color="#38A700" quantity="0.0"/>
                <ColorMapEntry color="#AAFF01" quantity="1.0"/>
                <ColorMapEntry color="#FEFF73" quantity="5.0"/>
                <ColorMapEntry color="#FEFF73" quantity="10.0"/>
            </ColorMap>
        </RasterSymbolizer>
    </Rule>
    </FeatureTypeStyle>
</UserStyle>
</NamedLayer>
</StyledLayerDescriptor> 
--%>
    <sld:NamedLayer>
        <sld:Name>${it.id}</sld:Name>
        <sld:UserStyle>
            <sld:Name>${it.style}</sld:Name>
            <sld:Title>Coastal Change Hazards Interval Raster Style</sld:Title>
            <sld:FeatureTypeStyle>
                <%-- For raster, test the symbolizer type: ie AE uses intervals, PAE is values and CR is ramp  --%>
                <sld:Transformation>
                    <ogc:Function name="gs:RasterSymbolizer"
		<xsd:element name="ColorMap">
                    <sld:RasterSymbolizer> 
                        <sld:Opacity>1.0</sld:Opacity>
                        <sld:ColorMap>color=${it.color[i]} quantity=${it.thresholds[i]}</sld:ColorMap>
                    </sld:RasterSymbolizer>
                </sld:Transformation>    
                    <sld:rule>
                        <
                    </sld:rule>
                
                
                
            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:NamedLayer>
</sld:StyledLayerDescriptor>
