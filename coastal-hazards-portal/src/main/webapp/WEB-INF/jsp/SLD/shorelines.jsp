<?xml version="1.0" encoding="UTF-8"?>
<%@page contentType="text/xml" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
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
            <sld:Title>Historical Shoreline ColorMap</sld:Title>
            <sld:FeatureTypeStyle>
                <c:forEach var="i" begin="0" end="${it.binCount-1}">
                    <c:set var="year">${it.thresholds[i]}</c:set>
					<sld:Rule>
                        <ogc:Filter>
                                <ogc:PropertyIsLike wildCard="%" singleChar="." escape="!">
                                    <ogc:PropertyName>${it.attr}</ogc:PropertyName>
                                <ogc:Literal>%<fmt:parseNumber parseLocale="en-US" integerOnly="true" value="${year}" /></ogc:Literal>
                                </ogc:PropertyIsLike>
                        </ogc:Filter>
						<sld:LineSymbolizer>
							<sld:Stroke>
								<sld:CssParameter name="stroke">${it.colors[i]}</sld:CssParameter>
								<sld:CssParameter name="stroke-width">${it.strokeWidth}</sld:CssParameter>
								<sld:CssParameter name="stroke-opacity">${it.strokeOpacity}</sld:CssParameter>
							</sld:Stroke>
						</sld:LineSymbolizer>
					</sld:Rule>
                </c:forEach>
            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:NamedLayer>
</sld:StyledLayerDescriptor>