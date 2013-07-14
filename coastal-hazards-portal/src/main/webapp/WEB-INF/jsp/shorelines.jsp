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
                <c:forEach var="i" begin="0" end="99">
					<sld:Rule>
						<ogc:Filter>
							<ogc:PropertyIsLike wildCard="%" singleChar="." escape="!">
								<ogc:PropertyName>${it.attr}</ogc:PropertyName>
								<ogc:Literal>%<fmt:formatNumber minIntegerDigits="2" value="${i}" /></ogc:Literal>
							</ogc:PropertyIsLike>
						</ogc:Filter>
						<sld:LineSymbolizer>
							<sld:Stroke>
								<sld:CssParameter name="stroke">${it.colors[i%it.binCount]}</sld:CssParameter>
								<sld:CssParameter name="stroke-width">${it.STROKE_WIDTH}</sld:CssParameter>
								<sld:CssParameter name="stroke-opacity">${it.STROKE_OPACITY}</sld:CssParameter>
							</sld:Stroke>
						</sld:LineSymbolizer>
					</sld:Rule>
					<sld:Rule>
						<TextSymbolizer>
							<Label>
								<ogc:PropertyName>${it.attr}</ogc:PropertyName>
							</Label>
							<LabelPlacement>
								<LinePlacement />
							</LabelPlacement>
							<Fill>
								<CssParameter name="fill">#FFFFFF</CssParameter>
							</Fill>
							<Font>
								<CssParameter name="font-family">Arial</CssParameter>
								<CssParameter name="font-size">10</CssParameter>
								<CssParameter name="font-style">normal</CssParameter>
								<CssParameter name="font-weight">bold</CssParameter>
							</Font>
							<VendorOption name="followLine">true</VendorOption>
							<VendorOption name="followLine">true</VendorOption>
							<VendorOption name="maxAngleDelta">90</VendorOption>
							<VendorOption name="maxDisplacement">400</VendorOption>
							<VendorOption name="repeat">150</VendorOption>
						</TextSymbolizer>
					</sld:Rule>
                </c:forEach>
            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:NamedLayer>
</sld:StyledLayerDescriptor>