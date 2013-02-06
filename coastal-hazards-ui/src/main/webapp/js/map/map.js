var Map = function() {
    var me = (this === window) ? {} : this;
    
    me.map = new OpenLayers.Map('map', {
        projection : "EPSG:900913"
    });
            
    me.map.addLayer(new OpenLayers.Layer.XYZ("ESRI World Imagery",
        "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}",
        {
            sphericalMercator: true,
            isBaseLayer: true,
            numZoomLevels : 20
        }
        ));
    
    me.map.addControl(new OpenLayers.Control.MousePosition());
    me.map.addControl(new OpenLayers.Control.ScaleLine({
        geodesic : true
    }));
    
    
    me.map.zoomToMaxExtent();
    
    return $.extend(me, {
        getMap : function() {
            return me.map;
        },
        addControl : function(control) {
            me.map.addControl(control);
        },
        addLayer : function(layer) {
            me.map.addLayer(layer);
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
        },
        getRenderer : function() {
            var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
            renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
            return renderer;
        }
    });
}
