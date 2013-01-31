var Map = function() {
    var me = (this === window) ? {} : this;
    
    me.map = new OpenLayers.Map('map', {
        projection : "EPSG:900913"
    });
    
    var drawLayer  = new OpenLayers.Layer.Vector("baseline-draw-layer",{
        strategies : [new OpenLayers.Strategy.BBOX(), new OpenLayers.Strategy.Save()],
        projection: new OpenLayers.Projection('EPSG:900913'),
        protocol: new OpenLayers.Protocol.WFS({
            version: "1.1.0",
            url: "geoserver/ows",
            featureNS :  CONFIG.tempSession.getCurrentSessionKey(),
            maxExtent: me.map.getExtent(),
            featureType: "featureType",
            geometryName: "the_geom",
            schema: "geoserver/wfs/DescribeFeatureType?version=1.1.0&outputFormat=GML2&typename=" + CONFIG.tempSession.getCurrentSessionKey() + ":featureType"
        })
    });

    var baselineDrawControl = new OpenLayers.Control.DrawFeature(
        drawLayer,
        OpenLayers.Handler.Path,
        {
            id: 'baseline-draw-control',
            multi: true
        });
            
    var wmsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
        title: 'shoreline-identify-control',
        layers: [],
        queryVisible: true,
        output : 'features',
        drillDown : true,
        maxFeatures : 1000,
        infoFormat : 'application/vnd.ogc.gml',
        vendorParams : {
            radius : 3
        }
    })
    
    wmsGetFeatureInfoControl.events.register("getfeatureinfo", this, CONFIG.ui.showShorelineInfo);
            
    me.map.addLayer(new OpenLayers.Layer.XYZ("ESRI World Imagery",
        "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}",
        {
            sphericalMercator: true,
            isBaseLayer: true,
            numZoomLevels : 20
        }
        ));
    
    me.map.addLayer(drawLayer);
    me.map.addControl(baselineDrawControl);
    me.map.addControl(wmsGetFeatureInfoControl);
    me.map.addControl(new OpenLayers.Control.MousePosition());
    me.map.addControl(new OpenLayers.Control.ScaleLine({
        geodesic : true
    }));
    
    wmsGetFeatureInfoControl.activate();
    
    me.map.zoomToMaxExtent();
    
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
