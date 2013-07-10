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
            <sld:Name>${it.commonSldName}</sld:Name>
            <sld:Title>Dune elevation ColorMap</sld:Title>
            <sld:FeatureTypeStyle>
                <c:forEach var="i" begin="0" end="${it.binCount-1}">
                <sld:Rule>
                    <ogc:Filter>
                        <c:if test="${it.binCount-1 > i && i > 0}">
                        <ogc:And>
                        </c:if>
                            <c:if test="${i > 0}">
                            <ogc:PropertyIsGreaterThanOrEqualTo>
                                <ogc:PropertyName>${it.attr}</ogc:PropertyName>
                                <ogc:Literal>${it.thresholds[i-1]}</ogc:Literal>
                            </ogc:PropertyIsGreaterThanOrEqualTo>
                            </c:if>
                            <c:if test="${it.binCount-1 > i}">
                            <ogc:PropertyIsLessThan>
                                <ogc:PropertyName>${it.attr}</ogc:PropertyName>
                                <ogc:Literal>${it.thresholds[i]}</ogc:Literal>
                            </ogc:PropertyIsLessThan>
                            </c:if>
                        <c:if test="${it.binCount-1 > i && i > 0}">
                        </ogc:And>
                        </c:if>
                    </ogc:Filter>
                    <sld:LineSymbolizer>
                        <sld:Stroke>
                            <sld:CssParameter name="stroke">${it.colors[i]}</sld:CssParameter>
                            <sld:CssParameter name="stroke-width">${it.STROKE_WIDTH}</sld:CssParameter>
                            <sld:CssParameter name="stroke-opacity">${it.STROKE_OPACITY}</sld:CssParameter>
                        </sld:Stroke>
                    </sld:LineSymbolizer>
                </sld:Rule>
                </c:forEach>
            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:NamedLayer>
</sld:StyledLayerDescriptor>
