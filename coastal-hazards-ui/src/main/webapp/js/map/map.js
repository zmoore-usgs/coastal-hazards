var Map = function() {
    var me = (this === window) ? {} : this;
    
    OpenLayers.Request.GET({
        url: "pages/index/sld-shorelines.xml",
        success: function(req) {
            var format = new OpenLayers.Format.SLD();
            sld = format.read(req.responseXML || req.responseText);
        }
    });
    
    me.map = new OpenLayers.Map( 'map', {
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
	
    me.map.addLayer(layer["sat"]);
	
    me.map.zoomToMaxExtent();
	
    me.map.addControl(new OpenLayers.Control.MousePosition());
    
    return $.extend(me, {
        getMap : function() {
            return me.map;
        }
    });
}
