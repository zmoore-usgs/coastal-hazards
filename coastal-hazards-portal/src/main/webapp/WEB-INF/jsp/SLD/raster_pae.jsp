<?xml version="1.0" encoding="UTF-8"?>
<%@page contentType="text/xml" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
 <sld:StyledLayerDescriptor
    xmlns="http://www.opengis.net/ogc"
    xmlns:sld="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.0.0"
    xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
<sld:NamedLayer>
        <sld:Name>${it.id}</sld:Name>
        <sld:UserStyle>
            <sld:Name>${it.style}</sld:Name> 
            <sld:Title>Coastal Change Hazards Style</sld:Title>
            <sld:FeatureTypeStyle>
                <sld:Rule>
                    <sld:RasterSymbolizer>
                        <sld:ColorMap type="intervals"> 
                            <c:forEach var="i" begin="0" end="${it.binCount-1}"> 
                                <c:if test="${(i == 0)}"> 
                                    <sld:ColorMapEntry color="#ffffff" label="0" quantity="${it.thresholds[i]}" opacity="0"/>
                                    <sld:ColorMapEntry color="${it.colors[i]}" label="1" quantity="${it.thresholds[i+1]}" opacity="1"/>
                                </c:if>                                   
                                <c:if test="${(i > 0)}">
                                    <sld:ColorMapEntry color="${it.colors[i]}" label="1" quantity="${it.thresholds[i+1]}" opacity="1"/>
                                </c:if>
                            </c:forEach>
                        </sld:ColorMap>
                    </sld:RasterSymbolizer>
                </sld:Rule>
            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:NamedLayer>
</sld:StyledLayerDescriptor>
            
            
