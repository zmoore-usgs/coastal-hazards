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
				<c:if test="${null != it.ribbon}">
				<sld:Transformation>
					<ogc:Function name="gs:Ribboning">
						<ogc:Function name="parameter">
							<ogc:Literal>features</ogc:Literal>
						</ogc:Function>
						<ogc:Function name="parameter">
							<ogc:Literal>bbox</ogc:Literal>
							<ogc:Function name="env">
								<ogc:Literal>wms_bbox</ogc:Literal>
							</ogc:Function>
						</ogc:Function>
						<ogc:Function name="parameter">
							<ogc:Literal>width</ogc:Literal>
							<ogc:Function name="env">
								<ogc:Literal>wms_width</ogc:Literal>
							</ogc:Function>
						</ogc:Function>
						<ogc:Function name="parameter">
							<ogc:Literal>height</ogc:Literal>
							<ogc:Function name="env">
								<ogc:Literal>wms_height</ogc:Literal>
							</ogc:Function>
						</ogc:Function>
						<ogc:Function name="parameter">
							<ogc:Literal>ribbon-count</ogc:Literal>
							<ogc:Literal>${it.ribbon}</ogc:Literal>
						</ogc:Function>
						<ogc:Function name="parameter">
							<ogc:Literal>offset</ogc:Literal>
							<ogc:Literal>${it.strokeWidth + ((it.strokeWidth / 2) + 1)}</ogc:Literal>
						</ogc:Function>
						<ogc:Function name="parameter">
							<ogc:Literal>scale</ogc:Literal>
							<ogc:Function name="env">
								<ogc:Literal>wms_scale_denominator</ogc:Literal>
							</ogc:Function>
						</ogc:Function>
					</ogc:Function>
				</sld:Transformation>
				</c:if>
				<c:if test="${null != it.ribbon}">
				<%-- Add in an empty rule to stop the wfs store from trying to filter by RIBBONID --%>
				<sld:Rule><sld:LineSymbolizer></sld:LineSymbolizer></sld:Rule>
				</c:if>
                <c:forEach var="i" begin="0" end="${it.binCount-1}">
					<c:forEach var="scale" begin="0" end="${it.scaleCount-2}">
                <sld:Rule>
					<sld:MinScaleDenominator>${it.scales[scale+1]}</sld:MinScaleDenominator>
					<sld:MaxScaleDenominator>${it.scales[scale]}</sld:MaxScaleDenominator>
                    <ogc:Filter>
						<c:if test="${null != it.ribbon}">
						<ogc:And>
							<ogc:PropertyIsEqualTo>
								<ogc:PropertyName>RIBBONID</ogc:PropertyName>
								<ogc:Literal>${it.ribbon}</ogc:Literal>
							</ogc:PropertyIsEqualTo>
						</c:if>
                        <ogc:PropertyIsEqualTo>
                            <ogc:PropertyName>${it.attr}</ogc:PropertyName>
                            <ogc:Literal>${it.thresholds[i]}</ogc:Literal>
                        </ogc:PropertyIsEqualTo>
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
