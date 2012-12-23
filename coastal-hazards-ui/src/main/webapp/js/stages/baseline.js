var Baseline = {
    baselineDrawButton : $('#baseline-draw-btn'),
    addBaseline : function(args) {
        LOG.info('Baseline.js::addBaseline: Going to attempt to load a baseline vector from OWS service')
        
        var baselineLayer = new OpenLayers.Layer.Vector(args.name, {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.WFS({
                url:  "geoserver/ows",
                featureType: args.name.split(':')[1],
                featureNS: CONFIG.namespace[args.name.split(':')[0]],
                geometryName: "the_geom"
            }),
            styleMap: new OpenLayers.StyleMap(CONFIG.sld.namedLayers["Simple Line"]["userStyles"][0])
        });
        
        CONFIG.map.removeLayerByName(baselineLayer.name);
        CONFIG.map.getMap().addLayer(baselineLayer);
    },
    populateFeaturesList : function(caps) {
        CONFIG.ui.populateFeaturesList(caps, 'baseline');
    },
    clearDrawFeatures : function() {
        LOG.info('Baseline.js::clearDrawFeatures: Clearing draw layer');
        return Baseline.getDrawLayer().removeAllFeatures();
    },
    refreshFeatureList : function(args) {
        LOG.info('Baseline.js::refreshFeatureList: Will cause WMS GetCapabilities call to refresh current feature list')
        var selectLayer = args.selectLayer; 
        
        CONFIG.ows.getWMSCapabilities({
            selectLayer : selectLayer,
            callbacks : [
            CONFIG.tempSession.updateSessionLayersFromWMSCaps,
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
            ]
        })
    },
    baselineSelected : function() {
        LOG.debug('A baseline was selected from the dropdown list');
        
        LOG.debug('Going through select listbox to remove layers on the map that are not selected');
        $("#baseline-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.value);
            if (layers.length) {
                $(layers).each(function(i,l) {
                    CONFIG.map.getMap().removeLayer(l);
                })
            }
        });
        
        if ($("#baseline-list option:selected")[0].value) {
            var selectedBaseline = $("#baseline-list option:selected")[0].value;
            LOG.debug('Adding selected baseline ( ' + selectedBaseline + ' ) from list');
            
            Baseline.addBaseline({
                name : selectedBaseline
            })
            
            if (selectedBaseline.startsWith('ch-input')) {
                LOG.debug('Selected baseline is user-created and is writable. Displaying edit panel.');
                CONFIG.ui.enableBaselineEditButton();
            } else {
                Baseline.disableEditButton();
            }
        }
    },
    editButtonToggled : function(event) {
        LOG.debug('UI.js::?: Baseline Edit Button Clicked');
                
        LOG.debug('UI.js::?: Disabling draw button');
        $(Baseline.baselineDrawButton).attr('disabled', 'disabled');
        $(Baseline.baselineDrawButton).removeClass('active');
                
        var toggledOn = $(event.currentTarget).hasClass('active') ? false : true;
                
        if (toggledOn) {
            LOG.debug('UI.js::?: Edit form to be displayed');
            Baseline.disableDrawButton();
                    
            var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
            renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
                    
            LOG.debug('UI.js::?: Attempting to clone current active baseline layer into an edit layer');
            var originalLayer = CONFIG.map.getMap().getLayersByName($("#baseline-list option:selected")[0].value)[0].clone();
            var clonedLayer = new OpenLayers.Layer.Vector('baseline-edit-layer',{
                strategies: [new OpenLayers.Strategy.BBOX(), new OpenLayers.Strategy.Save()],
                protocol: new OpenLayers.Protocol.WFS({
                    url:  "geoserver/ows",
                    featureType: originalLayer.name.split(':')[1],
                    featureNS: CONFIG.namespace[originalLayer.name.split(':')[0]],
                    geometryName: "the_geom",
                    schema: "geoserver/wfs/DescribeFeatureType?version=1.1.0&;typename=" + originalLayer.name
                }),
                cloneOf : originalLayer.name
            })
            clonedLayer.addFeatures(originalLayer.features);
                    
            var report = function(event) {
                LOG.debug(event.type, event.feature ? event.feature.id : event.components);
            }
                    
            clonedLayer.events.on({
                "beforefeaturemodified": report,
                "featuremodified": report,
                "afterfeaturemodified": report,
                "vertexmodified": report,
                "sketchmodified": report,
                "sketchstarted": report,
                "sketchcomplete": report
            });
                    
            var editControl = new OpenLayers.Control.ModifyFeature(clonedLayer, {
                id : 'baseline-edit-control'
            })
                    
            LOG.debug('UI.js::?: Removing previous cloned layer from map, if any');
            CONFIG.map.removeLayerByName('baseline-edit-layer');
            LOG.debug('UI.js::?: Adding cloned layer to map');
            CONFIG.map.getMap().addLayer(clonedLayer);
                    
            LOG.debug('UI.js::?: Removing previous cloned layer from map, if any');
            CONFIG.map.removeControl({
                id : 'baseline-edit-control'
            });
            LOG.debug('UI.js::?: Adding clone control to map');
            CONFIG.map.getMap().addControl(editControl);
                    
            CONFIG.ui.initializeBaselineEditForm();
                    
        } else {
            // remove edit layer, remove edit control
            CONFIG.map.removeLayerByName('baseline-edit-layer');
            CONFIG.map.getMap().removeControl(CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0])
            $('#baseline-draw-btn').removeAttr('disabled')
        }
                
        $("#baseline-edit-panel-well").toggleClass('hidden');
            
    },
    disableDrawButton : function() {
        if (!$('#draw-panel-well').hasClass('hidden')) {
            LOG.debug('UI.js::?: Draw form was found to be active. Deactivating draw form');
            $('#baseline-draw-btn').click();
        }
        $('#baseline-draw-btn').attr('disable', 'disable');
    },
    disableEditButton : function() {
        if (!$('#baseline-edit-panel-well').hasClass('hidden')) {
            LOG.debug('UI.js::?: Edit form was found to be active. Deactivating edit form');
            $('#baseline-edit-form-toggle').click();
        }
        $('#baseline-edit-form-toggle').attr('disable', 'disable');
    },
    drawButtonToggled : function(event) {
        // When a user clicks the button, this event receives notification before the active state changes.
        // Therefore if the button is 'active' coming in, this means the user is wishing to deactivate it
        var beginDrawing = $(event.currentTarget).hasClass('active') ? false : true;
        
        LOG.debug('Baseline.js::drawButtonToggled: User wishes to ' + beginDrawing ? 'begin' : 'stop' + 'drawing');
        
        if (beginDrawing) {
            Baseline.disableEditButton();
            Baseline.beginDrawing();
        } else {
            Baseline.stopDrawing();
        }
    },
    beginDrawing : function() {
        LOG.debug('Baseline.js::beginDrawing: Initializing baseline draw panel');
        
        LOG.debug('Baseline.js::beginDrawing: Activating draw control');
        Baseline.getDrawControl().activate();
        
        LOG.debug('Baseline.js::beginDrawing: Removing currently drawn features, if any');
        Baseline.clearDrawFeatures();
        
        LOG.debug('Baseline.js::beginDrawing: Populating layer name textbox with random lorem');
        $('#baseline-draw-form-name').val(Util.getRandomLorem());
        
        LOG.debug('Baseline.js::beginDrawing: Initializing control panel buttons');
        $('#baseline-draw-form-save').on('click', Baseline.saveDrawnFeatures);
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
        $('#baseline-draw-form-save').unbind('click', Baseline.saveDrawnFeatures);
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
    saveDrawnFeatures : function() {
        LOG.info('Baseline.js::saveDrawnFeatures: User wishes to save thir drawn features');
        
        var drawLayer = Baseline.getDrawLayer();
        var desiredLayerName = $('#baseline-draw-form-name').val() || Util.getRandomLorem();
        var importName = CONFIG.tempSession.getCurrentSessionKey() + '_' + desiredLayerName + '_baseline';
        
        if (drawLayer.features.length) {
            LOG.info('Baseline.js::saveDrawnFeatures: Layer to be saved, "'+importName+ '" has ' + drawLayer.features.length + ' features');
            CONFIG.ows.importFile({
                'file-token' : '',  // Not including a file token denotes a new, blank file should be imported
                importName : importName, 
                workspace : 'ch-input',
                context : drawLayer,
                callbacks : [
                function(data, context) {
                    if (data.success === 'true') {
                        LOG.info('Baseline.js::saveDrawnFeatures: Layer imported successfully - Will attempt to update on server');
                        
                        var schema = context.protocol.schema;
                        var newSchema = schema.substring(0, schema.lastIndexOf(':') + 1) + importName;
            
                        context.protocol.setFeatureType(importName);
                        context.protocol.format.options.schema = newSchema;
                        context.protocol.schema = newSchema;
                        
                        // Do WFS-T to fill out the layer
                        var saveStrategy = context.strategies.find(function(n) {
                            return n['CLASS_NAME'] == 'OpenLayers.Strategy.Save'
                        });
                        
                        // Re-bind the save strategy
                        saveStrategy.events.remove('success');
                        saveStrategy.events.register('success', null, function() {
                            LOG.info('Baseline.js::saveDrawnFeatures: Drawn baseline saved successfully - reloading current layer set from server');
                            Baseline.refreshFeatureList({
                                selectLayer : 'ch-input:' + importName
                            })
                            
                            LOG.info('Baseline.js::saveDrawnFeatures: Triggering click on baseline draw button')
                            $('#baseline-draw-btn').click();
                        });
                        
                        LOG.info('Baseline.js::saveDrawnFeatures: Saving draw features to OWS server');
                        saveStrategy.save();
                    } else {
                        // TODO - Notify the user
                        LOG.warn(data.error);
                    }
                }]
            });
        } else {
            LOG.info('User has not drawn any features to save or did not name the new feature');
        }
    },
    initializeUploader : function(args) {
        CONFIG.ui.initializeUploader($.extend({
            context : 'baseline'
        }, args))
    }
}