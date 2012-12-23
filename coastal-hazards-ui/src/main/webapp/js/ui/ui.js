
var UI = function() {
    var me = (this === window) ? {} : this;
    
    me.work_stages = ['shorelines', 'baseline', 'transects', 'intersections', 'results'];
    
    $('.nav-stacked>li>a').each(function(indexInArray, valueOfElement) { 
        $(valueOfElement).on('click', function() {
            me.switchImage(indexInArray);
        })
    })
    
    return $.extend(me, {
        switchImage : function (stage) {
            for (var stageIndex = 0;stageIndex < me.work_stages.length;stageIndex++) {
                var workStage = me.work_stages[stageIndex];
                var imgId = '#' + workStage + '_img';
                if (stageIndex < stage) {
                    $(imgId).attr('src', 'images/workflow_figures/' + workStage + '_past.png');
                } else if (stageIndex == stage) {
                    $(imgId).attr('src', 'images/workflow_figures/' + workStage + '.png');
                } else {
                    $(imgId).attr('src', 'images/workflow_figures/' + workStage + '_future.png');
                }
            }
        },
        transectListboxChanged : function() {
            LOG.debug('Transect listbox changed');
            $("#transects-list option:not(:selected)").each(function (index, option) {
                var layers = CONFIG.map.getMap().getLayersBy('name', option.value);
                if (layers.length) {
                    $(layers).each(function(i,l) {
                        CONFIG.map.getMap().removeLayer(l);
                    })
                }
            });
            if ($("#transects-list option:selected")[0].value) {
                Transects.addTransects({
                    name : $("#transects-list option:selected")[0].value 
                })
            }
        },
        populateFeaturesList : function(caps, context) {
            LOG.info('UI.js::populateFeatureList:: Populating feature list for ' + context);
            $('#'+context+'-list').children().remove();
        
            if (context == 'baseline' || context == 'transects') {
                $('#'+context+'-list')
                .append($("<option></option>")
                    .attr("value",'')
                    .text(''));
            }
        
            $(caps.capability.layers).each(function(i, layer) { 
                var currentSessionKey = CONFIG.tempSession.getCurrentSessionKey();
                var title = layer.title;
            
                // Add the option to the list only if it's from the sample namespace or
                // if it's from the input namespace and in the current session
                if (layer.prefix === 'sample' || (layer.prefix === 'ch-input' && title.has(currentSessionKey) )) {
                        
                    var shortenedTitle = title.has(currentSessionKey) ?  
                    title.remove(currentSessionKey + '_') : 
                    title;

                    if (title.substr(title.lastIndexOf('_') + 1) == context) {
                        LOG.debug('Found a layer to add to the '+context+' listbox: ' + title)
                        $('#'+context+'-list')
                        .append($("<option></option>")
                            .attr("value",layer.name)
                            .text(shortenedTitle));
                    } 
                }
            })
            
            if (context == 'shorelines') {
                $('#'+context+'-list').unbind('change');
                $('#'+context+'-list').change(function(index, option) {
                    Shorelines.shorelineSelected()
                }) 
            } else if (context == 'baseline') {
                $('#'+context+'-list').unbind('change');
                $('#'+context+'-list').change(function(index, option) {
                    Baseline.baselineSelected()
                }) 
            }
        },
        displayBaselineEditButton : function() {
            LOG.info('UI.js::displayBaselineEditButton: Showing baseline edit button on panel')
            
            var baselineEditButton = $('#baseline-edit-form-toggle');
            
            LOG.debug('UI.js::displayBaselineEditButton: Un-hiding baseline edit button');
            $(baselineEditButton).removeClass('hidden');
            
            LOG.debug('UI.js::displayBaselineEditButton: Rebinding click event hookon baseline edit button');
            $(baselineEditButton).unbind('click');
            $(baselineEditButton).on('click', function(event) {
                LOG.debug('UI.js::?: Baseline Edit Button Clicked');
                
                var displayForm = $(event.currentTarget).hasClass('active') ? false : true;
                
                if (displayForm) {
                    LOG.debug('UI.js::?: DisplayForm to be displayed');
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
                    CONFIG.map.removeControl({ id : 'baseline-edit-control'});
                    LOG.debug('UI.js::?: Adding clone control to map');
                    CONFIG.map.getMap().addControl(editControl);
                    
                    CONFIG.ui.initializeBaselineEditForm();
                    
                } else {
                    // remove edit layer, remove edit control
                    CONFIG.map.removeLayerByName('baseline-edit-layer');
                    CONFIG.map.getMap().removeControl(CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0])
                }
                
                $("#baseline-edit-panel-well").toggleClass('hidden');
            })
        },
        initializeBaselineEditForm : function() {
            LOG.info('UI.js::initializeBaselineEditForm: Initializing Display')
            var layerName = $("#baseline-list option:selected")[0].value;
            var layerTitle = $("#baseline-list option:selected")[0].text;
            
            LOG.debug('UI.js::initializeBaselineEditForm: Re-binding edit layer save button click event');
            $('#baseline-edit-save-button').unbind('click');
            $('#baseline-edit-save-button').on('click', function(event) {
                LOG.debug('UI.js::?: Edit layer save button clicked');
                
                var layer = CONFIG.map.getMap().getLayersByName('baseline-edit-layer')[0];
                var saveStrategy = layer.strategies.find(function(n) {
                    return n['CLASS_NAME'] == 'OpenLayers.Strategy.Save'
                });
                        
                saveStrategy.events.remove('success');

                saveStrategy.events.register('success', null, function() {
                    LOG.debug('UI.js::?:Layer was updated on OWS server. Refreshing layer list');
                    
                    CONFIG.map.removeLayerByName(layer.cloneOf);
                    
                    Baseline.refreshFeatureList({
                        selectLayer : layer.cloneOf
                    })
                    
                    $('#baseline-edit-form-toggle').click();
                });
                
                saveStrategy.save();
                
            })
            
            $('.baseline-edit-toggle').each(function(i,toggle) {
                
                if ($(toggle).find('input').attr('checked')) {
                    $(toggle).find('input').removeAttr('checked');
                }
                
                $(toggle).toggleSlide({
                    onClick: function (event, status) {
                        // Sometimes the click event comes twice if clicking on the toggle graphic instead of 
                        // the toggle text. When this happens, check for event.timeStamp being 0. When that happens,
                        // we've already handled the onclick 
                        if (event.timeStamp) {
                            var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0];
                            var editLayer = CONFIG.map.getMap().getLayersBy('name', 'baseline-edit-layer')[0];
                        
                            var selectedOptions = {};    
                            modifyControl.deactivate();
                            var anyTrue = false;
                                                
                            $('.baseline-edit-toggle>input').each(function(i,cb) {
                                selectedOptions[cb.id] = $(cb).attr('checked') ? true : false;
                                
                                // If we are reading the current target's boolean state, we need to 
                                // flip it because this event happens before the checkbox gets a check 
                                // in it
                                if ($(event.currentTarget).children()[0].id === $(cb).attr('id')) {
                                    selectedOptions[cb.id] = !selectedOptions[cb.id];
                                }
                            })
                            
                            modifyControl.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
                        
                            $(Object.keys(selectedOptions)).each(function(i,v){
                                if (selectedOptions[v]) {
                                    switch (v) {
                                        case 'toggle-create-vertex-checkbox':
                                            modifyControl.mode.createVertices = true;
                                            anyTrue = true;
                                            break;
                                        case 'toggle-allow-rotation-checkbox':
                                            modifyControl.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
                                            modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                                            anyTrue = true;
                                            break
                                        case 'toggle-allow-resizing-checkbox':
                                            modifyControl.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
                                            if (selectedOptions['toggle-aspect-ratio-checkbox']) {
                                                modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                                            }
                                            anyTrue = true;
                                            break;
                                        case 'toggle-allow-dragging-checkbox':
                                            modifyControl.mode |= OpenLayers.Control.ModifyFeature.DRAG;
                                            modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                                            anyTrue = true;
                                            break;
                                    }
                                } else {
                                    switch (v) {
                                        case 'toggle-allow-resizing-checkbox':
                                            $('#toggle-allow-resizing-checkbox').parent().addClass('disabled')
                                    }
                                }
                            })
                            
                            if (anyTrue) {
                                LOG.debug('Found at least one modify option toggled true. Activating modify control.')
                                modifyControl.activate();
                                $(editLayer.features).each(function(i,f) {
                                    modifyControl.selectFeature(f);
                                })
                            } else {
                                LOG.debug('Did not find at least one modify option toggled true. Modify Control remains deactivated.')
                                $(editLayer.features).each(function(i,f) {
                                    modifyControl.unselectFeature(f);
                                })
                            }
                        }
                    },
                    text: {
                        enabled: false, 
                        disabled: false
                    },
                    style: {
                        enabled: 'primary',
                        disabled : 'danger'
                    },
                    layerName : layerName,
                    layerTitle : layerTitle
                })
            })
            
            
        },
        initializeUploader : function(args) {
            LOG.info('UI.js::initializeUploader: Initializing uploader for the '  + args.context + ' context');
            var context = args.context;
            var uploader = new qq.FineUploader({
                element: document.getElementById(context + '-uploader'),
                request: {
                    endpoint: 'service/upload'
                },
                validation: {
                    allowedExtensions: ['zip']
                },
                multiple : false,
                autoUpload: true,
                text: {
                    uploadButton: '<i class="icon-upload icon-white"></i>Upload ' + context
                },
                template: '<div class="qq-uploader span4">' +
                '<pre class="qq-upload-drop-area span4"><span>{dragZoneText}</span></pre>' +
                '<div class="qq-upload-button btn btn-success" style="width: auto;">{uploadButtonText}</div>' +
                '<ul class="qq-upload-list hidden" style="margin-top: 10px; text-align: center;"></ul>' +
                '</div>',
                classes: {
                    success: 'alert alert-success',
                    fail: 'alert alert-error'
                },
                callbacks: {
                    onComplete: function(id, fileName, responseJSON) {
                        if (responseJSON.success != 'true') {
                            // TODO - Notify the user
                            LOG.info('File failed to complete upload')
                        } else {
                            LOG.info("UI.js::initializeUploader: Upload complete: File token returned: :" + responseJSON['file-token']);
                            
                            var importName = CONFIG.tempSession.getCurrentSessionKey() + '_' + responseJSON['file-name'].split('.')[0] + '_' + context;
                            
                            CONFIG.ows.importFile({
                                'file-token' : responseJSON['file-token'],
                                importName : importName, 
                                workspace : 'ch-input',
                                callbacks : [function(data) {
                                    if (data.success === 'true') {
                                        LOG.info('UI.js::(anon function): Import complete. Will now call WMS GetCapabilities to refresh session object and ui.');
                                        CONFIG.ows.getWMSCapabilities({
                                            callbacks : [
                                            function (data) {
                                                CONFIG.tempSession.updateSessionLayersFromWMSCaps(data);
                                                CONFIG.ui.populateFeaturesList(data, context);
                                            }
                                            ]
                                        })
                                    } else {
                                        // TODO - Notify the user
                                        LOG.warn(data.error);
                                    }
                                }]
                            });
                        }
                    }
                }
            })
        }
    });
}




