var sld;
function complete(req) {
	var format = new OpenLayers.Format.SLD();
	sld = format.read(req.responseXML || req.responseText);
}

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
                })
            });
	layer[1].events.register("featuresadded", null, function(event) {
		
		event.features.each(function(el, i, arr) {
			el.style = {
                    strokeWidth: 3,
                    strokeColor: SHORELINE_COLORS[i % SHORELINE_COLORS.length]
                }
		});
		event.object.redraw();
		this.map.zoomToExtent(this.getDataExtent());
	});
//	layer[1] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
//        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
//        {
//            layers: 'upload:ASIS_2009_2012',
//			transparent : true
//        }, {
//			isBaseLayer : false
//		} );
    map.addLayer(layer[1]);
	
//	layer[2] = new OpenLayers.Layer.Vector("WFS2", {
//                strategies: [new OpenLayers.Strategy.BBOX()],
//                protocol: new OpenLayers.Protocol.WFS({
//                    url:  "http://localhost:8080/coastal-hazards-geoserver/upload/wfs",
//                    featureType: "NASC_shorelines",
//                    featureNS: "gov.usgs.cida.gdp.upload",
//					geometryName: "the_geom"
//                }),
//                styleMap: new OpenLayers.StyleMap(sld.namedLayers["Simple Line"]["userStyles"][0])
//            });
//	layer[2].events.register("featuresadded", null, function() {
//		this.map.zoomToExtent(this.getDataExtent());
//	});
	
//	layer[2] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
//        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
//        {
//            layers: 'upload:NASC_shorelines',
//			transparent : true
//        }, {
//			isBaseLayer : false
//		} );
//    map.addLayer(layer[2]);
	
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
                styleMap: new OpenLayers.StyleMap(sld.namedLayers["Simple Line"]["userStyles"][0])
            });
	layer[3].events.register("featuresadded", null, function() {
		this.map.zoomToExtent(this.getDataExtent());
	});
	
//	layer[3] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
//        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
//        {
//            layers: 'upload:baseline',
//			transparent : true
//        }, {
//			isBaseLayer : false
//		} );

	
    map.addLayer(layer[3]);
	
	
	
};