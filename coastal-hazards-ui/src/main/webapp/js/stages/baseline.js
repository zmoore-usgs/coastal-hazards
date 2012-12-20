var Baseline = {
    
    addBaseline : function(args) {
        var baselineLayer = new OpenLayers.Layer.Vector(args.name, {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.WFS({
                url:  "geoserver/ows", // should not be sample dependent
                featureType: args.name.split(':')[1], // from listbox
                featureNS: CONFIG.namespace[args.name.split(':')[0]], // redo this
                geometryName: "the_geom"
            }),
            styleMap: new OpenLayers.StyleMap(sld.namedLayers["Simple Line"]["userStyles"][0])
        });
        map.getMap().addLayer(baselineLayer);
    },
    populateFeaturesList : function(caps) {
        ui.populateFeaturesList(caps, 'baseline');
    },
    drawBaseline : function(event) {
        // When a user clicks the button, this event receives notification before the active state changes.
        // Therefore if the button is 'active' coming in, this means the user is wishing to deactivate it
        var beginDrawing = $(event.currentTarget).attr('class').split(' ').find('active') ? false : true;
        var drawControl = map.getMap().getControlsBy('id','baseline-draw-control')[0];
        if (beginDrawing) {
            LOG.debug('User wishes to begin drawing a baseline');
            // First make sure to clear what's currently drawn, if anything
            drawControl.activate();
            $('#baseline-well').after(Baseline.createDrawPanel());
        } else {
            LOG.debug('User wishes to stop drawing a baseline');
            drawControl.deactivate();
            Baseline.clearDrawFeatures();
            $('#draw-panel-well').remove();
        }
        
    },
    clearDrawFeatures : function() {
        return map.getMap().getControlsBy('id','baseline-draw-control')[0].layer.removeAllFeatures();
    },
    saveDrawnFeatures : function() {
        var drawControl = map.getMap().getControlsBy('id','baseline-draw-control')[0];
        var drawLayer = drawControl.layer;
        var importName = tempSession.getCurrentSessionKey() + '_' + ($('#baseline-draw-form-name').val() || Util.getRandomLorem()) + '_baseline';
        
        if (drawLayer.features.length) {
            LOG.info('User has drawn a feature and is saving it');
            geoserver.importFile({
                token : '',
                importName : importName, 
                workspace : 'ch-input',
                callbacks : [function(data) {
                    if (data.success === 'true') {
                        LOG.info('File imported successfully - reloading current file set from server');
                    // Do WFS-T to fill out the layer


                    //                        geoserver.getWMSCapabilities({
                    //                            callbacks : [
                    //                            function (data) {
                    //                                ui.populateFeaturesList(data, context);
                    //                                tempSession.addFileToSession(data);
                    //                            // TODO - add the layer just imported 
                    //                            }
                    //                            ]
                    //                        })
                    } else {
                        // TODO - Notify the user
                        LOG.warn(data.error);
                    }
                }]
            });
        } else {
            LOG.info('User has not drawn any features to save');
        }
    },
    createDrawPanel : function() {
        var well = $('<div />').attr('id', 'draw-panel-well').addClass('well');
        var fluidContainer = $('<div />').attr('id', 'draw-panel-container').addClass('container-fluid');
        var rows = [];
        rows.push( 
            $('<div />').addClass('row-fluid span12').append(
                // Baseline Name
                $('<input />').addClass('input-xlarge span6').attr('id', 'baseline-draw-form-name').val(Util.getRandomLorem()).
                before($('<label />').addClass('control-label').attr('for', 'baseline-draw-form-name').html('Baseline Name'))
                ),
            $('<div />').addClass('row-fluid span12').append(
                // Baseline Name
                $('<button />').addClass('btn').attr('id', 'baseline-draw-form-save').html('Save').on('click', Baseline.saveDrawnFeatures).
                after($('<button />').addClass('btn').attr('id', 'baseline-draw-form-clear').html('Clear').on('click', Baseline.clearDrawFeatures))
                )
            )
        
        $(rows).each(function(i,row) {
            fluidContainer.append(row);
        })
        
        return well.append(fluidContainer)
    }
}