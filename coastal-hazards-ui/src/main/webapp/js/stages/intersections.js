var Intersections = {
    stage : 'intersections',
    reservedColor : '#7570B3',
    suffixes : ['_intersects'],
    description : 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.',
    calcIntersections : function() {
        var visibleShorelines = $('#shorelines-list :selected').map(function(i,v){
            return v.value
        })
        var transects = $('#transects-list :selected')[0].value;
        
        var request = Intersections.createWPSCalculateIntersectionsRequest({
            shorelines : visibleShorelines,
            transects : transects
        })
        
        CONFIG.ows.executeWPSProcess({
            processIdentifier : 'gs:CalculateIntersections',
            request : request,
            context : this,
            callbacks : [
            function(data, textStatus, jqXHR, context) {
                if (typeof data == 'string') {
                    CONFIG.ows.getWMSCapabilities({
                        namespace : CONFIG.tempSession.getCurrentSessionKey(),
                        callbacks : {
                            success : [
                            Intersections.populateFeaturesList,
                            function() {
                                $('#intersections-list').val(data);
                                Intersections.listboxChanged();
                                $('a[href="#' + Intersections.stage + '-view-tab"]').tab('show');
                                CONFIG.ui.showAlert({
                                    message : 'Intersection creation succeeded.',
                                    displayTime : 7500,
                                    caller : Intersections,
                                    style: {
                                        classes : ['alert-success']
                                    }
                                })
                            }      
                            ]
                        }
                    })
                } else {
                    LOG.error($(data).find('ows\\:ExceptionText').first().text());
                    CONFIG.ui.showAlert({
                        message : 'Intersection creation failed. Check logs.',
                        displayTime : 7500,
                        caller : Intersections,
                        style: {
                            classes : ['alert-error']
                        }
                    })
                }
            }
            ]
        })
        
    },
    populateFeaturesList : function() {
        CONFIG.ui.populateFeaturesList({
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
        var intersections = new OpenLayers.Layer.WMS(
            args.title, 
            'geoserver/ows',
            {
                layers : args.name,
                transparent : true,
                sld_body : Intersections.createSLDBody({
                    layerName : args.name
                })
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
    },
    createWPSCalculateIntersectionsRequest : function(args) {
        var shorelines = args.shorelines || [];
        var transects = args.transects || '';
        var farthest = $('#create-intersections-nearestfarthest-list').val();
        var wps = '<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">' + 
        '<ows:Identifier>gs:CalculateIntersections</ows:Identifier>' + 
        '<wps:DataInputs>';
    
        shorelines.each(function(i, shoreline) {
            var sessionLayer = CONFIG.tempSession.getStageConfig({
                name : shoreline,
                stage : Shorelines.stage
            })
            var excludedDates = sessionLayer.view['dates-disabled'];
            var prefix = sessionLayer.name.split(':')[0];
            
            wps += '<wps:Input>' + 
            '<ows:Identifier>shorelines</ows:Identifier>' + 
            '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">' + 
            '<wps:Body>' + 
            '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:'+prefix+'="gov.usgs.cida.ch.' + prefix + '">' +
            
            (function(args) {
                var filter = '';
                if (excludedDates) {
                    var property = args.shoreline.substring(0, args.shoreline.indexOf(':') + 1) + sessionLayer.groupingColumn;
                    
                    filter += '<wfs:Query typeName="'+shoreline+'" srsName="EPSG:4326">' +
                    '<ogc:Filter>' + 
                    '<ogc:And>';
                    
                    excludedDates.each(function(date) {
                        filter += '<ogc:Not>' + 
                        '<ogc:PropertyIsLike  wildCard="*" singleChar="." escape="!">' + 
                        '<ogc:PropertyName>'+property+ '</ogc:PropertyName>' + 
                        '<ogc:Literal>' +date+ '</ogc:Literal>' + 
                        '</ogc:PropertyIsLike>' + 
                        '</ogc:Not>' 
                    })
                    
                    filter += '</ogc:And>' + 
                '</ogc:Filter>' + 
                '</wfs:Query>';
                } else {
                    filter += '<wfs:Query typeName="'+shoreline+'" srsName="EPSG:4326" />';
                }
                return filter;
            }({ 
                shoreline : shoreline
            })) + 
            '</wfs:GetFeature>' + 
            '</wps:Body>' + 
            '</wps:Reference>' + 
            '</wps:Input>';
        })
        
        wps += '<wps:Input>' + 
        '<ows:Identifier>transects</ows:Identifier>' + 
        '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">' + 
        '<wps:Body>' + 
        '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:'+transects.split(':')[0]+'="gov.usgs.cida.ch.'+transects.split(':')[0]+'">' + 
        '<wfs:Query typeName="'+transects+'" srsName="EPSG:4326" />' + 
        '</wfs:GetFeature>' + 
        '</wps:Body>' + 
        '</wps:Reference>' + 
        '</wps:Input>' +
        '<wps:Input>' + 
        '<ows:Identifier>farthest</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+farthest+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +   
        '<wps:Input>' + 
        '<ows:Identifier>workspace</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+CONFIG.tempSession.getCurrentSessionKey()+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +     
        '<wps:Input>' + 
        '<ows:Identifier>store</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>ch-input</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +      
        '<wps:Input>' + 
        '<ows:Identifier>layer</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+transects.split(':')[1].replace('_transects', '') + Intersections.suffixes[0] +'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +    
        '</wps:DataInputs>' + 
        '<wps:ResponseForm>' + 
        '<wps:RawDataOutput>' + 
        '<ows:Identifier>intersections</ows:Identifier>' + 
        '</wps:RawDataOutput>' + 
        '</wps:ResponseForm>' + 
        '</wps:Execute>';

        return wps;
        
    }
    
}