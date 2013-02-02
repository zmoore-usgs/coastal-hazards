var Baseline = {
    stage : 'baseline',
    suffixes :  ['_baseline'],
    baselineDrawButton : $('#baseline-draw-btn'),
    reservedColor : '#1B9E77',
    shorewardColor : '#76C5AD',
    
    description : 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    addBaselineToMap : function(args) {
        LOG.info('Baseline.js::addBaselineToMap: Adding baseline layer to map')
        
        var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
        renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
        
        var baselineLayer = new OpenLayers.Layer.Vector(args.name, {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.WFS({
                url:  "geoserver/"+args.name.split(':')[0]+"/wfs",
                featureType: args.name.split(':')[1],
                geometryName: "the_geom"
            }),
            renderers: renderer,
            styleMap: new OpenLayers.StyleMap({
                // We should never see this color because all features will either be 
                // 'shoreward' or 'seaward'
                strokeColor: '#FF0000', 
                strokeWidth: 2
            },{
                "default": new OpenLayers.Style({
                    rules : [
                    new OpenLayers.Rule({
                        filter: new OpenLayers.Filter.Comparison({
                            type: OpenLayers.Filter.Comparison.LIKE, 
                            property: 'Orient', 
                            value: 'shore*'
                        }),
                        symbolizer: {
                            strokeColor: Baseline.shorewardColor
                        }
                    }),
                    new OpenLayers.Rule({
                        filter: new OpenLayers.Filter.Comparison({
                            type: OpenLayers.Filter.Comparison.LIKE, 
                            property: 'Orient', 
                            value: 'sea*'
                        }),
                        symbolizer : {
                            strokeColor: Baseline.reservedColor
                        }
                    })
                    ]
                })
            })
        });
        
        CONFIG.map.removeLayerByName(baselineLayer.name);
        CONFIG.map.getMap().addLayer(baselineLayer);
    },
    populateFeaturesList : function() {
        CONFIG.ui.populateFeaturesList({
            caller : Baseline
        });
    },
    clearDrawFeatures : function() {
        LOG.info('Baseline.js::clearDrawFeatures: Clearing draw layer');
        return Baseline.getDrawLayer().removeAllFeatures();
    },
    refreshFeatureList : function(args) {
        LOG.info('Baseline.js::refreshFeatureList: Will cause WMS GetCapabilities call to refresh current feature list')
        var selectLayer = args.selectLayer; 
        var namespace = selectLayer.split(':')[0];
        CONFIG.ows.getWMSCapabilities({
            namespace : namespace,
            callbacks : {
                success : [
                CONFIG.tempSession.updateLayersFromWMS,
                function(caps, context) {
                    LOG.info('Baseline.js::refreshFeatureList: WMS GetCapabilities response parsed')
                    Baseline.populateFeaturesList(caps);
                
                    if (selectLayer) {
                        LOG.info('Baseline.js::refreshFeatureList: Auto-selecting layer ' + selectLayer)
                        $('#baseline-list').children().each(function(i,v) {
                            if (v.value === selectLayer) {
                                LOG.debug('Triggering "select" on featurelist option');
                                $('#baseline-list').val(v.value);
                                $('#baseline-list').trigger('change');
                            }
                        })
                    }
                }
                ],
                error: []
            }
        })
    },
    listboxChanged : function() {
        LOG.debug('Baseline.js::baselineSelected: A baseline was selected from the dropdown list');
        
        Baseline.disableEditButton();
        Baseline.disableCloneButton();
        
        LOG.debug('Going through select listbox to remove layers on the map that are not selected');
        $("#baseline-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.value);
            if (layers.length) {
                $(layers).each(function(i,l) {
                    CONFIG.map.getMap().removeLayer(l);
                })
            }
        });
        
        var selectVal = $("#baseline-list option:selected")[0].value;
        if (selectVal) {
            var selectedBaseline = selectVal;
            LOG.debug('Baseline.js::baselineSelected: Adding selected baseline ( ' + selectedBaseline + ' ) from list');
            
            Baseline.addBaselineToMap({
                name : selectedBaseline
            })
            
            if (selectedBaseline.startsWith(CONFIG.tempSession.getCurrentSessionKey())) {
                LOG.debug('Baseline.js::baselineSelected: Selected baseline is user-created and is writable. Displaying edit panel.');
                Baseline.enableEditButton();
            } else {
                Baseline.enableCloneButton();
            }
            
            Transects.enableCreateTransectsButton();
        } else {
            LOG.debug('Baseline.js::baselineSelected: Baseline de-selected. Hiding create transects panel and disabling create transects button');
            if (!$('#create-transects-panel-well').hasClass('hidden')) {
                $('#create-transects-toggle').click();
            }
            Transects.disableCreateTransectsButton();
        }
    },
    editButtonToggled : function(event) {
        LOG.debug('Baseline.js::editButtonToggled: Baseline Edit Button Clicked');
                
        LOG.debug('Baseline.js::editButtonToggled: Disabling draw button');
        $(Baseline.baselineDrawButton).attr('disabled', 'disabled');
        $(Baseline.baselineDrawButton).removeClass('active');
                
        var toggledOn = $(event.currentTarget).hasClass('active') ? false : true;
                
        if (toggledOn) {
            LOG.debug('Baseline.js::editButtonToggled: Edit form to be displayed');
            
            Baseline.disableDrawButton();
                    
            var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
            renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
                    
            LOG.debug('Baseline.js::editButtonToggled: Attempting to clone current active baseline layer into an edit layer');
            var originalLayer = CONFIG.map.getMap().getLayersByName($("#baseline-list option:selected")[0].value)[0].clone();
            var clonedLayer = new OpenLayers.Layer.Vector('baseline-edit-layer',{
                strategies: [new OpenLayers.Strategy.BBOX(), new OpenLayers.Strategy.Save()],
                protocol: new OpenLayers.Protocol.WFS({
                    url:  "geoserver/"+originalLayer.name.split(':')[0]+"/wfs",
                    featureType: originalLayer.name.split(':')[1],
                    featureNS: CONFIG.namespace[originalLayer.name.split(':')[0]],
                    geometryName: "the_geom",
                    schema: "geoserver/"+originalLayer.name.split(':')[0]+"/wfs/DescribeFeatureType?version=1.1.0&outputFormat=GML2&typename=" + originalLayer.name
                }),
                cloneOf : originalLayer.name
            })
            
            clonedLayer.addFeatures(originalLayer.features);
                    
            var editControl = new OpenLayers.Control.ModifyFeature(clonedLayer, 
            {
                id : 'baseline-edit-control',
                deleteCodes : [8, 46, 48]
            })
                    
            LOG.debug('Baseline.js::editButtonToggled: Removing previous cloned layer from map, if any');
            CONFIG.map.removeLayerByName('baseline-edit-layer');
            
            LOG.debug('Baseline.js::editButtonToggled: Adding cloned layer to map');
            CONFIG.map.getMap().addLayer(clonedLayer);
            
            LOG.debug('Baseline.js::editButtonToggled: Removing previous cloned layer from map, if any');
            CONFIG.map.removeControl({
                id : 'baseline-edit-control'
            });
            
            LOG.debug('Baseline.js::editButtonToggled: Adding clone control to map');
            CONFIG.map.getMap().addControl(editControl);
            
            $("#baseline-edit-container").removeClass('hidden');
            
            CONFIG.ui.initializeBaselineEditForm();
        } else {
            // remove edit layer, remove edit control
            CONFIG.map.removeLayerByName('baseline-edit-layer');
            CONFIG.map.getMap().removeControl(CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0])
            $('#baseline-draw-btn').removeAttr('disabled')
            $("#baseline-edit-container").addClass('hidden');
        }
                
        
            
    },
    enableCloneButton : function() {
        $('#baseline-clone-btn').removeAttr('disabled');
    },
    disableCloneButton : function() {
        $('#baseline-clone-btn').attr('disabled', 'disabled');
    },
    cloneButtonClicked : function() {
        LOG.debug('Baseline.js::cloneButtonClicked');
        var selectVal = $("#baseline-list option:selected").val();
        var selectText = $("#baseline-list option:selected").html();
        if (selectVal) {
            var cloneName = selectText.split('_')[0] + '_cloned_baseline';
            if (!$('#baseline-list option[value="'+cloneName+'"]').length) {
                CONFIG.ows.cloneLayer({
                    originalLayer : selectVal,
                    newLayer : cloneName,
                    callbacks : [
                    function(data, textStatus, jqXHR, context) {
                        // Check if we got a document (error) or a string (success) back
                        if (typeof data == "string") {
                            CONFIG.ui.showAlert({
                                message : 'Layer cloned successfully.',
                                displayTime : 7500,
                                caller : Baseline,
                                style: {
                                    classes : ['alert-success']
                                }
                            })
                            
                            Baseline.refreshFeatureList({
                                selectLayer : data
                            })
                            
                            $('a[href="#' + Baseline.stage + '-view-tab"]').tab('show');
                            
                        } else {
                            LOG.warn('Baseline.js::cloneButtonClicked: Error returned from server: ' + $(data).find('ows\\:ExceptionText').text());
                            CONFIG.ui.showAlert({
                                message : 'Layer not cloned. Check logs.',
                                displayTime : 7500,
                                caller : Baseline,
                                style: {
                                    classes : ['alert-error']
                                }
                            })
                        }
                    }
                    ]
                })
            } else {
                CONFIG.ui.showAlert({
                    message : 'Cloned layer exists.',
                    displayTime : 7500,
                    caller : Baseline
                })
            }
        }
    },
    disableDrawButton : function() {
        if (!$('#draw-panel-well').hasClass('hidden')) {
            LOG.debug('UI.js::?: Draw form was found to be active. Deactivating draw form');
            $('#baseline-draw-btn').click();
        }
        $('#baseline-draw-btn').attr('disabled', 'disabled');
    },
    enableDrawButton : function() {
        $('#baseline-draw-btn').removeAttr('disabled');
    },
    disableEditButton : function() {
        if (!$('#baseline-edit-container').hasClass('hidden')) {
            LOG.debug('UI.js::?: Edit form was found to be active. Deactivating edit form');
            $('#baseline-edit-form-toggle').click();
        }
        $('#baseline-edit-form-toggle').attr('disabled', 'disabled');
    },
    enableEditButton : function() {
        if ($("#baseline-list option:selected")[0].value.startsWith(CONFIG.tempSession.getCurrentSessionKey())) {
            LOG.info('Baseline.js::enableEditButton: Showing baseline edit button on panel')
            
            var baselineEditButton = $('#baseline-edit-form-toggle');
            
            LOG.debug('UI.js::displayBaselineEditButton: Enabling baseline edit button');
            $(baselineEditButton).removeAttr('disabled');
            $(baselineEditButton).removeClass('active');
            
            LOG.debug('UI.js::displayBaselineEditButton: Rebinding click event hookon baseline edit button');
            $(baselineEditButton).unbind('click', Baseline.editButtonToggled);
            $(baselineEditButton).on('click', Baseline.editButtonToggled);
        }
    },
    drawButtonToggled : function(event) {
        // When a user clicks the button, this event receives notification before the active state changes.
        // Therefore if the button is 'active' coming in, this means the user is wishing to deactivate it
        var beginDrawing = $(event.currentTarget).hasClass('active') ? false : true;
        
        LOG.debug('Baseline.js::drawButtonToggled: User wishes to ' + beginDrawing ? 'begin' : 'stop' + 'drawing');
        
        if (beginDrawing) {
            Baseline.getDrawControl().activate();
            Baseline.disableEditButton();
            Baseline.beginDrawing();
        } else {
            Baseline.getDrawControl().deactivate();
            Baseline.enableEditButton();
            Baseline.stopDrawing();
        }
    },
    beginDrawing : function() {
        LOG.debug('Baseline.js::beginDrawing: Initializing baseline draw panel');
        
        LOG.debug('Baseline.js::beginDrawing: Removing currently drawn features, if any');
        Baseline.clearDrawFeatures();
        
        LOG.debug('Baseline.js::beginDrawing: Clearing any current layers on map');
        $('#baseline-list').val('');
        $('#baseline-list').trigger('change');
        
        LOG.debug('Baseline.js::beginDrawing: Activating draw control');
        Baseline.getDrawControl().activate();
        
        LOG.debug('Baseline.js::beginDrawing: Populating layer name textbox');
        
        LOG.debug('Baseline.js::beginDrawing: Initializing control panel buttons');
        $('#baseline-draw-form-save').on('click', Baseline.saveButtonClickHandler);
        $('#baseline-draw-form-clear').on('click', Baseline.clearDrawFeatures);
        
        LOG.debug('Baseline.js::beginDrawing: Displaying draw control panel ');
        $('#draw-panel-well').removeClass('hidden');
    },
    stopDrawing : function() {
        LOG.debug('Baseline.js::stopDrawing: Removing (uninitializing) draw panel.');

        LOG.debug('Baseline.js::stopDrawing: Deactivating draw control');
        Baseline.getDrawControl().deactivate();
        
        LOG.debug('Baseline.js::stopDrawing: Removing currently drawn features, if any');
        Baseline.clearDrawFeatures();
        
        LOG.debug('Baseline.js::beginDrawing: Uninitializing control panel buttons');
        $('#baseline-draw-form-save').unbind('click', Baseline.saveButtonClickHandler);
        $('#baseline-draw-form-clear').unbind('click', Baseline.clearDrawFeatures);
        
        LOG.debug('Baseline.js::stopDrawing: Hiding draw control panel ');
        $('#draw-panel-well').addClass('hidden');
    },
    getDrawControl : function() {
        return CONFIG.map.getMap().getControlsBy('id','baseline-draw-control')[0];
    },
    getDrawLayer : function() {
        return CONFIG.map.getMap().getControlsBy('id','baseline-draw-control')[0].layer;
    },
    saveEditedLayer : function(event) {
        LOG.debug('Baseline.js::saveEditedLayer: Edit layer save button clicked');
                
        var layer = CONFIG.map.getMap().getLayersByName('baseline-edit-layer')[0];
        
        var saveStrategy = layer.strategies.find(function(n) {
            return n['CLASS_NAME'] == 'OpenLayers.Strategy.Save'
        });
                        
        saveStrategy.events.remove('success');

        saveStrategy.events.register('success', null, function() {
            LOG.debug('Baseline.js::saveEditedLayer: Layer was updated on OWS server. Refreshing layer list');
                    
            CONFIG.map.removeLayerByName(layer.cloneOf);
                    
            Baseline.refreshFeatureList({
                selectLayer : layer.cloneOf
            })
                    
            $('#baseline-edit-form-toggle').click();
        });
                
        saveStrategy.save();  
    }, 
    saveButtonClickHandler : function() {
        LOG.info('Baseline.js::saveButtonClickHandler');
        var drawLayer = Baseline.getDrawLayer();
        var importName = ($('#baseline-draw-form-name').val() || Util.getRandomLorem()) + '_baseline';
        var existingLayer = $("#baseline-list option").filter(function(){
            return $(this).val() == CONFIG.tempSession.getCurrentSessionKey() + ':' + importName
        })
        if (drawLayer.features.length) {
            LOG.info('Baseline.js::saveDrawnFeatures: Layer to be saved, "'+importName+ '" has ' + drawLayer.features.length + ' features');
            
            var layerExists = existingLayer.length
            
            if (layerExists) {
                CONFIG.ui.createModalWindow({
                    context : {
                        scope : this
                    },
                    headerHtml : 'Resource Exists',
                    bodyHtml : 'A resource already exists with the name ' + importName + '. Would you like to overwrite this resource?',
                    buttons : [{
                        text : 'Overwrite',
                        callback : function(event, context) {
                            CONFIG.ows.clearFeaturesOnServer({
                                layer : existingLayer.val(),
                                callbacks : [
                                Baseline.saveDrawnFeatures
                                ]
                            })
                        }
                    }]
                })
            } else {
                CONFIG.ows.importFile({
                    'file-token' : '',  // Not including a file token denotes a new, blank file should be imported
                    importName : importName, 
                    workspace : CONFIG.tempSession.getCurrentSessionKey(),
                    store : 'ch-input',
                    context : drawLayer,
                    extraColumn : 'C|Orient|9', // See ImportService.java to see the format for this
                    callbacks : [
                    function(data, context) {
                        if (data.success === 'true') {
                            LOG.info('Baseline.js::saveDrawnFeatures: Layer imported successfully - Will attempt to update on server');
                            Baseline.saveDrawnFeatures({
                                context : context
                            });
                        } else {
                            LOG.warn(data.error);
                            CONFIG.ui.showAlert({
                                message : 'Draw Failed - Check browser logs',
                                caller : Baseline,
                                displayTime : 4000,
                                style: {
                                    classes : ['alert-error']
                                }
                            })
                        }
                    }]
                });
                
            }
        } else {
            LOG.info('User has not drawn any features to save or did not name the new feature');
        }
    },
    saveDrawnFeatures : function(args) {
        LOG.info('Baseline.js::saveDrawnFeatures: User wishes to save thir drawn features');
        var drawLayer = Baseline.getDrawLayer();
        var desiredLayer = ($('#baseline-draw-form-name').val() || Util.getRandomLorem())  + '_baseline';
        var importName = CONFIG.tempSession.getCurrentSessionKey() + ':' + ($('#baseline-draw-form-name').val() || Util.getRandomLorem())  + '_baseline';
        var geoserverEndpoint = CONFIG.geoServerEndpoint.endsWith('/') ? CONFIG.geoServerEndpoint : CONFIG.geoServerEndpoint + '/';
        var schema = drawLayer.protocol.schema.replace('geoserver/', geoserverEndpoint);
        var newSchema = schema.substring(0, schema.lastIndexOf('typename=') + 9) + importName;
            
        drawLayer.protocol.setFeatureType(desiredLayer);
        drawLayer.protocol.format.options.schema = newSchema;
        drawLayer.protocol.format.schema = newSchema
        drawLayer.protocol.schema = newSchema;
        drawLayer.protocol.options.featureType = desiredLayer;
                        
        // Do WFS-T to fill out the layer
        var saveStrategy = drawLayer.strategies.find(function(n) {
            return n['CLASS_NAME'] == 'OpenLayers.Strategy.Save'
        });
                        
        // Re-bind the save strategy
        saveStrategy.events.remove('success');
        saveStrategy.events.register('success', null, function() {
            LOG.info('Baseline.js::saveDrawnFeatures: Drawn baseline saved successfully - reloading current layer set from server');
            Baseline.refreshFeatureList({
                selectLayer : importName
            })
            
            CONFIG.ui.showAlert({
                message : 'Draw Successful',
                caller : Baseline,
                displayTime : 3000,
                style: {
                    classes : ['alert-success']
                }
            })
            $('a[href="#' + Baseline.stage + '-view-tab"]').tab('show');
                            
            LOG.info('Baseline.js::saveDrawnFeatures: Triggering click on baseline draw button')
            $('#baseline-draw-btn').click();
            Baseline.getDrawControl().deactivate();
        });
        
        saveStrategy.events.register('fail', null, function() {
            CONFIG.ui.showAlert({
                message : 'Draw Failed - Check browser logs',
                caller : Baseline,
                displayTime : 4000,
                style: {
                    classes : ['alert-error']
                }
            })
        })
                        
        LOG.info('Baseline.js::saveDrawnFeatures: Saving draw features to OWS server');
        saveStrategy.save();
    },
    initializeUploader : function(args) {
        CONFIG.ui.initializeUploader($.extend({
            caller : Baseline
        }, args))
    }
}