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
                <c:forEach var="i" begin="0" end="${it.binCount-1}">
                <sld:Rule>
                    <ogc:Filter>
                        <ogc:PropertyEqualTo>
                            <ogc:PropertyName>${it.attr}</ogc:PropertyName>
                            <ogc:Literal>${it.thresholds[i]}</ogc:Literal>
                        </ogc:PropertyEqualTo>
                    </ogc:Filter>
                    <sld:PointSymbolizer>
                        <sld:Graphic>
                            <sld:Mark>
                                <sld:WellKnownName>circle</sld:WellKnownName>
                                <sld:Fill>
                                    <sld:CssParameter name="fill">${it.colors[i]}</sld:CssParameter>
                                    <sld:CssParameter name="fill-opacity">${it.STROKE_OPACITY}</sld:CssParameter>
                                </sld:Fill>
                            </sld:Mark>
                                <sld:Size>${it.STROKE_WIDTH}</sld:Size>
                        </sld:Graphic>
                    </sld:PointSymbolizer>
                </sld:Rule>
                </c:forEach>
            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:NamedLayer>
</sld:StyledLayerDescriptor>
