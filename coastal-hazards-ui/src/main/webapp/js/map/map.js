var Map = function() {
    var me = (this === window) ? {} : this;
    
    OpenLayers.Request.GET({
        url: "pages/index/sld-shorelines.xml",
        success: function(req) {
            var format = new OpenLayers.Format.SLD();
            CONFIG.sld = format.read(req.responseXML || req.responseText);
        }
    });
    
    me.map = new OpenLayers.Map('map', {
        projection : "EPSG:900913"
    });
    
    
    var layer = {};
    layer["sat"] = new OpenLayers.Layer.Google(
        "Google Satellite",
        {
            type: google.maps.MapTypeId.SATELLITE, 
            numZoomLevels: 20
        });

    layer['baseline-draw-layer']  = new OpenLayers.Layer.Vector("baseline-draw-layer",{
        strategies : [new OpenLayers.Strategy.BBOX(), new OpenLayers.Strategy.Save()],
        projection: new OpenLayers.Projection('EPSG:900913'),
        protocol: new OpenLayers.Protocol.WFS({
            version: "1.1.0",
            url: "geoserver/ows",
            featureNS :  "gov.usgs.cida.ch.input",
            maxExtent: me.map.getExtent(),
            featureType: "wfst_test",
            geometryName: "the_geom",
            schema: "geoserver/wfs/DescribeFeatureType?version=1.1.0&typename=ch-input:wfst_test"
        })
    });

    var baselineDrawControl = new OpenLayers.Control.DrawFeature(
        layer['baseline-draw-layer'],
        OpenLayers.Handler.Path,
        {
            id: 'baseline-draw-control',
            multi: true
        }
        );
            
    var wmsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
        url: 'geoserver/wms', 
        title: 'shoreline-identify-control',
        layers: [],
        queryVisible: true
    })
            
    
    me.map.addLayer(layer["sat"]);
    
    me.map.addLayer(layer['baseline-draw-layer']);
    
    me.map.zoomToMaxExtent();
	
    me.map.addControl(wmsGetFeatureInfoControl);
    me.map.addControl(new OpenLayers.Control.MousePosition());
    me.map.addControl(new OpenLayers.Control.ScaleLine({
        geodesic : true
    }));
    
    
    me.map.addControl(baselineDrawControl);
    
    return $.extend(me, {
        getMap : function() {
            return me.map;
        },
        removeControl : function(args) {
            LOG.info('Map.js::removeControl: Trying to remove a control from map');
            var control = me.map.getControl(args.id);
            if (control) {
                LOG.info('Map.js::removeControl: Removing control ' + control.id + ' from map');
                me.map.removeControl(control);
            }
            return control;
        },
        removeLayerByName : function(featureName) {
            LOG.info('Map.js::removeLayerByName: Trying to remove a layer from map. Layer name: ' + featureName);
            var layer = me.map.getLayersByName(featureName) || [];
            if (layer.length) {
                me.map.removeLayer(layer[0]);
            }
            return layer;
        },
        removeLayersByName : function(featureNames) {
            $(featureNames).each(function(index, fn) {
                me.removeLayerByName(fn);
            })
        },
        copyVectorLayer : function(args) {
            var layerName = args.layerName;
            var copyName = args.copyName || layerName + '_clone';
            var layer = me.map.getLayersByName(layerName)[0];
            var clonedLayer = null;
            if (layer) {
                clonedLayer = layer.clone({ 
                    name : copyName,
                    renderer : args.renderer,
                    styleMap : args.styleMap
                })
            }
            
            return clonedLayer;
        }
    });
}
