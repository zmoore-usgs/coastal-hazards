var Baseline = {
    drawButton : $('#baseline-draw-btn'),
    addBaseline : function(args) {
        LOG.debug('Going to attempt to load a baseline vector from OWS service')
        
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
        CONFIG.map.getMap().addLayer(baselineLayer);
    },
    populateFeaturesList : function(caps) {
        CONFIG.ui.populateFeaturesList(caps, 'baseline');
    },
    clearDrawFeatures : function() {
        LOG.info('Clearing draw layer from map');
        return CONFIG.map.getMap().getControlsBy('id','baseline-draw-control')[0].layer.removeAllFeatures();
    },
    refreshFeatureList : function(args) {
        var selectLayer = args.selectLayer; 
        CONFIG.ows.getWMSCapabilities({
            selectLayer : selectLayer,
            callbacks : [
            function(caps, context) {
                Baseline.populateFeaturesList(caps);
            },
            function(caps, context) {
                $('#baseline-list').children().each(function(i,v) {
                    if (v.value === 'ch-input:' + selectLayer) {
                        LOG.debug('Triggering "select" on featurelist option');
                        $('#baseline-list').val(v.value);
                        $('#baseline-list').trigger('change');
                    }
                })
            }
            ]
        })
    },
    saveDrawnFeatures : function() {
        var drawLayer = CONFIG.map.getMap().getControlsBy('id','baseline-draw-control')[0].layer;
        var importName = CONFIG.tempSession.getCurrentSessionKey() + '_' + ($('#baseline-draw-form-name').val() || Util.getRandomLorem()) + '_baseline';
        
        if (drawLayer.features.length && importName) {
            LOG.info('User has drawn a feature and is saving it');
            CONFIG.ows.importFile({
                token : '',
                importName : importName, 
                workspace : 'ch-input',
                context : drawLayer,
                callbacks : [function(data, context) {
                    if (data.success === 'true') {
                        LOG.info('File imported successfully - reloading current file set from server');
                        var schema = context.protocol.schema;
                        var newSchema = schema.substring(0, schema.lastIndexOf(':') + 1) + importName;
            
                        context.protocol.setFeatureType(importName);
                        context.protocol.format.options.schema = newSchema;
                        context.protocol.schema = newSchema;
                        
                        // Do WFS-T to fill out the layer
                        var saveStrategy = context.strategies.find(function(n) {
                            return n['CLASS_NAME'] == 'OpenLayers.Strategy.Save'
                        });
                        
                        saveStrategy.events.remove('success');

                        saveStrategy.events.register('success', null, function() {
                            Baseline.refreshFeatureList({
                                selectLayer : importName
                            })
                            Baseline.drawButton.trigger('click');
                        });
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
                CONFIG.ui.displayBaselineEditButton();
            }
        }
    },
    drawButtonToggled : function(event) {
        // When a user clicks the button, this event receives notification before the active state changes.
        // Therefore if the button is 'active' coming in, this means the user is wishing to deactivate it
        var beginDrawing = $(event.currentTarget).attr('class').split(' ').find('active') ? false : true;
        
        LOG.debug('Baseline.js::drawButtonToggled: User wishes to ' + beginDrawing ? 'begin' : 'stop' + 'drawing');
        
        if (beginDrawing) {
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
    initializeUploader : function(args) {
        CONFIG.ui.initializeUploader($.extend({
            context : 'baseline'
        }, args))
    }
}