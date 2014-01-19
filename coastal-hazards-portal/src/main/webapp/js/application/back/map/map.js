/*jslint browser: true */
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global OpenLayers*/
CCH.Objects.Map = function (args) {
    "use strict";
    var me = (this === window) ? {} : this;

    me.attributionSource = CCH.CONFIG.contextPath + '/images/openlayers/usgs.svg';
    
    me.addLayer = function (layer) {
        CCH.CONFIG.map.addLayer(layer);
    };

    me.addLayers = function (layers) {
        layers = layers || [];
        CCH.CONFIG.map.addLayers(layers);
    };
    
    me.showLayer = function (args) {
        var card = args.card,
            item = args.item,
            id = card ? card.id : item.id,
            ribbonIndex = args.ribbon || 0,
            layerName = id,
            layer;

        if (ribbonIndex !== 0) {
            if (layerName.indexOf('ribbon') === -1) {
                layerName = layerName + '_r_' + ribbonIndex;
            }
        }

       layer = CCH.CONFIG.map.getLayersByName(layerName)[0];

        if (!layer) {
            if (card) {
                layer = card.layer;
            } else if (item && 'function' === typeof item.getWmsLayer) {
                layer = item.getWmsLayer();
            }
        }

        if (ribbonIndex !== 0 && layer.params.SLD.indexOf('ribbon') === -1) {
            layer.name = layerName;
            layer.params.SLD = layer.params.SLD + '?ribbon=' + ribbonIndex;
            layer.params.buffer = (ribbonIndex - 1) * 6;
            layer.singleTile = true;
        }

        CCH.CONFIG.map.addLayer(layer);
        
        layer.setVisibility(true);
        $(window).trigger('cch.map.shown.layer', {
            layer : layer
        });
        return layer;
    };

    me.buildMap = function() {
        // Buffer the bounds of the layer by 10 degrees in each direction for the 
        // restricted extend
        var originalBounds = new OpenLayers.Bounds(CCH.CONFIG.item.bbox),
            extendedBounds = new OpenLayers.Bounds([
                originalBounds.left - Math.abs(originalBounds.left * 0.1),
                originalBounds.bottom - Math.abs(originalBounds.bottom * 0.1),
                originalBounds.right + Math.abs(originalBounds.right * 0.1),
                originalBounds.top + Math.abs(originalBounds.top * 0.1)
            ]),
            bounds,
            attributionControl;

        originalBounds.extend(extendedBounds);
        bounds = originalBounds.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857'));

        CCH.CONFIG.map = new OpenLayers.Map('map', {
            projection: CCH.CONFIG.projection,
            displayProjection: new OpenLayers.Projection(CCH.CONFIG.projection),
            restrictedExtent: bounds
        });

        CCH.CONFIG.map.addLayer(new OpenLayers.Layer.XYZ("Light Gray Base",
                "http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}",
                {
                    sphericalMercator: true,
                    isBaseLayer: true,
                    numZoomLevels: 17,
                    wrapDateLine: true
                }
        ));

        attributionControl = new OpenLayers.Control.Attribution({
            'template' : '<a id="attribution-link" href="http://www.usgs.gov/"><img id="openlayers-map-attribution-image" src="' + me.attributionSource + '" /></a>'
        });

		CCH.CONFIG.map.zoomToExtent(new OpenLayers.Bounds(CCH.CONFIG.item.bbox).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857')));
        CCH.CONFIG.map.addControl(attributionControl);
        
        $('a').click(function(event) {
            ga('send', 'event', {
                'eventCategory': 'link',   // Required.
                'eventAction': 'clicked',      // Required.
                'eventLabel': event.target.href
            });
        });
	};
    
    return me;
    
};
