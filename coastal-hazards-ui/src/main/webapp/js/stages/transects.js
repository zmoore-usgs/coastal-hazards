var Transects = {
    stage : 'transects',
    suffixes : ['_lt','_st','_transects'],
    reservedColor : '#FF0033',
    defaultSpacing : 500,
    description : 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    addTransects : function(args) {
        var transects = new OpenLayers.Layer.Vector(args.name, {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.WFS({
                version: '1.1.0',
                url:  "geoserver/"+args.name.split(':')[0]+"/wfs",
                featureType: args.name.split(':')[1], 
                featureNS: CONFIG.namespace[args.name.split(':')[0]],
                geometryName: "the_geom",
                srsName: CONFIG.map.getMap().getProjection()
            }),
            styleMap: new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    strokeColor: Transects.reservedColor,
                    strokeWidth: 2
                })
            }),
            type : 'transects'
        });
	
        CONFIG.map.getMap().addLayer(transects);
        
        var stageConfig = CONFIG.tempSession.getStageConfig({
            stage : Transects.stage,
            name : args.name
        })
        stageConfig.view.isSelected = false;
        CONFIG.tempSession.setStageConfig({
            stage : Transects.stage,
            config : stageConfig
        })
    },
    removeTransects : function() {
        CONFIG.map.getMap().getLayersBy('type', 'transects').each(function(layer) {
            CONFIG.map.getMap().removeLayer(layer, false);
            var stageConfig = CONFIG.tempSession.getStageConfig({
                stage : Transects.stage,
                name : layer.name
            })
            stageConfig.view.isSelected = false;
            CONFIG.tempSession.setStageConfig({
                stage : Transects.stage,
                config : stageConfig
            })
        })
    },
    populateFeaturesList : function() {
        CONFIG.ui.populateFeaturesList({
            caller : Transects
        });
    } ,       
    listboxChanged : function() {
        LOG.info('Transects.js::listboxChanged: Transect listbox changed');
        $("#transects-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.value);
            if (layers.length) {
                $(layers).each(function(i,l) {
                    CONFIG.map.getMap().removeLayer(l, false);
                    var stageConfig = CONFIG.tempSession.getStageConfig({
                        stage : Transects.stage,
                        name : l.name
                    })
                    stageConfig.view.isSelected = false;
                    CONFIG.tempSession.setStageConfig({
                        stage : Transects.stage,
                        config : stageConfig
                    })
                })
            }
        });
        if ($("#transects-list option:selected")[0].value) {
            var name = $("#transects-list option:selected")[0].value; 
            Transects.addTransects({
                name : name
            })
            var stageConfig = CONFIG.tempSession.getStageConfig({
                stage : Transects.stage,
                name : name
            })
            stageConfig.view.isSelected = true;
            CONFIG.tempSession.setStageConfig({
                stage : Transects.stage,
                config : stageConfig
            })
        }
    },
    enableCreateTransectsButton : function() {
        LOG.info('Transects.js::enableCreateTransectsButton: Baseline has been added to the map. Enabling create transect button');
        $('#create-transects-toggle').removeAttr('disabled')
        
    },
    disableCreateTransectsButton : function() {
        LOG.info('Transects.js::disableCreateTransectsButton: No valid baseline on the map. Disabling create transect button');
        $('#create-transects-toggle').attr('disabled', 'disabled');
         
    },
    createTransectsButtonToggled : function(event) {
        LOG.info('Transects.js::createTransectsButtonToggled: Transect creation Button Clicked');
        var toggledOn = $(event.currentTarget).hasClass('active') ? false : true;
        
        if (toggledOn) {
            $('#transects-list').val('');
        //            $('#create-transects-input-name').val(Util.getRandomLorem());
        } else {
            
        // Hide transect layer if needed
        }
        $('#create-transects-panel-well').toggleClass('hidden');
    },
    createTransectSubmit : function(event) {
        var visibleShorelines = $('#shorelines-list :selected').map(function(i,v){
            return v.value
        })
        var visibleBaseline = $('#baseline-list :selected')[0].value;
        var spacing = $('#create-transects-input-spacing').val() || 0;
        var layerName = $('#create-transects-input-name').val();
        var request = Transects.createWPSGenerateTransectsRequest({
            shorelines : visibleShorelines,
            baseline : visibleBaseline,
            spacing : spacing,
            layer : layerName + '_transects'
        })
        
        var wpsProc = function() {
            CONFIG.ows.executeWPSProcess({
                processIdentifier : 'gs:GenerateTransects',
                request : request,
                context : this,
                callbacks : [
                // TODO- Error Checking for WPS process response!
                function(data, textStatus, jqXHR, context) {
                    if (typeof data == 'string') {
                        CONFIG.ows.getWMSCapabilities({
                            namespace : CONFIG.tempSession.getCurrentSessionKey(),
                            callbacks : {
                                success : [
                                Transects.populateFeaturesList,
                                function() {
                                    CONFIG.ui.showAlert({
                                        message : 'Transect calculation succeeded.',
                                        displayTime : 7500,
                                        caller : Transects,
                                        style: {
                                            classes : ['alert-success']
                                        }
                                    })
                                    $('#transects-list').val(data);
                                    $('#transects-list').trigger('change');
                                    $('a[href="#' + Transects.stage + '-view-tab"]').tab('show');
                                }                        
                                ]
                            }
                        })
                    } else {
                        LOG.error($(data).find('ows\\:ExceptionText').first().text());
                        CONFIG.ui.showAlert({
                            message : 'Transect calculation failed. Check logs.',
                            displayTime : 7500,
                            caller : Transects,
                            style: {
                                classes : ['alert-error']
                            }
                        })
                    }
                }
                ]
            })
        }
        
        // Check if transects already exists in the select list
        if ($('#transects-list option[value="'+ CONFIG.tempSession.getCurrentSessionKey() + ':' + layerName + '_transects"]').length) {
            CONFIG.ui.createModalWindow({
                context : {
                    scope : this
                },
                headerHtml : 'Resource Exists',
                bodyHtml : 'A resource already exists with the name ' + layerName + ' in your session. Would you like to overwrite this resource?',
                buttons : [
                {
                    text : 'Overwrite',
                    callback : function(event) {
                        $.get('service/session', {
                            action : 'remove-layer',
                            workspace : CONFIG.tempSession.getCurrentSessionKey(),
                            store : 'ch-input',
                            layer : layerName + '_transects'
                        },
                        function(data, textStatus, jqXHR) {
                            wpsProc();
                        }, 'json')
                    }           
                }
                ]
            })
        } else {
            wpsProc();
        }
        
        
    },
    createWPSGenerateTransectsRequest : function(args) {
        var shorelines = args.shorelines;
        var baseline = args.baseline;
        var spacing = args.spacing ? args.spacing : Transects.defaultSpacing;
        var layer = args.layer;
        
        var request = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">' + 
        '<ows:Identifier>gs:GenerateTransects</ows:Identifier>' + 
        '<wps:DataInputs>';
        shorelines.each(function(i, shoreline) {
            var sessionLayer = CONFIG.tempSession.getStageConfig({
                name : shoreline,
                stage : Shorelines.stage
            })
            var excludedDates = sessionLayer.view['dates-disabled'];
            var prefix = sessionLayer.name.split(':')[0];
            request += '<wps:Input>' + 
            '<ows:Identifier>shorelines</ows:Identifier>' + 
            '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">' + 
            '<wps:Body>' + 
            '<wfs:GetFeature service="WFS" version="1.1.0" outputFormat="GML2" xmlns:'+prefix+'="gov.usgs.cida.ch.' + prefix + '">' + 
            
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
                shoreline : shoreline,
                layer : layer
            })) + 
            '</wfs:GetFeature>' + 
            '</wps:Body>' + 
            '</wps:Reference>' + 
            '</wps:Input>';
        })
        request += '<wps:Input>' + 
        '<ows:Identifier>baseline</ows:Identifier>' + 
        '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">' + 
        '<wps:Body>' + 
        '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:'+baseline.split(':')[0]+'="gov.usgs.cida.ch.'+baseline.split(':')[0]+'">' + 
        '<wfs:Query typeName="'+baseline+'" srsName="EPSG:4326" />' + 
        '</wfs:GetFeature>' + 
        '</wps:Body>' + 
        '</wps:Reference>' + 
        '</wps:Input>' + 
        '<wps:Input>' + 
        '<ows:Identifier>spacing</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+ spacing +'</wps:LiteralData>' + 
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
        '<wps:LiteralData>'+layer+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +     
        '</wps:DataInputs>' + 
        '<wps:ResponseForm>' +
        '<wps:RawDataOutput>' + 
        '<ows:Identifier>result</ows:Identifier>' + 
        '</wps:RawDataOutput>' + 
        '</wps:ResponseForm>' + 
        '</wps:Execute>';
        return request;
    },
    initializeUploader : function(args) {
        CONFIG.ui.initializeUploader($.extend({
            caller : Transects
        }, args))
    }
}