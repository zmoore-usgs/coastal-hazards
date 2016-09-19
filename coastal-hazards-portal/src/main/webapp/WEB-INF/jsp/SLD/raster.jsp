<%-- 
    Document   : raster
    Created on : Sep 16, 2016, 11:47:08 AM
    Author     : smlarson
--%>

<?xml version="1.0" encoding="UTF-8"?>
<%@page contentType="text/xml" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
    <NamedLayer>
<Name>Six color interval</Name>
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

