/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var addShorelines = function() {
	var layer = [];
	layer[1] = new OpenLayers.Layer.Vector("WFS1", {
                strategies: [new OpenLayers.Strategy.BBOX()],
                protocol: new OpenLayers.Protocol.WFS({
                    url:  "http://localhost:8080/coastal-hazards-geoserver/upload/wfs",
                    featureType: "ASIS_2009_2012",
                    featureNS: "gov.usgs.cida.gdp.upload",
					geometryName: "the_geom"
                }),
                styleMap: new OpenLayers.StyleMap({
                    strokeWidth: 1,
                    strokeColor: "#FF0000"
                }),
				renderers : ["Canvas"]
            });
//	layer[1] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
//        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
//        {
//            layers: 'upload:ASIS_2009_2012',
//			transparent : true
//        }, {
//			isBaseLayer : false
//		} );
	layer[1].events.register("featuresadded", null, function() {
		this.map.zoomToExtent(this.getDataExtent());
	});
    map.addLayer(layer[1]);
	
	layer[2] = new OpenLayers.Layer.Vector("WFS2", {
                strategies: [new OpenLayers.Strategy.BBOX()],
                protocol: new OpenLayers.Protocol.WFS({
                    url:  "http://localhost:8080/coastal-hazards-geoserver/upload/wfs",
                    featureType: "NASC_shorelines",
                    featureNS: "gov.usgs.cida.gdp.upload",
					geometryName: "the_geom"
                }),
                styleMap: new OpenLayers.StyleMap({
                    strokeWidth: 1,
                    strokeColor: "#00FF00"
                }),
				renderers : ["Canvas"]
            });
//	layer[2] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
//        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
//        {
//            layers: 'upload:NASC_shorelines',
//			transparent : true
//        }, {
//			isBaseLayer : false
//		} );
	layer[2].events.register("featuresadded", null, function() {
		this.map.zoomToExtent(this.getDataExtent());
	});
    map.addLayer(layer[2]);
	
};

var addBaseline = function() {
	var layer = [];
	layer[3] = new OpenLayers.Layer.Vector("WFS3", {
                strategies: [new OpenLayers.Strategy.BBOX()],
                protocol: new OpenLayers.Protocol.WFS({
                    url:  "http://localhost:8080/coastal-hazards-geoserver/upload/wfs",
                    featureType: "baseline",
                    featureNS: "gov.usgs.cida.gdp.upload",
					geometryName: "the_geom"
                }),
                styleMap: new OpenLayers.StyleMap({
                    strokeWidth: 3,
                    strokeColor: "#000000"
                }),
				renderers : ["Canvas"]
            });
//	layer[3] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
//        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
//        {
//            layers: 'upload:baseline',
//			transparent : true
//        }, {
//			isBaseLayer : false
//		} );

	layer[3].events.register("featuresadded", null, function() {
		this.map.zoomToExtent(this.getDataExtent());
	});
    map.addLayer(layer[3]);
	
	
	
};