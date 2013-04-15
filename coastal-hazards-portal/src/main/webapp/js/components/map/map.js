var Map = function() {
    LOG.info('Map.js::constructor:Map class is initializing.');
    var me = (this === window) ? {} : this;
    var initialExtent = [-15381395.046388,4320929.1906812,-5969245.1327744,7060432.2840406 ];
    
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
    
    me.map.addLayer(new OpenLayers.Layer.Markers('marker-layer'));
    
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
		}
    });
};
