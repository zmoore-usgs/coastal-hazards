var Baseline = {
    
    addBaseline : function() {
        var layer = [];
        layer[3] = new OpenLayers.Layer.Vector("WFS3", {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.WFS({
                url:  "geoserver/sample/wfs",
                featureType: "baseline",
                featureNS: CONFIG.namespace.sample,
                geometryName: "the_geom"
            }),
            styleMap: new OpenLayers.StyleMap(sld.namedLayers["Simple Line"]["userStyles"][0])
        });
        layer[3].events.register("featuresadded", null, function() {
            this.map.zoomToExtent(this.getDataExtent());
        });
	
        map.getMap().addLayer(layer[3]);
    }

}