var Baseline = {
    stage : 'baseline',
    suffixes :  ['_baseline'],
    mandatoryColumns : ['the_geom', 'ID', 'Orient'],
    reservedColor : '#7570B3',
    shorewardColor : '#76C5AD',
    description : {
        'stage' : 'Select an existing published baseline, upload your own, or draw a new baseline. A baseline provides a reference polyline to determine the orientation of erosion and deposition of coastlines.',
        'view-tab' : 'Select a published collection of shorelines to add to the workspace.',
        'manage-tab' : 'Add a new baseline to the workspace, or clone and edit an existing baseline.',
        'upload-button' : 'Upload a zipped shapefile containing a baseline polyline.'
    },
    baselineDrawButton : $('#baseline-draw-btn'),
    baselineCloneButton : $('#baseline-clone-btn'),
    baselineRemoveButton : $('#baseline-remove-btn'),
    baselineEditButton : $('#baseline-edit-button'),
    baselineEditMenu : $('#baseline-edit-menu'), 
    appInit : function() {
        $('#baseline-draw-form-name').val(Util.getRandomLorem());
        Baseline.baselineCloneButton.on('click', Baseline.cloneButtonClicked);
        Baseline.baselineRemoveButton.on('click', Baseline.removeResource)
        Baseline.baselineDrawButton.on("click", Baseline.drawButtonToggled);
        Baseline.baselineEditButton.on('click', Baseline.editButtonToggled);
        Baseline.baselineEditMenu.find('li').on('click', Baseline.editMenuToggled)

        Baseline.baselineDrawButton.popover({
            title : Baseline.stage.capitalize() + ' Draw',
            content : $('<div />')
            .append($('<div />').html('Click vertex points on the map to draw your own baseline. Double-click to finish.'))
            .html(),
            html : true,
            placement : 'bottom',
            trigger : 'hover',
            delay : {
                show : CONFIG.popupHoverDelay
            }
        })
        
        Baseline.baselineEditButton.popover({
            title : Baseline.stage.capitalize() + ' Edit',
            content : $('<div />')
            .append($('<div />').html('Expand the editing pallet and modify the selected baseline. '))
            .html(),
            html : true,
            placement : 'bottom',
            trigger : 'hover',
            delay : {
                show : CONFIG.popupHoverDelay
            }
        })
        
        Baseline.baselineCloneButton.popover({
            title : Baseline.stage.capitalize() + ' Clone',
            content : $('<div />')
            .append($('<div />').html('Clone an existing baseline layer so that it can be modified if desired.'))
            .html(),
            html : true,
            placement : 'bottom',
            trigger : 'hover',
            delay : {
                show : CONFIG.popupHoverDelay
            }
        })
        
        var sessionKey = CONFIG.tempSession.getCurrentSessionKey();
        var drawLayer  = new OpenLayers.Layer.Vector("baseline-draw-layer",{
            strategies : [new OpenLayers.Strategy.BBOX(), new OpenLayers.Strategy.Save()],
            projection: new OpenLayers.Projection('EPSG:900913'),
            protocol: new OpenLayers.Protocol.WFS({
                version: "1.1.0",
                url: "geoserver/ows",
                featureNS :  sessionKey,
                maxExtent: CONFIG.map.getMap().getExtent(),
                featureType: "featureType",
                geometryName: "the_geom",
                schema: "geoserver/wfs/DescribeFeatureType?version=1.1.0&outputFormat=GML2&typename=" + sessionKey + ":featureType"
            }),
            onFeatureInsert : function(feature) {
                var indexOfFeatureInLayer = feature.layer.features.findIndex(function(f) {
                    return f.id == feature.id
                })
                feature.attributes['Orient'] = 'seaward';
                feature.attributes['ID'] = indexOfFeatureInLayer + 1;
            }
        });

        CONFIG.map.addLayer(drawLayer);
        CONFIG.map.addControl(new OpenLayers.Control.DrawFeature(
            drawLayer,
            OpenLayers.Handler.Path,
            {
                id: 'baseline-draw-control',
                multi: true
            }));
        CONFIG.map.addControl(new OpenLayers.Control.SelectFeature([], {
            title : 'baseline-highlight-control',
            autoActivate : false,
            hover : true,
            highlightOnly : true
        }));    
        CONFIG.map.addControl(new OpenLayers.Control.SelectFeature([], {
            title : 'baseline-select-control',
            autoActivate : false,
            box : false
        }));
        
        Baseline.initializeUploader();
    },
    
    enterStage : function() {
        LOG.debug('Baseline.js::enterStage');
        CONFIG.ui.switchTab({
            caller : Baseline,
            tab : 'view'
        })
    },
    leaveStage : function() {
        LOG.debug('Baseline.js::leaveStage');
        Baseline.deactivateHighlightControl();
        if ($('#baseline-edit-button').hasClass('active')) {
            $('#baseline-edit-button').trigger('click');
        }
    },
    
    addLayerToMap : function(args) {
        var layerPrefix = args.name.split(':')[0];
        var layerName = args.name.split(':')[1];
        
        CONFIG.ows.getDescribeFeatureType({
            layerNS : layerPrefix,
            layerName : layerName,
            callbacks : [
            function(describeFeaturetypeRespone) {
                LOG.trace('Baseline.js::addLayerToMap: Parsing layer attributes to check that they contain the attributes needed.'); 
                var attributes = describeFeaturetypeRespone.featureTypes[0].properties;
                if (layerPrefix != CONFIG.name.published && attributes.length < Baseline.mandatoryColumns.length) {
                    LOG.warn('Baseline.js::addLayerToMap: There are not enough attributes in the selected shapefile to constitute a valid baseline. Will be deleted. Needed: '  + Baseline.mandatoryColumns.length + ', Found in upload: ' + attributes.length);
                    Baseline.removeResource();
                    CONFIG.ui.showAlert({
                        message : 'Not enough attributes in upload - Check Logs',
                        caller : Shorelines,
                        displayTime : 7000,
                        style: {
                            classes : ['alert-error']
                        }
                    })
                }
                
                var layerColumns = Util.createLayerUnionAttributeMap({
                    caller : Baseline,
                    attributes : attributes
                })
                var foundAll = layerColumns.values().findIndex('') == -1 ? true : false;
                
                if (layerPrefix != CONFIG.name.published && !foundAll) {
                    CONFIG.ui.buildColumnMatchingModalWindow({
                        layerName : layerName,
                        columns : layerColumns,
                        caller : Baseline
                    })
                } else {
                    var orient = 'Orient';
                    LOG.info('Baseline.js::addLayerToMap: Adding baseline layer to map')
                    var style = new OpenLayers.Style({
                        strokeColor: '#FFFFFF',
                        strokeWidth: 2
                    },{
                        rules : [
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO, 
                                property: orient, 
                                value: 'shoreward'
                            }),
                            symbolizer: {
                                strokeColor: Baseline.shorewardColor,
                                strokeWidth: 2
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO, 
                                property: orient, 
                                value: 'seaward'
                            }),
                            symbolizer : {
                                strokeColor: Baseline.reservedColor,
                                strokeWidth: 2
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO, 
                                property: orient, 
                                value: 'seaward'
                            }),
                            symbolizer : {
                                strokeColor: Baseline.reservedColor,
                                strokeWidth: 2
                            }
                        }),
                        new OpenLayers.Rule({
                            elseFilter: true
                        })
                        ]
                    })
        
                    var baselineLayer = new OpenLayers.Layer.Vector(args.name, {
                        strategies: [new OpenLayers.Strategy.BBOX()],
                        protocol: new OpenLayers.Protocol.WFS({
                            url:  "geoserver/"+args.name.split(':')[0]+"/wfs",
                            featureType: args.name.split(':')[1],
                            geometryName: "the_geom"
                        }),
                        renderers: CONFIG.map.getRenderer(),
                        styleMap: new OpenLayers.StyleMap(style),
                        type : Baseline.stage
                    });
        
                    CONFIG.map.removeLayerByName(baselineLayer.name);
                    CONFIG.map.getMap().addLayer(baselineLayer);
                    CONFIG.tempSession.getStage(Baseline.stage).viewing = args.name;
                    CONFIG.tempSession.persistSession();
                }
            }]
        })
        
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
        var updatedArgs = args || {};
        var isCloning = updatedArgs.isCloning;
        var selectLayer = updatedArgs.selectLayer || ''; 
        var namespace = selectLayer ? selectLayer.split(':')[0] : CONFIG.tempSession.getCurrentSessionKey();
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
                        $('#' + Baseline.stage + '-list').children().each(function(i,v) {
                            if (v.value === selectLayer) {
                                LOG.debug('Triggering "select" on featurelist option');
                                $('#' + Baseline.stage + '-list').val(v.value);
                                $('#' + Baseline.stage + '-list').trigger('change', isCloning);
                            }
                        })
                    } else {
                        $('#' + Baseline.stage + '-list').val('');
                        Baseline.listboxChanged();
                    }
                }
                ],
                error: [
                function() {
                    LOG.warn('Baseline.js::refreshFeatureList: Could not get WMS capabilities.')
                }
                ]
            }
        })
    },
    clear : function() {
        $("#baseline-list").val('');
        Baseline.listboxChanged();
    },
    //@param: params.isCloning - optional boolean
    listboxChanged : function(params) {
        LOG.debug('Baseline.js::baselineSelected: A baseline was selected from the dropdown list');
        var params = $.extend({}, params);
        var isCloning = params.isCloning;

        Baseline.disableEditButtonSet();
        Baseline.disableCloneButton();
        Baseline.disableRemoveButton();
        Baseline.deactivateHighlightControl();
        
        //now get all non-draw and non-base layers via the custom
        //'type' property that we added to the pertinent layers.
        var typesRegex = /baseline|transects|intersections|results|highlight/;
        if(isCloning){
            typesRegex = /transects|intersections|results|highlight/;
        }

        var mappedLayers = CONFIG.map.getMap().getLayersBy('type', typesRegex);
        mappedLayers.each(function(layer) {
            LOG.debug('Baseline.js::listboxChanged: Removing layer ' + layer.name + ' from map');
            CONFIG.map.removeLayer(layer);
        })

        //set all subsequent dropdowns to none and trigger changes
        var subsequentSelectIds = ['transects-list', 'intersections-list', 'results-list'];
        $.each(subsequentSelectIds, function(index, id){
            var element = $('#' + id);
            element.val('');
            element.trigger('change');
        });

       
        var selectVal = $("#baseline-list option:selected")[0].value;
        if (selectVal) {
            LOG.debug('Baseline.js::baselineSelected: Locking subsequent layer names to use the same base name');
            var baseName = selectVal.slice(selectVal.indexOf(':')+1);//kills NS and the colon
            baseName = baseName.slice(0, baseName.indexOf("_baseline",0));//@todo remove hard-coding


            CONFIG.ui.lockBaseNameTo(baseName);
            LOG.debug('Baseline.js::baselineSelected: Adding selected baseline ( ' + selectVal + ' ) from list');

            LOG.debug('Baseline.js::baselineSelected: Adding selected baseline ( ' + selectVal + ' ) from list');
            
            Baseline.addLayerToMap({
                name : selectVal
            })
            
            if (selectVal.startsWith(CONFIG.tempSession.getCurrentSessionKey())) {
                LOG.debug('Baseline.js::baselineSelected: Selected baseline is user-created and is writable. Displaying edit panel.');
                Baseline.enableEditButtonSet();
                Baseline.enableRemoveButton();
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
        var activated = !$(event.target).hasClass('active');
        if (activated) {
            $('#baseline-edit-save-button').on('click', Baseline.saveEditedLayer);
            $('#baseline-edit-container').removeClass('hidden');
           
            LOG.debug('Baseline.js::editMenuToggled: Disabling draw button');
            $(Baseline.baselineDrawButton).attr('disabled', 'disabled');
            $(Baseline.baselineDrawButton).removeClass('active');
            
            LOG.debug('Baseline.js::editMenuToggled: Edit description panel to be displayed');
            
            Baseline.disableDrawButton();
            LOG.debug('Baseline.js::editMenuToggled: Attempting to clone current active baseline layer into an edit layer');
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
                cloneOf : originalLayer.name,
                renderers: CONFIG.map.getRenderer()
            })
            clonedLayer.addFeatures(originalLayer.features);
            clonedLayer.styleMap.styles['default'].defaultStyle.strokeWidth = 4;
            var editControl = new OpenLayers.Control.ModifyFeature(clonedLayer, 
            {
                id : 'baseline-edit-control',
                deleteCodes : [8, 46, 48],
                standalone : true
            })
                    
            LOG.debug('Baseline.js::editMenuToggled: Removing previous cloned layer from map, if any');
            CONFIG.map.removeLayerByName('baseline-edit-layer');
                    
            LOG.debug('Baseline.js::editMenuToggled: Adding cloned layer to map');
            CONFIG.map.getMap().addLayer(clonedLayer);
                    
            LOG.debug('Baseline.js::editMenuToggled: Removing previous cloned layer from map, if any');
            CONFIG.map.removeControl({
                id : 'baseline-edit-control'
            });
                    
            LOG.debug('Baseline.js::editMenuToggled: Adding clone control to map');
            CONFIG.map.getMap().addControl(editControl);
                    
            var selectControl = CONFIG.map.getMap().getControlsBy('title', 'baseline-select-control')[0];
            var highlightControl = Baseline.getHighlightControl();
                    
            highlightControl.deactivate();
            selectControl.deactivate();
                    
            selectControl.onSelect = function(feature) {
                var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0];
                modifyControl.selectFeature(feature);
                if (feature.attributes.Orient == 'seaward') {
                    $('#baseline-edit-orient-seaward').addClass('disabled');
                    $('#baseline-edit-orient-shoreward').removeClass('disabled');
                } else {
                    $('#baseline-edit-orient-shoreward').addClass('disabled');
                    $('#baseline-edit-orient-seaward').removeClass('disabled');
                }
                
                var activeMenuItem = Baseline.baselineEditMenu.find('li[class="active"]');
                if (!activeMenuItem.length) {
                    $('#baseline-edit-create-vertex').trigger('click');
                }
            }
                 
            selectControl.onUnselect = function(feature) {
                $('#baseline-edit-save-button').unbind('click', Baseline.saveEditedLayer);
                $('#baseline-edit-save-button').on('click', Baseline.saveEditedLayer);
                var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0];
                modifyControl.unselectFeature(feature);
            }
                    
            selectControl.setLayer(clonedLayer);
            highlightControl.setLayer(clonedLayer);
                    
            highlightControl.activate();
            selectControl.activate();
            
            var activeMenuItem = Baseline.baselineEditMenu.find('li[class="active"]');
            if (!activeMenuItem.length) {
                $('.baseline-edit-container-instructions').addClass('hidden');
                $('#baseline-edit-container-instructions-initial').removeClass('hidden');
            }
        } else {
            $('#baseline-edit-container').addClass('hidden');
            $('.baseline-edit-container-instructions').addClass('hidden');
            Baseline.baselineEditMenu.find('li').removeClass('active');
            // TODO- Check if user does want to save?
            Baseline.deactivateHighlightControl();
            CONFIG.map.removeLayerByName('baseline-edit-layer');
            CONFIG.map.getMap().removeControl(CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0]);
            CONFIG.map.getMap().getControlsBy('title', 'baseline-select-control')[0].deactivate();
            Baseline.baselineDrawButton.removeAttr('disabled');
        }
    },
    editMenuToggled : function(event) {
        LOG.info('Baseline.js::editMenuToggled: Baseline Edit Menu Toggled');
        
        if (!Baseline.baselineEditButton.hasClass('active')){
            Baseline.baselineEditButton.trigger('click');
        }
        
        var target = $(event.currentTarget);
        var targetId = target.attr('id');
        var toggledOn = target.hasClass('active') ? false : true;
        var targetDisabled = target.hasClass('disabled');
        var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0];
        var selectControl = CONFIG.map.getMap().getControlsBy('title', 'baseline-select-control')[0];
        
        if (targetId == 'baseline-edit-orient-seaward' || targetId == 'baseline-edit-orient-shoreward') {
            var selectedFeature = CONFIG.map.getMap().getLayersBy('name', 'baseline-edit-layer')[0].features.find(function(n){
                return n.id == selectControl.layer.selectedFeatures[0].id
            })
            if (targetId == 'baseline-edit-orient-seaward') {
                selectedFeature.attributes.Orient = 'seaward';
                selectedFeature.state = OpenLayers.State.UPDATE;
                $('#baseline-edit-orient-seaward').addClass('disabled');
                $('#baseline-edit-orient-shoreward').removeClass('disabled');
            } else {
                selectedFeature.attributes.Orient = 'shoreward';
                selectedFeature.state = OpenLayers.State.UPDATE;
                $('#baseline-edit-orient-shoreward').addClass('disabled');
                $('#baseline-edit-orient-seaward').removeClass('disabled');
            }
        } else if (toggledOn && !targetDisabled) {
            if (modifyControl.active) {
                modifyControl.deactivate();
            }
            Baseline.baselineEditMenu.find('li').removeClass('active');
            target.addClass('active');
            $('.baseline-edit-container-instructions').addClass('hidden');
            switch (targetId) {
                case 'baseline-edit-create-vertex' : {
                    modifyControl.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
                    modifyControl.mode.createVertices = true;
                    $('#baseline-edit-container-instructions-vertex').removeClass('hidden');
                    break;
                } 
                case 'baseline-edit-rotate' : {
                    modifyControl.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
                    modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                    $('#baseline-edit-container-instructions-rotate').removeClass('hidden');
                    break;
                }
                case 'baseline-edit-drag': {
                    modifyControl.mode |= OpenLayers.Control.ModifyFeature.DRAG;
                    modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                    $('#baseline-edit-container-instructions-drag').removeClass('hidden');
                    break;
                }
                case 'baseline-edit-resize-w-aspect' : {
                    modifyControl.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
                    modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                }
                case 'baseline-edit-resize': {
                    modifyControl.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
                    $('#baseline-edit-container-instructions-resize').removeClass('hidden');
                    break;
                }
                default : {
                    $('#baseline-edit-container-instructions-initial').removeClass('hidden');
                }
            }
            modifyControl.activate();
            if (selectControl.layer.selectedFeatures[0]) {
                modifyControl.selectFeature(selectControl.layer.selectedFeatures[0]);
            }
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
                            
                            CONFIG.ows.getDescribeFeatureType({
                                layerNS : selectVal.split(':')[0],
                                layerName : selectText,
                                callbacks : [
                                function(describeFeaturetypeRespone) {
                                    var displayLayer = function() {
                                        Baseline.refreshFeatureList({
                                            selectLayer : data,
                                            isCloning: true
                                        })
                                        $('a[href="#' + Baseline.stage + '-view-tab"]').tab('show');
                                    }
                                    var orientProp = describeFeaturetypeRespone.featureTypes[0].properties.find(function(p){
                                        return p.name.toLowerCase() == 'orient';
                                    })
                                    if (!orientProp) {
                                        CONFIG.ows.appendAttributesToLayer({
                                            workspace : CONFIG.tempSession.getCurrentSessionKey(),
                                            store : 'ch-input',
                                            layer : cloneName,
                                            columns : ['Orient|s|Baseline Orientation|seaward'],
                                            callbacks : [
                                            displayLayer
                                            ]
                                            
                                        })
                                    } else {
                                        displayLayer();
                                    }
                                    
                                    
                                }
                                ]
                            })
                            
                            
                            
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
            Baseline.baselineDrawButton.click();
        }
        Baseline.baselineDrawButton.attr('disabled', 'disabled');
    },
    enableDrawButton : function() {
        Baseline.baselineDrawButton.removeAttr('disabled');
    },
    disableEditButtonSet : function() {
        if (!$('#baseline-edit-container').hasClass('hidden')) {
            LOG.debug('UI.js::?: Edit form was found to be active. Deactivating edit form');
            Baseline.baselineEditButton.trigger('click');
        }
        $('#baseline-edit-btn-group button').attr('disabled', 'disabled');
    },
    enableEditButtonSet : function() {
        if ($("#baseline-list option:selected")[0].value.startsWith(CONFIG.tempSession.getCurrentSessionKey())) {
            LOG.info('Baseline.js::enableEditButton: Showing baseline edit button on panel')
            
            var baselineEditButtonGroup = $('#baseline-edit-btn-group button');
            
            LOG.debug('UI.js::displayBaselineEditButton: Enabling baseline edit button');
            baselineEditButtonGroup.removeAttr('disabled');
            Baseline.baselineEditMenu.find('li').removeClass('active');
            
            LOG.debug('UI.js::displayBaselineEditButton: Rebinding click event hookon baseline edit button');
            Baseline.baselineEditMenu.find('li').unbind('click', Baseline.editMenuToggled);
            Baseline.baselineEditMenu.find('li').on('click', Baseline.editMenuToggled);
        }
    },
    drawButtonToggled : function(event) {
        // When a user clicks the button, this event receives notification before the active state changes.
        // Therefore if the button is 'active' coming in, this means the user is wishing to deactivate it
        var beginDrawing = $(event.currentTarget).hasClass('active') ? false : true;
        
        LOG.debug('Baseline.js::drawButtonToggled: User wishes to ' + beginDrawing ? 'begin' : 'stop' + 'drawing');
        
        if (beginDrawing) {
            Baseline.beginDrawing();
        } else {
            Baseline.stopDrawing();
        }
    },
    beginDrawing : function() {
        LOG.debug('Baseline.js::beginDrawing: Initializing baseline draw panel');
        Baseline.disableEditButtonSet();
        
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

        LOG.debug('Baseline.js::stopDrawing: Removing draw control');
        Baseline.getDrawControl().deactivate();
        Baseline.enableEditButtonSet();
        
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
    saveEditedLayer : function() {
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
    disableRemoveButton : function() {
        $('#baseline-remove-btn').attr('disabled','disabled');
    },
    enableRemoveButton : function() {
        $('#baseline-remove-btn').removeAttr('disabled');
    },
    getHighlightControl : function() {
        var ca = CONFIG.map.getMap().getControlsBy('title', 'baseline-highlight-control');
        if (ca.length) {
            return ca[0];
        } else {
            return null;
        }
    },
    deactivateHighlightControl : function() {
        var ca = Baseline.getHighlightControl();
        if (ca.length) {
            ca[0].deactivate();
        }
    },
    activateHighlightControl : function() {
        var ca = Baseline.getHighlightControl();
        if (ca.length) {
            ca[0].activate();
        }
    },
    removeResource : function() {
        try {
            CONFIG.tempSession.removeResource({
                store : 'ch-input',
                layer : $('#baseline-list option:selected')[0].text,
                callbacks : [
                function(data, textStatus, jqXHR) {
                    CONFIG.ui.showAlert({
                        message : 'Baseline removed',
                        caller : Baseline,
                        displayTime : 4000,
                        style: {
                            classes : ['alert-success']
                        }
                    })
                    
                    $('#baseline-list').val('');
                    CONFIG.ui.switchTab({
                        caller : Baseline,
                        tab : 'view'
                    })
                    Baseline.refreshFeatureList();
                }
                ]
            })
        } catch (ex) {
            CONFIG.ui.showAlert({
                message : 'Draw Failed - ' + ex,
                caller : Baseline,
                displayTime : 4000,
                style: {
                    classes : ['alert-error']
                }
            })
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
            Baseline.baselineDrawButton.click();
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
    },
    getActive : function() {
        return $("#baseline-list option:selected").first().val();
    }
}
