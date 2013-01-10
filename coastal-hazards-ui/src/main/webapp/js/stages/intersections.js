var Intersections = {
    stage : 'intersections',
    reservedColor : '#7570B3',
    suffixes : ['_intersects'],
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
	
    },
    populateFeatureList : function(caps) {
        CONFIG.ui.populateFeaturesList({
            caps : caps, 
            caller : Intersections
        });
    },
    listboxChanged : function() {
        LOG.info('Intersections.js::listboxChanged: Intersections listbox changed');
        $("#intersections-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.value);
            if (layers.length) {
                $(layers).each(function(i,l) {
                    CONFIG.map.getMap().removeLayer(l, false);
                    var stageConfig = CONFIG.tempSession.getStageConfig({
                        stage : Intersections.stage,
                        name : l.name
                    })
                    stageConfig.view.isSelected = false;
                    CONFIG.tempSession.setStageConfig({
                        stage : Intersections.stage,
                        config : stageConfig
                    })
                })
            }
        });
        if ($("#intersections-list option:selected")[0].value) {
            var name = $("#intersections-list option:selected")[0].value; 
            Intersections.addIntersections({
                name : name
            })
            var stageConfig = CONFIG.tempSession.getStageConfig({
                stage : Intersections.stage,
                name : name
            })
            stageConfig.view.isSelected = true;
            CONFIG.tempSession.setStageConfig({
                stage : Intersections.stage,
                config : stageConfig
            })
        }
    },
    addIntersections : function(args) {
        //        var intersections = new OpenLayers.Layer.Vector(args.name, {
        //            strategies: [new OpenLayers.Strategy.BBOX()],
        //            protocol: new OpenLayers.Protocol.WFS({
        //                version: '1.1.0',
        //                url:  "geoserver/ows",
        //                featureType: args.name.split(':')[1], 
        //                featureNS: CONFIG.namespace[args.name.split(':')[0]],
        //                geometryName: "the_geom",
        //                srsName: CONFIG.map.getMap().getProjection()
        //            }),
        //            styleMap: new OpenLayers.StyleMap({
        //                "default": new OpenLayers.Style({
        //                    strokeColor: Intersections.reservedColor,
        //                    strokeWidth: 2
        //                })
        //            }),
        //            type : 'transects'
        //        });

        var intersections = new OpenLayers.Layer.WMS(
            args.title, 
            'geoserver/ows',
            {
                layers : args.name,
                transparent : true,
                sld_body : Intersections.createSLDBody({ layerName : args.name })
            },
            {
                isBaseLayer : false,
                unsupportedBrowsers: [],
                tileOptions: {
                    // http://www.faqs.org/rfcs/rfc2616.html
                    // This will cause any request larger than this many characters to be a POST
                    maxGetUrlLength: 2048
                },
                singleTile: true, 
                ratio: 1
            });
	
        CONFIG.map.getMap().addLayer(intersections);
        
        var stageConfig = CONFIG.tempSession.getStageConfig({
            stage : Intersections.stage,
            name : args.name
        })
        stageConfig.view.isSelected = false;
        CONFIG.tempSession.setStageConfig({
            stage : Intersections.stage,
            config : stageConfig
        })
    },
    createSLDBody : function(args) {
        var sldBody = '';
        
        sldBody += '<?xml version="1.0" encoding="ISO-8859-1"?>' + 
        '<StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + 
        '<NamedLayer>' +
        '<Name>' + args.layerName + '</Name>' + 
        '<UserStyle>' + 
        '<FeatureTypeStyle>' + 
        '<Rule>' + 
        '<PointSymbolizer>' + 
        '<Graphic>' + 
        '<Mark>' + 
        '<WellKnownName>circle</WellKnownName>' + 
        '<Fill>' + 
        '<CssParameter name="fill">' + Intersections.reservedColor + '</CssParameter>' + 
        '</Fill>' + 
        '<Stroke>' + 
        '<CssParameter name="stroke">#000000</CssParameter>' + 
        '<CssParameter name="stroke-width">2</CssParameter>' + 
        '</Stroke>' + 
        '</Mark>' + 
        '<Size>6</Size>' + 
        '</Graphic>' + 
        '</PointSymbolizer>' + 
        '</Rule>' + 
        '</FeatureTypeStyle>' +
        '</UserStyle>' + 
        '</NamedLayer>' + 
        '</StyledLayerDescriptor>'
    
        
        return sldBody;
    }
    
}