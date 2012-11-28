$(document).ready(function() {
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : 'info'
    });
    map = new OpenLayers.Map( 'map' );
    layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
        "http://vmap0.tiles.osgeo.org/wms/vmap0",
        {
            layers: 'basic'
        } );
    map.addLayer(layer);
    map.zoomToMaxExtent();
})