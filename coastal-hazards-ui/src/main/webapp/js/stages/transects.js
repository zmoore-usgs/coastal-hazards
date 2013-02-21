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
            title : 'transects-highlight-control',
            autoActivate : false,
            hover : true,
            highlightOnly : true
        }));  
        
        CONFIG.map.addControl(new OpenLayers.Control.SelectFeature([], {
            title : 'transects-select-control',
            autoActivate : false,
            box : false,
            onSelect : function(feature) {
                LOG.debug('Transects.js::SelectFeature.onSelect(): A feature was selected');
                var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'transects-edit-control')[0];
                modifyControl.selectFeature(feature);
                var selectedFeature = modifyControl.feature.clone();
                var angleGeometry1 = selectedFeature.clone().geometry.components[0].resize(100, selectedFeature.geometry.components[0].getCentroid(), 1);
                var angleGeometry2 = selectedFeature.clone().geometry.components[0].resize(-100, selectedFeature.geometry.components[0].getCentroid(), 1);
                var angleLayer =  new OpenLayers.Layer.Vector('transects-angle-layer',{
                    renderers: CONFIG.map.getRenderer(),
                    type : 'angle-guide',
                    style : {
                        strokeColor : '#A1A1A1',
                        strokeOpacity : 0.25
                    }
                })
                selectedFeature.geometry.addComponents([angleGeometry1,angleGeometry2])
                angleLayer.addFeatures([selectedFeature]);
                angleLayer.type = "transects";
                CONFIG.map.getMap().addLayer(angleLayer);
                var snapControl = CONFIG.map.getMap().getControlsBy('id', 'snap-control')[0]
                snapControl.addTargetLayer(angleLayer);
            },
            onUnselect : function(feature) {
                LOG.debug('Transects.js::SelectFeature.onSelect(): A feature was unselected');
                var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'transects-edit-control')[0];
                Transects.removeAngleLayer();
                modifyControl.unselectFeature(feature);
                
            }
        }));
        
    },
    
    enterStage : function() {
        LOG.debug('Transects.js::enterStage');
        CONFIG.ui.switchTab({
            stage : 'transects',
            tab : 'view'
        })
    },
    leaveStage : function() {
        LOG.debug('Transects.js::leaveStage');
        if ($('#transect-edit-form-toggle').hasClass('active')) {
            $('#transect-edit-form-toggle').trigger('click');
        }
        Transects.removeEditControl();
        Transects.removeSnapControl();
        Transects.removeDrawControl();
        Transects.deactivateSelectControl();
        Transects.deactivateHighlightControl();
        Transects.removeAngleLayer();
        CONFIG.map.removeLayerByName('transects-edit-layer');
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
                strategies: [new OpenLayers.Strategy.Fixed(), new OpenLayers.Strategy.Save()],
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
            clonedLayer.styleMap.styles['default'].defaultStyle.strokeWidth = 4;
            
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
            
            clonedLayer.type = "transects"; 
            CONFIG.map.getMap().addLayer(clonedLayer);
            
            LOG.debug('Transects.js::editButtonToggled: Adding clone control to map');
            var mfControl = new OpenLayers.Control.ModifyFeature(
                clonedLayer, 
                {
                    id : 'transects-edit-control',
                    deleteCodes : [8, 46, 48, 68],
                    standalone : true,
                    createVertices : false,
                    onModification : function(feature) {
                        var baseLayer = CONFIG.map.getMap().getLayersByName($("#baseline-list option:selected")[0].value)[0]
                        var baseLayerFeatures = baseLayer.features;
                        var vertices = feature.geometry.components[0].components;
                        var connectedToBaseline = false
                        baseLayerFeatures.each(function(f) {
                            var g = f.geometry;
                            vertices.each(function(vertex) {
                                LOG.debug(parseInt(g.distanceTo(vertex)));
                                if (parseInt(g.distanceTo(vertex)) <= 5) {
                                    connectedToBaseline = true;
                                }
                            })
                        })
                        if (connectedToBaseline) {
                            feature.state = OpenLayers.State.UPDATE;
                            feature.style = {
                                strokeColor : '#0000FF'
                            };
                            
                        } else {
                            feature.state = OpenLayers.State.DELETE;
                            feature.style = {
                                strokeColor : '#FF0000'
                            };
                        }
                        feature.layer.redraw();
                    },
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
                                strokeColor : '#FF0000'
                            }
                            originalFeature.style = {
                                strokeOpacity : 0
                            }
                            originalFeature.layer.redraw();
                            cloneFeature.layer.redraw();
                        }
                    }
                })
            CONFIG.map.getMap().addControl(mfControl);
            mfControl.activate();
            mfControl.handlers.keyboard.activate();
            var selectControl = Transects.getHighlightControl();
            var highlightControl = CONFIG.map.getMap().getControlsBy('title', 'transects-highlight-control')[0];
            selectControl.setLayer([clonedLayer]);
            highlightControl.setLayer([clonedLayer]);
            highlightControl.activate();
            selectControl.activate();
            
            $("#transects-edit-container").removeClass('hidden');
            $('#transects-edit-save-button').unbind('click', Transects.saveEditedLayer);
            $('#transects-edit-save-button').on('click', Transects.saveEditedLayer);
        } else {
            LOG.debug('Transects.js::editButtonToggled: Edit form was toggled off');
            $("#transects-edit-container").addClass('hidden');
            CONFIG.map.removeLayerByName('transects-edit-layer');
            Transects.removeEditControl();
            Transects.removeSnapControl();
            Transects.removeDrawControl();
            Transects.removeAngleLayer();
            Transects.deactivateSelectControl();
            Transects.deactivateHighlightControl();
        }
    },   
    addTransect : function() {
        var cloneLayer = CONFIG.map.getMap().getLayersByName('transects-edit-layer')[0];
        Transects.deactivateSelectControl();
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
                    var editLayer = CONFIG.map.getMap().getLayersBy('name', "transects-edit-layer")[0];
                    var originalFeatures = CONFIG.map.getMap().getLayersByName($("#transects-list option:selected")[0].value)[0].features;
                    var highestOriginaltidStr = originalFeatures.clone().sort(function(f){
                        return f.attributes.TransectID
                    }).last().attributes.TransectID
                    var highestOriginaltid = parseInt(highestOriginaltidStr);
                    
                    editLayer.highestFid =  editLayer.highestFid ?  editLayer.highestFid + 1 : highestOriginaltid + 1;
                    
                    var blTouchFeature = baseline.features.filter(
                        function(baselineFeature){ 
                            return baselineFeature.geometry.distanceTo(f.geometry) == 0
                        }
                        )
                    
                    // Apply the baseline orient to the new feature
                    if (blTouchFeature.length) {
                        feature.attributes.Orient = blTouchFeature[0].attributes.Orient;
                        feature.attributes.BaselineID = blTouchFeature[0].fid;
                    } else {
                        feature.attributes.Orient = 'seaward';
                    }
                    
                    // Add one to the largest sorted feature
                    feature.attributes.TransectID =  parseInt(editLayer.highestFid) + 1;
                    
                }
            })
        CONFIG.map.addControl(drawControl);
        drawControl.activate();
    },
    saveEditedLayer : function() {
        LOG.debug('Baseline.js::saveEditedLayer: Edit layer save button clicked');
        
        var layer = CONFIG.map.getMap().getLayersByName('transects-edit-layer')[0];
        var intersectsLayer = layer.cloneOf.replace('transects', 'intersects');
        var resultsLayer = layer.cloneOf.replace('transects', 'rates');
        var updatedFeatures = layer.features.filter(function(f){
            return f.state
        }).map(function(f){
            return f.attributes.TransectID
        })
        
        // This will be a callback from WPS
        var editCleanup = function(data, textStatus, jqXHR) {
            LOG.debug('Transects.js::saveEditedLayer: Receieved response from updateTransectsAndIntersections WPS');
            
            Calculation.clear();
            var intersectionsList = CONFIG.ui.populateFeaturesList({
                caller : Calculation,
                stage : 'intersections'
            })
            Results.clear();
            var resultsList = CONFIG.ui.populateFeaturesList({
                caller : Results
            })
                
            if ($(data).find('ows\\:ExceptionReport').length) {
                LOG.debug('Transects.js::saveEditedLayer: UpdateTransectsAndIntersections WPS failed. Removing Intersections layer');
                
                CONFIG.ui.showAlert({
                    message : 'Automatic intersection gen failed.',
                    displayTime : 7500,
                    caller : Transects,
                    style: {
                        classes : ['alert-success']
                    }
                })
                
                intersectionsList.val('');
                resultsList.val('');
                
            } else {
                CONFIG.map.removeLayerByName(layer.cloneOf);
                Transects.refreshFeatureList({
                    selectLayer : layer.cloneOf
                })
                $('#transect-edit-form-toggle').trigger('click'); 
                
                intersectionsList.val(intersectsLayer);
                resultsList.val(resultsLayer);
            }
            intersectionsList.trigger('change');
            resultsList.trigger('change');
        }
            
        var saveStrategy = layer.strategies.find(function(n) {
            return n['CLASS_NAME'] == 'OpenLayers.Strategy.Save'
        });
                        
        saveStrategy.events.remove('success');

        saveStrategy.events.register('success', null, function() {
            LOG.debug('Baseline.js::saveEditedLayer: Transects layer was updated on OWS server. Refreshing layer list');
            
            LOG.debug('Transects.js::saveEditedLayer: Removing associated intersections layer');
            LOG.debug('Transects.js::saveEditedLayer: Calling updateTransectsAndIntersections WPS');
            CONFIG.ows.updateTransectsAndIntersections({
                shorelines : Shorelines.getActive(),
                baseline : Baseline.getActive(),
                transects : Transects.getActive(),
                intersections : Calculation.getActive(),
                transectId : updatedFeatures,
                farthest : $('#create-intersections-nearestfarthest-list').val(),
                callbacks : {
                    success : [
                    function(data, textStatus, jqXHR) {
                        editCleanup(data, textStatus, jqXHR);
                    }
                    ],
                    error : [
                    function(data, textStatus, jqXHR) {
                        editCleanup(data, textStatus, jqXHR);
                    }
                    ]
                }
            });
                    
            LOG.debug('Transects.js::saveEditedLayer: Removing associated results layer');
            $.get('service/session', {
                action : 'remove-layer',
                workspace : CONFIG.tempSession.getCurrentSessionKey(),
                store : 'ch-output',
                layer : resultsLayer.split(':')[1]
            },
            function(data, textStatus, jqXHR) {
                CONFIG.ows.getWMSCapabilities({
                    namespace : CONFIG.tempSession.getCurrentSessionKey(),
                    callbacks : {
                        success : [
                        CONFIG.tempSession.updateLayersFromWMS,
                        function() {
                            LOG.debug('Transects.js::saveEditedLayer: WMS Capabilities retrieved for your session');
                            Results.clear();
                        }
                        ],
                        error : [function() {
                            LOG.warn('Transects.js::saveEditedLayer: There was an error in retrieving the WMS capabilities for your session. This is probably be due to a new session. Subsequent loads should not see this error');
                        }]
                    }
                })
            }, 'json')
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
                            }
                        })
                    } else {
                        $('#transects-list').val('');
                    }
                    $('#transects-list').trigger('change');
                }
                ],
                error: [
                LOG.warn('Transects.js::refreshFeatureList: WMS GetCapabilities could not be attained')
                ]
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
    clearSubsequentStages : function(){
        Calculation.clear();
        Results.clear();
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
        if ($('#transect-edit-form-toggle').hasClass('active')) {
            $('#transect-edit-form-toggle').trigger('click');
        }
        $('#transect-edit-form-toggle').attr('disabled', 'disabled');
    },
    enableCreateTransectsButton : function() {
        LOG.info('Transects.js::enableCreateTransectsButton: Baseline has been added to the map. Enabling create transect button');
        $('#create-transects-toggle').removeAttr('disabled')
        
    },
    disableCreateTransectsButton : function() {
        LOG.info('Transects.js::disableCreateTransectsButton: No valid baseline on the map. Disabling create transect button');
        if ($('#create-transects-toggle').hasClass('active')) {
            $('#create-transects-toggle').trigger('click');
        }
        $('#create-transects-toggle').attr('disabled', 'disabled');
         
    },
    deactivateSelectControl : function() {
        var control = CONFIG.map.getMap().getControlsBy('title', 'transects-select-control');
        if (control.length) {
            control[0].deactivate();
        }
    },
    removeDrawControl : function() {
        var controlArr = CONFIG.map.getMap().getControlsBy('id', 'transects-draw-control');
        if (controlArr.length) {
            controlArr[0].destroy();
        }
        CONFIG.map.removeControl({
            id : 'transects-draw-control'
        });
    },
    removeEditControl : function() {
        var controlArr = CONFIG.map.getMap().getControlsBy('id', 'transects-edit-control');
        if (controlArr.length) {
            controlArr[0].destroy();
        }
        CONFIG.map.removeControl({
            id : 'transects-edit-control'
        });
    },
    removeSnapControl : function() {
        var controlArr = CONFIG.map.getMap().getControlsBy('id', 'snap-control');
        if (controlArr.length) {
            controlArr[0].destroy();
        }
        CONFIG.map.removeControl({
            id : 'snap-control'
        });  
    },
    removeAngleLayer : function() {
        var layerArr = CONFIG.map.getMap().getLayersBy('name', 'transects-angle-layer');
        if (layerArr.length) {
            var layer = layerArr[0];
            var snapControlArr = CONFIG.map.getMap().getControlsBy('id', 'snap-control')
            if (snapControlArr.length) {
                var snapControl = snapControlArr[0]
                snapControl.removeTargetLayer(layer);
            }
            CONFIG.map.removeLayerByName('transects-angle-layer');
        }
    },
    getHighlightControl : function() {
        var ca = CONFIG.map.getMap().getControlsBy('title', 'transects-select-control');
        if (ca.length) {
            return ca[0];
        } else {
            return null;
        }
    },
    deactivateHighlightControl : function() {
        var control = Transects.getHighlightControl();
        if (control) {
            control.deactivate();
        }
    },
    activateHighlightControl : function() {
        var control = Transects.getHighlightControl();
        if (control) {
            control.activate();
        }
    },
    createTransectsButtonToggled : function(event) {
        LOG.info('Transects.js::createTransectsButtonToggled: Transect creation Button Clicked');
        var toggledOn = $(event.currentTarget).hasClass('active') ? false : true;
        
        if (toggledOn) {
            if ($('#transect-edit-form-toggle').hasClass('active')) {
                $('#transect-edit-form-toggle').trigger('click');
            }
        } else {
        }
        $('#create-transects-panel-well').toggleClass('hidden');
        $('#intersection-calculation-panel-well').toggleClass('hidden');
        $('#create-transects-input-button').toggleClass('hidden');
    },
    createTransectSubmit : function(event) {
        Transects.clearSubsequentStages();
        var visibleShorelines = $('#shorelines-list :selected').map(function(i,v){
            return v.value
        })
        var baseline = $('#baseline-list :selected')[0].value;
        var spacing = $('#create-transects-input-spacing').val() || 0;
        var layerName = $('#create-transects-input-name').val();
        var farthest = $('#create-intersections-nearestfarthest-list').val();
        var smoothing = parseFloat($('#create-transects-input-smoothing').val());
        if (isNaN(smoothing)) {
            smoothing = 0.0;
        } else {
            smoothing = smoothing <= 0.0 ? 0.0 : smoothing;
        }
        
        var request = Transects.createWPScreateTransectsAndIntersectionsRequest({
            shorelines : visibleShorelines,
            baseline : baseline,
            spacing : spacing,
            farthest : farthest,
            smoothing : smoothing,
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
        var smoothing = args.smoothing || 0.0;
        var layer = args.layer;
        var farthest = args.farthest;
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
        '<ows:Identifier>smoothing</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+smoothing+'</wps:LiteralData>' +
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
    },
    getActive : function() {
        return $("#transects-list option:selected").first().val();
    }
}
