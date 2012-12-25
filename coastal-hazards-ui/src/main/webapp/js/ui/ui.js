
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
            LOG.info('UI.js::switchImage: Changing application context to ' + me.work_stages[stage])
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
            LOG.info('UI.js::transectListboxChanged: Transect listbox changed');
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
        initializeBaselineEditForm : function() {
            LOG.info('UI.js::initializeBaselineEditForm: Initializing Display')
            
            var layerName = $("#baseline-list option:selected")[0].value;
            var layerTitle = $("#baseline-list option:selected")[0].text;
            LOG.debug('UI.js::initializeBaselineEditForm: Layer to be edited: ' + layerName);
            
            LOG.debug('UI.js::initializeBaselineEditForm: Re-binding edit layer save button click event');
            $('#baseline-edit-save-button').unbind('click', Baseline.saveEditedLayer);
            $('#baseline-edit-save-button').on('click', Baseline.saveEditedLayer);
            
            $('.baseline-edit-toggle').each(function(i,toggle) {
                
                LOG.debug('UI.js::initializeBaselineEditForm: Attaching toggle event to all toggles');
                $(toggle).toggleSlide({
                    onClick: function (event, status) {
                        // Sometimes the click event comes twice if clicking on the toggle graphic instead of 
                        // the toggle text. When this happens, check for event.timeStamp being 0. When that happens,
                        // we've already handled the onclick 
                        LOG.trace('UI.js::initializeBaselineEditForm: Event timestamp:' + event.timeStamp);
                        if (event.timeStamp) {
                            var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0];
                            var editLayer = CONFIG.map.getMap().getLayersBy('name', 'baseline-edit-layer')[0];
                        
                            var selectedOptions = {};    
                            var anyTrue = false;
                            
                            LOG.debug('UI.js::initializeBaselineEditForm: Edit control is being deactivated. Will get reactivated after initialization');
                            modifyControl.deactivate();
                                                
                            LOG.trace('UI.js::initializeBaselineEditForm: Checking which toggles are active and which are not');
                            $('.baseline-edit-toggle>input').each(function(i,cb) {
                                selectedOptions[cb.id] = $(cb).attr('checked') ? true : false;
                                
                                // If we are reading the current target's boolean state, we need to 
                                // flip it because this event happens before the checkbox gets a check in it
                                if ($(event.currentTarget).children()[0].id === $(cb).attr('id')) {
                                    selectedOptions[cb.id] = !selectedOptions[cb.id];
                                }
                            })
                            
                            modifyControl.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
                            
                            if ($(event.currentTarget).children()[0].id === 'toggle-create-vertex-checkbox' &&
                                selectedOptions['toggle-create-vertex-checkbox']) {
                                modifyControl.mode.createVertices = true;
                                if (!$('#toggle-allow-rotation-checkbox').parent().hasClass('disabled')) {
                                    $('#toggle-allow-rotation-checkbox').removeAttr('checked');
                                    $('#toggle-allow-rotation-checkbox').parent().toggleSlide();
                                }
                                if (!$('#toggle-allow-resizing-checkbox').parent().hasClass('disabled')) {
                                    $('#toggle-allow-resizing-checkbox').removeAttr('checked');
                                    $('#toggle-allow-resizing-checkbox').parent().toggleSlide();
                                }
                                if (!$('#toggle-allow-dragging-checkbox').parent().hasClass('disabled')) {
                                    $('#toggle-allow-dragging-checkbox').removeAttr('checked');
                                    $('#toggle-allow-dragging-checkbox').parent().toggleSlide();
                                }
                                if (!$('#toggle-aspect-ratio-checkbox').parent().hasClass('disabled')) {
                                    $('#toggle-allow-dragging-checkbox').removeAttr('checked');
                                    $('#toggle-allow-dragging-checkbox').parent().toggleSlide();
                                }
                                            
                                anyTrue = true;
                            } else {
                                $(Object.keys(selectedOptions)).each(function(i,v){
                                    var createVertexCheckbox = $('#toggle-create-vertex-checkbox')
                                    if (selectedOptions[v]) {
                                        switch (v) {
                                            case 'toggle-allow-rotation-checkbox':
                                                modifyControl.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
                                                modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                                                if (!createVertexCheckbox.parent().hasClass('disabled')) {
                                                    createVertexCheckbox.removeAttr('checked');
                                                    createVertexCheckbox.parent().toggleSlide();
                                                }
                                                anyTrue = true;
                                                break;
                                            case 'toggle-allow-resizing-checkbox':
                                                modifyControl.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
                                                if (selectedOptions['toggle-aspect-ratio-checkbox']) {
                                                    modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                                                }
                                                if (!createVertexCheckbox.parent().hasClass('disabled')) {
                                                    createVertexCheckbox.removeAttr('checked');
                                                    createVertexCheckbox.parent().toggleSlide();
                                                }
                                                anyTrue = true;
                                                break;
                                            case 'toggle-allow-dragging-checkbox':
                                                modifyControl.mode |= OpenLayers.Control.ModifyFeature.DRAG;
                                                modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                                                if (!createVertexCheckbox.parent().hasClass('disabled')) {
                                                    createVertexCheckbox.removeAttr('checked');
                                                    createVertexCheckbox.parent().toggleSlide();
                                                }
                                                anyTrue = true;
                                                break;
                                        }
                                    } else {
                                        switch (v) {
                                            case 'toggle-allow-resizing-checkbox':
                                                if (!$('#toggle-aspect-ratio-checkbox').parent().hasClass('disabled')) {
                                                    $('#toggle-aspect-ratio-checkbox').removeAttr('checked');
                                                    $('#toggle-aspect-ratio-checkbox').parent().toggleSlide();
                                                }
                                        }
                                    }
                                })
                            }
                            
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
//                    style: {
//                        enabled: 'success',
//                        disabled : 'danger'
//                    },
                    layerName : layerName,
                    layerTitle : layerTitle
                })
                
                LOG.debug('UI.js::initializeBaselineEditForm: Turning all toggles to DISABLED');
                if ($(toggle).find('input').attr('checked')) {
                    $(toggle).find('input').removeAttr('checked');
                    $(toggle).toggleSlide();
                }
            })
        },
        initializeUploader : function(args) {
            var context = args.context;
            LOG.info('UI.js::initializeUploader: Initializing uploader for the '  + context + ' context');
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
                '<pre class="qq-upload-drop-area span4 hidden"><span>{dragZoneText}</span></pre>' +
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
                                                CONFIG.tempSession.updateLayersFromWMS(data);
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
            
            return uploader;
        },
        populateFeaturesList : function(caps, context) {
            LOG.info('UI.js::populateFeatureList:: Populating feature list for ' + context);
            $('#'+context+'-list').children().remove();
        
            // Ad a blank spot at the top of the select list
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
                        LOG.debug('UI.js::populateFeaturesList: Found a layer to add to the '+context+' listbox: ' + title)
                        $('#'+context+'-list')
                        .append($("<option></option>")
                            .attr("value",layer.name)
                            .text(shortenedTitle));
                    } 
                }
            })
            
            if (context == 'shorelines') {
                LOG.debug('UI.js::populateFeaturesList: Re-binding select list for Shorelines');
                $('#'+context+'-list').unbind('change');
                $('#'+context+'-list').change(function(index, option) {
                    Shorelines.shorelineSelected()
                }) 
            } else if (context == 'baseline') {
                LOG.debug('UI.js::populateFeaturesList: Re-binding select list for Baseline');
                $('#'+context+'-list').unbind('change');
                $('#'+context+'-list').change(function(index, option) {
                    Baseline.baselineSelected()
                }) 
            }
        }
    });
}




