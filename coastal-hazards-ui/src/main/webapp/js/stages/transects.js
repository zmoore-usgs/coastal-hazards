var Transects = {
    stage : 'transects',
    suffixes : ['_lt','_st','_transects'],
    reservedColor : '#D95F02',
    defaultSpacing : 500,
    description : {
        'stage' : 'Select existing transects, or generate new transects from the workspace baseline. Transects are rays that are projected from the baseline, and the intersections between shorelines and transects are used to calculate rates of erosion and deposition.',
        'view-tab' : 'Select a published collection of shorelines to add to the workspace.',
        'manage-tab' : 'Upload a new collection of transects to the workspace, generate new transects, or edit existing transects.',
        'upload-button' : 'Upload a zipped shapefile which contains a collection of transects.',
        'calculate-button' : 'Choose transect spacing and generate a new transects layer from the workspace baseline.'
    },
    appInit : function() {
        $('#transect-edit-form-toggle').on('click', Transects.editButtonToggled);
        $('#create-transects-toggle').on('click', Transects.createTransectsButtonToggled);
        $('#create-transects-input-button').on('click', Transects.createTransectSubmit);
        $('#transects-edit-add-button').on('click', Transects.addTransect);
        
        $('#create-transects-button').popover({
            title : Transects.stage.capitalize() + ' Generate',
            content : $('<div />')
            .append($('<div />').html(Transects.description['calculate-button']))
            .html(),
            html : true,
            placement : 'bottom',
            trigger : 'hover',
            delay : {
                show : CONFIG.popupHoverDelay
            }
        })
        
        Transects.initializeUploader();  
        
        CONFIG.map.addControl(new OpenLayers.Control.SelectFeature([], {
            title : 'transects-select-control',
            autoActivate : false,
            box : true,
            onSelect : function(feature) {
                LOG.debug('Transects.js::SelectFeature.onSelect(): A feature was selected');
                var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'transects-edit-control')[0];
                modifyControl.selectFeature(feature);
            },
            onUnselect : function(feature) {
                LOG.debug('Transects.js::SelectFeature.onSelect(): A feature was unselected');
                CONFIG.ui.initializeBaselineEditForm();
                var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'transects-edit-control')[0];
                modifyControl.unselectFeature(feature);
            }
        }));
        
    },
    
    leaveStage : function() {
        if ($('#transect-edit-form-toggle').hasClass('active')) {
            $('#transect-edit-form-toggle').trigger('click');
        }
        var control = CONFIG.map.getMap().getControlsBy('title', 'transects-select-control')[0];
        if (control.length) {
            control[0].deactivate();
        }
        
        CONFIG.map.removeControl({
            id : 'transects-draw-control'
        });
    },
    enterStage : function() {
        
    },
    
    editButtonToggled : function(event) {
        LOG.info('Transects.js::editButtonToggled');
        
        var toggledOn = $(event.currentTarget).hasClass('active') ? false : true;
        if (toggledOn) {
            LOG.debug('Transects.js::editButtonToggled: Edit form was toggled on');
            
            if ($('#create-transects-toggle').hasClass('active')) {
                $('#create-transects-toggle').trigger('click');
            }
            
            LOG.trace('Transects.js::editButtonToggled: Attempting to clone current active transects layer into an edit layer');
            var originalLayer = CONFIG.map.getMap().getLayersByName($("#transects-list option:selected")[0].value)[0].clone();
            var oLayerPrefix = originalLayer.name.split(':')[0];
            var oLayerTitle = originalLayer.name.split(':')[1];
            var oLayerName = originalLayer.name;
            var clonedLayer = new OpenLayers.Layer.Vector('transects-edit-layer',{
                strategies: [new OpenLayers.Strategy.BBOX(), new OpenLayers.Strategy.Save()],
                protocol: new OpenLayers.Protocol.WFS({
                    version: "1.1.0",
                    url:  "geoserver/"+oLayerPrefix+"/wfs",
                    featureType: oLayerTitle,
                    featureNS: CONFIG.namespace[oLayerPrefix],
                    geometryName: "the_geom",
                    schema: "geoserver/"+oLayerPrefix+"/wfs/DescribeFeatureType?version=1.1.0&outputFormat=GML2&typename=" + oLayerName,
                    srsName: CONFIG.map.getMap().getProjection()
                }),
                cloneOf : oLayerName,
                renderers: CONFIG.map.getRenderer()
            })
            clonedLayer.addFeatures(originalLayer.features);
            
            var baselineLayer = CONFIG.map.getMap().getLayersByName($("#baseline-list option:selected")[0].value)[0];
            var snap = new OpenLayers.Control.Snapping({
                id: 'snap-control',
                layer: clonedLayer,
                targets: [baselineLayer],
                greedy: true
            });
            snap.activate();
            CONFIG.map.getMap().addControl(snap);
             
            LOG.debug('Transects.js::editButtonToggled: Adding cloned layer to map');
            
            CONFIG.map.getMap().addLayer(clonedLayer);
            
            LOG.debug('Transects.js::editButtonToggled: Adding clone control to map');
            var mfControl = new OpenLayers.Control.ModifyFeature(
                clonedLayer, 
                {
                    id : 'transects-edit-control',
                    deleteCodes : [8, 46, 48, 68],
                    standalone : true,
                    createVertices : false,
                    handleKeypress : function(evt) {
                        var code = evt.keyCode;
                        if(this.feature && OpenLayers.Util.indexOf(this.deleteCodes, code) != -1) {
                            var fid = this.feature.fid
                            var originalLayer = CONFIG.map.getMap().getLayersByName($("#transects-list option:selected")[0].value)[0];
                            var cloneLayer = CONFIG.map.getMap().getLayersByName('transects-edit-layer')[0];
                            var originalFeature = originalLayer.getFeatureBy('fid', fid)
                            var cloneFeature = cloneLayer.getFeatureBy('fid', fid);
                            cloneFeature.state = OpenLayers.State.DELETE;
                            cloneFeature.style = {
                                strokeOpacity : 0
                            }
                            originalFeature.style = {
                                strokeOpacity : 0
                            }
                            Transects.saveEditedLayer();
                        }
                    }
                })
            CONFIG.map.getMap().addControl(mfControl);
            mfControl.activate();
            mfControl.handlers.keyboard.activate();
            var selectControl = CONFIG.map.getMap().getControlsBy('title', 'transects-select-control')[0];
            
            selectControl.setLayer([clonedLayer]);
            selectControl.activate();
            
            $("#transects-edit-container").removeClass('hidden');
            $('#transects-edit-save-button').unbind('click', Transects.saveEditedLayer);
            $('#transects-edit-save-button').on('click', Transects.saveEditedLayer);
        } else {
            LOG.debug('Transects.js::editButtonToggled: Edit form was toggled off');
            $("#transects-edit-container").addClass('hidden');
            CONFIG.map.removeLayerByName('transects-edit-layer');
            CONFIG.map.removeControl({
                id : 'transects-edit-control'
            });
            CONFIG.map.getMap().getControlsBy('id', 'snap-control')[0].destroy();
            CONFIG.map.removeControl({
                id : 'snap-control'
            });
            
            CONFIG.map.removeControl({
                id : 'transects-draw-control'
            });
            CONFIG.map.getMap().getControlsBy('title', 'transects-select-control')[0].deactivate();
        }
    },   
    addTransect : function() {
        var cloneLayer = CONFIG.map.getMap().getLayersByName('transects-edit-layer')[0];
        CONFIG.map.getMap().getControlsBy('title', 'transects-select-control')[0].deactivate();
        var drawControl = new OpenLayers.Control.DrawFeature(
            cloneLayer,
            OpenLayers.Handler.Path,
            {
                id: 'transects-draw-control',
                multi: true,
                featureAdded : function(feature) {
                    // Find the baseline segment we touch
                    var f = feature;
                    var baseline =  CONFIG.map.getMap().getLayersByName($("#baseline-list option:selected")[0].value)[0];
                    var editLayer = CONFIG.map.getMap().getLayersBy('name', "transects-edit-layer")[0]
                    var features = editLayer.features
                    var sortedFeatures = features.sort(function(f){
                        return f.attributes.TransectID
                    })
                    var blTouchFeature = baseline.features.filter(
                        function(baselineFeature){ 
                            return baselineFeature.geometry.distanceTo(f.geometry) == 0
                        }
                        )
                    
                    // Apply the baseline orient to the new feature
                    if (blTouchFeature.length) {
                        feature.attributes.Orient = blTouchFeature[0].attributes.Orient
                    } else {
                        feature.attributes.Orient = 'seaward';
                    }
                    
                    // Add one to the largest sorted feature
                    feature.attributes.TransectID =  parseInt(sortedFeatures[sortedFeatures.length - 1].attributes.TransectID) + 1;
                }
            })
        CONFIG.map.addControl(drawControl);
        drawControl.activate();
    },
    saveEditedLayer : function() {
        LOG.debug('Baseline.js::saveEditedLayer: Edit layer save button clicked');
                
        var layer = CONFIG.map.getMap().getLayersByName('transects-edit-layer')[0];
        
        var saveStrategy = layer.strategies.find(function(n) {
            return n['CLASS_NAME'] == 'OpenLayers.Strategy.Save'
        });
                        
        saveStrategy.events.remove('success');

        saveStrategy.events.register('success', null, function() {
            LOG.debug('Baseline.js::saveEditedLayer: Layer was updated on OWS server. Refreshing layer list');
                    
            CONFIG.map.removeLayerByName(layer.cloneOf);
            Transects.refreshFeatureList({
                selectLayer : layer.cloneOf
            })
            
            var drawControlArr = CONFIG.map.getMap().getControlsBy('id', 'transects-draw-control');
            if (drawControlArr.length) {
                drawControlArr[0].destroy();
            }
            
            CONFIG.map.removeControl({
                id : 'transects-draw-control'
            });
            
            $('#transect-edit-form-toggle').trigger('click'); 
        });
                
        saveStrategy.save();  
    },
    refreshFeatureList : function(args) {
        LOG.info('Transects.js::refreshFeatureList: Will cause WMS GetCapabilities call to refresh current feature list')
        var selectLayer = args.selectLayer; 
        var namespace = selectLayer.split(':')[0];
        CONFIG.ows.getWMSCapabilities({
            namespace : namespace,
            callbacks : {
                success : [
                CONFIG.tempSession.updateLayersFromWMS,
                function(caps, context) {
                    LOG.info('Transects.js::refreshFeatureList: WMS GetCapabilities response parsed')
                    Transects.populateFeaturesList(caps);
                
                    if (selectLayer) {
                        LOG.info('Transects.js::refreshFeatureList: Auto-selecting layer ' + selectLayer)
                        $('#transects-list').children().each(function(i,v) {
                            if (v.value === selectLayer) {
                                LOG.debug('Triggering "select" on featurelist option');
                                $('#transects-list').val(v.value);
                                $('#transects-list').trigger('change');
                            }
                        })
                    }
                }
                ],
                error: []
            }
        })
    },
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
        
        CONFIG.tempSession.getStage(Transects.stage).viewing = args.name;
        CONFIG.tempSession.persistSession();
    },
    removeTransects : function() {
        CONFIG.map.getMap().getLayersBy('type', 'transects').each(function(layer) {
            CONFIG.map.getMap().removeLayer(layer, false);
            CONFIG.tempSession.getStage(Transects.stage).viewing = layer.name;
            CONFIG.tempSession.persistSession();
        })
    },
    populateFeaturesList : function() {
        CONFIG.ui.populateFeaturesList({
            caller : Transects
        });
    } ,     
    clear : function() {
        $("#transects-list").val('');
        Transects.listboxChanged();
    },
    listboxChanged : function() {
        LOG.info('Transects.js::listboxChanged: Transect listbox changed');
        Transects.disableEditButton();
        
        $("#transects-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.value);
            if (layers.length) {
                $(layers).each(function(i,l) {
                    CONFIG.map.getMap().removeLayer(l, false);
                    CONFIG.tempSession.getStage(Transects.stage).viewing = l.name;
                    CONFIG.tempSession.persistSession();
                })
            }
        });
        if ($("#transects-list option:selected")[0].value) {
            var name = $("#transects-list option:selected")[0].value; 
            Transects.addTransects({
                name : name
            })
            CONFIG.tempSession.getStage(Transects.stage).viewing = name;
            CONFIG.tempSession.persistSession();
            Transects.enableEditButton();
        }
    },
    enableEditButton : function() {
        $('#transect-edit-form-toggle').removeAttr('disabled');
    },
    disableEditButton : function() {
        $('#transect-edit-form-toggle').attr('disabled', 'disabled');
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
        $('#intersection-calculation-panel-well').toggleClass('hidden');
        $('#create-transects-input-button').toggleClass('hidden');
    },
    createTransectSubmit : function(event) {
        var visibleShorelines = $('#shorelines-list :selected').map(function(i,v){
            return v.value
        })
        var baseline = $('#baseline-list :selected')[0].value;
        var spacing = $('#create-transects-input-spacing').val() || 0;
        var layerName = $('#create-transects-input-name').val();
        var farthest = $('#create-intersections-nearestfarthest-list').val();
        var request = Transects.createWPScreateTransectsAndIntersectionsRequest({
            shorelines : visibleShorelines,
            baseline : baseline,
            spacing : spacing,
            farthest : farthest,
            workspace : CONFIG.tempSession.getCurrentSessionKey(),
            store : 'ch-input',
            transectLayer : layerName + '_transects',
            intersectionLayer : layerName + '_intersects'
        })
        
        var wpsProc = function() {
            CONFIG.ows.executeWPSProcess({
                processIdentifier : 'gs:CreateTransectsAndIntersections',
                request : request,
                context : this,
                callbacks : [
                // TODO- Error Checking for WPS process response!
                function(data, textStatus, jqXHR, context) {
                    if (typeof data == 'string') {
                        var transectLayer = data.split(',')[0];
                        var intersectionLayer = data.split(',')[1];
                        CONFIG.ows.getWMSCapabilities({
                            namespace : CONFIG.tempSession.getCurrentSessionKey(),
                            callbacks : {
                                success : [
                                Transects.populateFeaturesList,
                                Calculation.populateFeaturesList,
                                function() {
                                    // Remove previous transects and intersection layers
                                    if (CONFIG.map.getMap().getLayersBy('type', 'transects').length) {
                                        CONFIG.map.getMap().removeLayer(CONFIG.map.getMap().getLayersBy('type', 'transects')[0])
                                    }
                                    if (CONFIG.map.getMap().getLayersBy('type', 'intersects').length) {
                                        CONFIG.map.getMap().removeLayer(CONFIG.map.getMap().getLayersBy('type', 'intersects')[0])
                                    }
                                    
                                    $('#transects-list').val(transectLayer);
                                    $('#intersections-list').val(intersectionLayer);
                                    $('#transects-list').trigger('change');
                                    $('#intersections-list').trigger('change');
                                    $('#stage-select-tablist a[href="#calculation"]').trigger('click');
                                    $('a[href="#' + Calculation.stage + '-view-tab"]').tab('show');
                                    
                                    CONFIG.ui.showAlert({
                                        message : 'Intersection calculation succeeded.',
                                        displayTime : 7500,
                                        caller : Calculation,
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
        if ($('#transects-list option[value="'+ CONFIG.tempSession.getCurrentSessionKey() + ':' + layerName + '_transects"]').length ||
            $('#intersections-list option[value="'+ CONFIG.tempSession.getCurrentSessionKey() + ':' + layerName + '_intersects"]').length) {
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
                        function() {
                            $.get('service/session', {
                                action : 'remove-layer',
                                workspace : CONFIG.tempSession.getCurrentSessionKey(),
                                store : 'ch-input',
                                layer : layerName + '_intersects'
                            },
                            function(data, textStatus, jqXHR) {
                                wpsProc();
                            }, 'json')
                        }, 'json')
                    }           
                }
                ]
            })
        } else {
            wpsProc();
        }
    },
    createWPScreateTransectsAndIntersectionsRequest : function(args) {
        var shorelines = args.shorelines;
        var baseline = args.baseline;
        var spacing = args.spacing ? args.spacing : Transects.defaultSpacing;
        var layer = args.layer;
        var farthest = args.fathest;
        var workspace = args.workspace;
        var transectLayer = args.transectLayer;
        var intersectionLayer = args.intersectionLayer;
        var store = args.store;
        
        var request = '<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">' + 
        '<ows:Identifier>gs:CreateTransectsAndIntersections</ows:Identifier>' + 
        '<wps:DataInputs>';

        shorelines.each(function(i, shoreline) {
            var stage = CONFIG.tempSession.getStage(Shorelines.stage);
            var excludedDates = CONFIG.tempSession.getDisabledDatesForShoreline(shoreline);
            var prefix = shoreline.split(':')[0];
            request += '<wps:Input>' + 
            '<ows:Identifier>shorelines</ows:Identifier>' + 
            '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">' + 
            '<wps:Body>' + 
            '<wfs:GetFeature service="WFS" version="1.1.0" outputFormat="GML2" xmlns:'+prefix+'="gov.usgs.cida.ch.' + prefix + '">' + 
            
            (function(args) {
                var filter = '';
                if (excludedDates) {
                    var property = args.shoreline.substring(0, args.shoreline.indexOf(':') + 1) + stage.groupingColumn;
                    
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
        '<wps:LiteralData>'+spacing+'</wps:LiteralData>' +
        '</wps:Data>' + 
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
        '<wps:LiteralData>'+workspace+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' + 
        '<wps:Input>' + 
        '<ows:Identifier>store</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+store+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' + 
        '<wps:Input>' + 
        '<ows:Identifier>transectLayer</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+transectLayer+'</wps:LiteralData>' +
        '</wps:Data>' + 
        '</wps:Input>' + 
        '<wps:Input>' + 
        '<ows:Identifier>intersectionLayer</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+intersectionLayer+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' + 
        '</wps:DataInputs>' + 
        '<wps:ResponseForm>' + 
        '<wps:RawDataOutput>' + 
        '<ows:Identifier>transects</ows:Identifier>' + 
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