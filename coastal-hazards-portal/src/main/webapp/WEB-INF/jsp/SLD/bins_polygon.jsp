<?xml version="1.0" encoding="UTF-8"?>
<%@page contentType="text/xml" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
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
			    <ogc:PropertyIsGreaterThanOrEqualTo>
				    <ogc:PropertyName>${it.attr}</ogc:PropertyName>
				    <ogc:Literal>${it.thresholds[i]}</ogc:Literal>
			    </ogc:PropertyIsGreaterThanOrEqualTo>
			    <c:if test="${it.binCount-1 > i}">
				<ogc:PropertyIsLessThan>
					<ogc:PropertyName>${it.attr}</ogc:PropertyName>
					<ogc:Literal>${it.thresholds[i+1]}</ogc:Literal>
				</ogc:PropertyIsLessThan>
			    </c:if>
			</ogc:Filter>
			<sld:PolygonSymbolizer>
			    <sld:Fill>
				<sld:CssParameter name="fill">${it.colors[i]}</sld:CssParameter>
				<sld:CssParameter name="fill-opacity">${it.strokeOpacity}</sld:CssParameter>
			    </sld:Fill>
			</sld:PolygonSymbolizer>
		    </sld:Rule>
                </c:forEach>
            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:NamedLayer>
</sld:StyledLayerDescriptor>
