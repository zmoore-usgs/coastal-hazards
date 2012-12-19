var Map = function() {
    var me = (this === window) ? {} : this;
    
    OpenLayers.Request.GET({
        url: "pages/index/sld-shorelines.xml",
        success: function(req) {
            var format = new OpenLayers.Format.SLD();
            sld = format.read(req.responseXML || req.responseText);
        }
    });
    
    me.map = new OpenLayers.Map('map', {
        projection : "EPSG:900913"
    });
    
    
    var layer = {};
    layer["phys"] = new OpenLayers.Layer.Google(
        "Google Physical",
        {
            type: google.maps.MapTypeId.TERRAIN, 
            isBaseLayer: true
        });
    layer["sat"] = new OpenLayers.Layer.Google(
        "Google Satellite",
        {
            type: google.maps.MapTypeId.SATELLITE, 
            numZoomLevels: 20
        });
    layer["ghyb"] = new OpenLayers.Layer.Google(
        "Google Hybrid",
        {
            type: google.maps.MapTypeId.HYBRID, 
            numZoomLevels: 20
        });
    layer["gstreets"] = new OpenLayers.Layer.Google(
        "Google Streets", // the default
        {
            numZoomLevels: 20
        });

    layer['baseline-draw-layer']  = new OpenLayers.Layer.Vector("baseline-draw-layer");

    var baselineDrawControl = new OpenLayers.Control.DrawFeature(
        layer['baseline-draw-layer'],
        OpenLayers.Handler.Path,
        {
            id: 'baseline-draw-control',
            strategies : [new OpenLayers.Strategy.BBOX(), new OpenLayers.Strategy.Save()]
//            protocol: new OpenLayers.Protocol.WFS({
//                version: "1.1.0",
//                url: "geoserver",
//                featureNS :  "gov.usgs.cida.ch.input",
//                maxExtent: map.getMap().getExtent(),
//                featureType: "wfst_test",
//                geometryName: "the_geom",
//                schema: "geoserver/wfs/DescribeFeatureType?version=1.1.0&;typename=ch-input:wfst_test"
//            })
        
        });
    
    me.map.addLayer(layer["sat"]);
    
    me.map.addLayer(layer['baseline-draw-layer']);
    
    me.map.zoomToMaxExtent();
	
    me.map.addControl(new OpenLayers.Control.MousePosition());
    
    me.map.addControl(baselineDrawControl);
    
    return $.extend(me, {
        getMap : function() {
            return me.map;
        },
        removeLayerByName : function(featureName) {
            var layer = me.map.getLayersByName(featureName) || [];
            if (layer.length) {
                me.map.removeLayer(layer[0]);
            }
        },
        removeLayersByName : function(featureNames) {
            $(featureNames).each(function(index, fn) {
                me.removeLayerByName(fn);
            })
        }
    });
}
