var Intersections = {
    reservedColor : '#7570B3',
    calcIntersections : function() {
        var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
            "geoserver/sample/wms",
            {
                layers: 'sample:DE_to_VA_intersects',
                transparent : true
            }, {
                isBaseLayer : false
            } );

	
        CONFIG.map.getMap().addLayer(layer);
	
    }
}