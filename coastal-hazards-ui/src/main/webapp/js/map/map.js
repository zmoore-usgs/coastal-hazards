var Map = function() {
    LOG.info('Map.js::constructor:Map class is initializing.');
    var me = (this === window) ? {} : this;
    var initialExtent = [-15843196.966553,2251625.961233,-5501572.7891212,7593656.9932838];
    
    LOG.debug('Map.js::constructor:Loading Map object');
    me.map = new OpenLayers.Map('map', {
        projection : "EPSG:900913",
        displayProjection : new OpenLayers.Projection("EPSG:900913")
    });
    LOG.debug('Map.js::constructor:Creating base layer');
    me.map.addLayer(new OpenLayers.Layer.XYZ("ESRI World Imagery",
            "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}",
            {
                sphericalMercator: true,
                isBaseLayer: true,
                numZoomLevels: 20,
                wrapDateLine: true
            }
    ));
    
    LOG.debug('Map.js::constructor:Adding ontrols to map');
    me.map.addControl(new OpenLayers.Control.MousePosition());
    me.map.addControl(new OpenLayers.Control.ScaleLine({
        geodesic : true
    }));
    
    LOG.debug('Map.js::constructor:Zooming to extent: ' + initialExtent);
    me.map.zoomToExtent(initialExtent, true);
    
    LOG.debug('Map.js::constructor: Map class initialized.');
    return $.extend(me, {
        getMap : function() {
            return me.map;
        },
        getControlBy : function(by, name) {
            var controlArray = CONFIG.map.getMap().getControlsBy(by, name);  
            if (controlArray.length) {
                return controlArray[0];
            }
            return null;
        },
        addControl : function(control) {
            me.map.addControl(control);
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
        addLayer : function(layer) {
            if (layer) {
                me.map.addLayer(layer);
            }
        },
        removeLayer : function(layer, setNewBaseLayer) {
            if (layer) {
                me.map.removeLayer(layer, setNewBaseLayer || false);
            }
        },
        removeLayerByName : function(featureName) {
            LOG.info('Map.js::removeLayerByName: Trying to remove a layer from map. Layer name: ' + featureName);
            var layers = me.map.getLayersByName(featureName) || [];
            layers.each(function(layer){
                me.map.removeLayer(layer);
            });
        },
        removeLayersByName : function(featureNames) {
            $(featureNames).each(function(index, fn) {
                me.removeLayerByName(fn);
            });
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
