$(document).ready(function() {
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : 'info'
    });
    map = new OpenLayers.Map( 'map' );
	var layer = [];
    layer[0] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
        "http://vmap0.tiles.osgeo.org/wms/vmap0",
        {
            layers: 'basic'
        } );
    map.addLayer(layer[0]);
	
    map.zoomToMaxExtent();
	
	map.addControl(new OpenLayers.Control.MousePosition());
	
	
	
	$("#upload-shorelines-btn").on("click", addShorelines);
	$("#upload-baseline-btn").on("click", addBaseline);
})