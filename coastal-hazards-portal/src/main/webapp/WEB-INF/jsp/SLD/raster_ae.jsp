<%-- 
    Document   : raster
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
            <sld:Title>Coastal Change Hazards Raster Style</sld:Title>
            <sld:FeatureTypeStyle>
				<c:if test="${null != it.ribbon}">
				<%-- Add in an empty rule to stop the wfs store from trying to filter by RIBBONID --%>
				<sld:Rule><sld:Geometry></sld:Geometry</sld:Rule>
				</c:if>
                <c:forEach var="i" begin="0" end="${it.binCount-1}">
					<c:forEach var="scale" begin="0" end="${it.scaleCount-2}">
				<sld:Rule>
					<sld:MinScaleDenominator>${it.scales[scale+1]}</sld:MinScaleDenominator>
					<sld:MaxScaleDenominator>${it.scales[scale]}</sld:MaxScaleDenominator>
					<ogc:Filter>
						<c:if test="${null != it.ribbon}"> <%-- For raster, test the symbolizer type: ie AE uses intervals, PAE is values and CR is ramp  --%>
						<ogc:And>
							<ogc:PropertyIsEqualTo>
								<ogc:PropertyName>GREY_INDEX</ogc:PropertyName>
								<ogc:Literal>${it.ribbon}</ogc:Literal>
							</ogc:PropertyIsEqualTo>
							</c:if>
							<c:if test="${it.binCount-1 > i}">
							<ogc:And>
							</c:if>
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
							<c:if test="${it.binCount-1 > i}">
							</ogc:And>
							</c:if>
							<c:if test="${null != it.ribbon}">
							</ogc:And>
							</c:if>
					</ogc:Filter>
					<sld:LineSymbolizer>
						<sld:Stroke>
							<sld:CssParameter name="stroke">${it.colors[i]}</sld:CssParameter>
							<sld:CssParameter name="stroke-width">${it.strokeWidth + (scale * (5 * it.strokeWidth / it.scaleCount))}</sld:CssParameter>
							<sld:CssParameter name="stroke-opacity">${it.strokeOpacity}</sld:CssParameter>
						</sld:Stroke>
					</sld:LineSymbolizer>
				</sld:Rule>
					</c:forEach>
                </c:forEach>
            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:NamedLayer>
</sld:StyledLayerDescriptor>
