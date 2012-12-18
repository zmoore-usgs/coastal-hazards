var Transects = {
    calcTransects : function() {
        var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
            "geoserver/sample/wms",
            {
                layers: 'sample:DE_to_VA_rates',
                transparent : true
            }, {
                isBaseLayer : false
            } );

	
        map.getMap().addLayer(layer);
	
    },
    populateFeatureList : function(caps) {
        ui.populateFeatureList(caps, 'transects');
    }
}