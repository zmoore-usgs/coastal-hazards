var sld;
function complete(req) {
	var format = new OpenLayers.Format.SLD();
	sld = format.read(req.responseXML || req.responseText);
}

var addShorelines = function() {
	var coloredShorelines = Object.extended({});
	
	var colorFeatures = function(divId) {
		return function(event) {
			var wasEmpty = Object.isEmpty(coloredShorelines);
			event.features.each(function(el, i, arr) {
				var index;
				if (coloredShorelines.hasOwnProperty(el.attributes.Date_)) {
					index = coloredShorelines[el.attributes.Date_];
				} else {
					index = i % SHORELINE_COLORS.length;
					coloredShorelines[el.attributes.Date_] = index;
				}
				el.style = {
						strokeWidth: 2,
						strokeColor: SHORELINE_COLORS[index]
					};
			});
			event.object.redraw();
			this.map.zoomToExtent(this.getDataExtent());
			
			var html = [];
			html.push("<h4>Color Legend (REMOVE_ME!)</h4><table class='table'><thead><tr><td>Date</td><td>color</td></tr></thead><tbody>");
			coloredShorelines.each(function(key, val) {
				html.push("<tr><td>" + key + "</td><td style='background-color:" + SHORELINE_COLORS[val] + ";'>" + SHORELINE_COLORS[val] + "</td></tr>");
			})
			
			html.push("</tbody></table>");
			
			if (!wasEmpty) {
				$("#color-legend").html(html.join(''));
			}
		};
	};
	
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
	layer[1].events.register("featuresadded", null, colorFeatures("WFS1"));
//	layer[1] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
//        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
//        {
//            layers: 'upload:ASIS_2009_2012',
//			transparent : true
//        }, {
//			isBaseLayer : false
//		} );
    map.addLayer(layer[1]);
	
	layer[2] = new OpenLayers.Layer.Vector("WFS2", {
                strategies: [new OpenLayers.Strategy.BBOX()],
                protocol: new OpenLayers.Protocol.WFS({
                    url:  "http://localhost:8080/coastal-hazards-geoserver/upload/wfs",
                    featureType: "NASC_shorelines",
                    featureNS: "gov.usgs.cida.gdp.upload",
					geometryName: "the_geom"
                })
            });
	layer[2].events.register("featuresadded", null, colorFeatures("WFS2"));
	
//	layer[2] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
//        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
//        {
//            layers: 'upload:NASC_shorelines',
//			transparent : true
//        }, {
//			isBaseLayer : false
//		} );
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


var calcTransects = function() {
//	var layer = new OpenLayers.Layer.Vector("WFS4", {
//                strategies: [new OpenLayers.Strategy.BBOX()],
//                protocol: new OpenLayers.Protocol.WFS({
//                    url:  "http://localhost:8080/coastal-hazards-geoserver/upload/wfs",
//                    featureType: "DE_to_VA_SCE_clip",
//                    featureNS: "gov.usgs.cida.gdp.upload",
//					geometryName: "the_geom"
//                })
//            });
//	layer.events.register("featuresadded", null, function() {
//		this.map.zoomToExtent(this.getDataExtent());
//	});
	
	var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
        {
            layers: 'upload:DE_to_VA_SCE_clip',
			transparent : true
        }, {
			isBaseLayer : false
		} );

	
    map.addLayer(layer);
	
};
var makeDots = function() {
//	var layer = new OpenLayers.Layer.Vector("WFS5", {
//                strategies: [new OpenLayers.Strategy.BBOX()],
//                protocol: new OpenLayers.Protocol.WFS({
//                    url:  "http://localhost:8080/coastal-hazards-geoserver/upload/wfs",
//                    featureType: "DE_to_VA_intersects",
//                    featureNS: "gov.usgs.cida.gdp.upload",
//					geometryName: "the_geom"
//                })
//            });
//	layer.events.register("featuresadded", null, function() {
//		this.map.zoomToExtent(this.getDataExtent());
//	});
	
	var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
        "http://localhost:8080/coastal-hazards-geoserver/upload/wms",
        {
            layers: 'upload:DE_to_VA_intersects',
			transparent : true
        }, {
			isBaseLayer : false
		} );

	
    map.addLayer(layer);
	
};