<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Ribboning</Name>
    <UserStyle>
      <Title>Ribboning</Title>
      <Abstract>Ribboning</Abstract>
      <FeatureTypeStyle>
        <Transformation>
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
              <ogc:Literal>3</ogc:Literal>
            </ogc:Function>
            <ogc:Function name="parameter">
              <ogc:Literal>offset</ogc:Literal>
              <ogc:Literal>5</ogc:Literal>
            </ogc:Function>
          </ogc:Function>
        </Transformation>
        <Rule>
          <!-- This is in here to make sure the renderer doesn't rely on the store to filter RIBBONID -->
          <LineSymbolizer>
            <Geometry>
              <ogc:PropertyName>Shape</ogc:PropertyName>
            </Geometry>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>RIBBONID</ogc:PropertyName>
              <ogc:Literal>1</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <!-- specify geometry attribute to pass validation -->
            <Geometry>
              <ogc:PropertyName>Shape</ogc:PropertyName>
            </Geometry>
            <Stroke>
              <CssParameter name="stroke">
                <ogc:Function name="Categorize">
                  <ogc:PropertyName>PCOL3</ogc:PropertyName>
                  
                  <ogc:Literal>#FFFFFE</ogc:Literal>
                  <ogc:Literal>10.0</ogc:Literal>
                  <ogc:Literal>#FFE6E6</ogc:Literal>
                  <ogc:Literal>25.0</ogc:Literal>
                  <ogc:Literal>#FFCCCD</ogc:Literal>
                  <ogc:Literal>50.0</ogc:Literal>
                  <ogc:Literal>#FF9C95</ogc:Literal>
                  <ogc:Literal>75.0</ogc:Literal>
                  <ogc:Literal>#FF574A</ogc:Literal>
                  <ogc:Literal>90.0</ogc:Literal>
                  <ogc:Literal>#FF0000</ogc:Literal>
                  
                  <ogc:Literal>succeeding</ogc:Literal>
                </ogc:Function>
              </CssParameter>
              <CssParameter name="stroke-width">3</CssParameter>
              <CssParameter name="stroke-opacity">1</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>RIBBONID</ogc:PropertyName>
              <ogc:Literal>2</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Geometry>
              <ogc:PropertyName>Shape</ogc:PropertyName>
            </Geometry>
            <Stroke>
              <CssParameter name="stroke">
                <ogc:Function name="Categorize">
                  <ogc:PropertyName>POVW3</ogc:PropertyName>
                  
                  <ogc:Literal>#FFFFFE</ogc:Literal>
                  <ogc:Literal>10.0</ogc:Literal>
                  <ogc:Literal>#FFE6E6</ogc:Literal>
                  <ogc:Literal>25.0</ogc:Literal>
                  <ogc:Literal>#FFCCCD</ogc:Literal>
                  <ogc:Literal>50.0</ogc:Literal>
                  <ogc:Literal>#FF9C95</ogc:Literal>
                  <ogc:Literal>75.0</ogc:Literal>
                  <ogc:Literal>#FF574A</ogc:Literal>
                  <ogc:Literal>90.0</ogc:Literal>
                  <ogc:Literal>#FF0000</ogc:Literal>
                  
                  <ogc:Literal>succeeding</ogc:Literal>
                </ogc:Function>
              </CssParameter>
              <CssParameter name="stroke-width">3</CssParameter>
              <CssParameter name="stroke-opacity">1</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>RIBBONID</ogc:PropertyName>
              <ogc:Literal>3</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Geometry>
              <ogc:PropertyName>Shape</ogc:PropertyName>
            </Geometry>
            <Stroke>
              <CssParameter name="stroke">
                <ogc:Function name="Categorize">
                  <ogc:PropertyName>PIND3</ogc:PropertyName>
                  
                  <ogc:Literal>#FFFFFE</ogc:Literal>
                  <ogc:Literal>10.0</ogc:Literal>
                  <ogc:Literal>#FFE6E6</ogc:Literal>
                  <ogc:Literal>25.0</ogc:Literal>
                  <ogc:Literal>#FFCCCD</ogc:Literal>
                  <ogc:Literal>50.0</ogc:Literal>
                  <ogc:Literal>#FF9C95</ogc:Literal>
                  <ogc:Literal>75.0</ogc:Literal>
                  <ogc:Literal>#FF574A</ogc:Literal>
                  <ogc:Literal>90.0</ogc:Literal>
                  <ogc:Literal>#FF0000</ogc:Literal>
                  
                  <ogc:Literal>succeeding</ogc:Literal>
                </ogc:Function>
              </CssParameter>
              <CssParameter name="stroke-width">3</CssParameter>
              <CssParameter name="stroke-opacity">1</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
