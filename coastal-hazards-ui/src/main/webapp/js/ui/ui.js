
var UI = function() {
    var me = (this === window) ? {} : this;
    
    me.work_stages = ['shorelines', 'baseline', 'transects', 'intersections', 'results'];
    
    $('.nav-stacked>li>a').each(function(indexInArray, valueOfElement) { 
        $(valueOfElement).on('click', function() {
            me.switchImage(indexInArray);
        })
    })
    
    return $.extend(me, {
        bindControls : function() {
            $('#clear-sessions-btn').on("click", function(){
                localStorage.clear();
                sessionStorage.clear();
                LOG.debug('UI.js::Cleared sessions. Reloading application.')
                location.reload();
            })
            $('#baseline-draw-btn').on("click", Baseline.drawButtonToggled);
            $('#create-transects-toggle').on('click', Transects.createTransectsButtonToggled);
            $('#create-transects-input-button').on('click', Transects.createTransectSubmit);
            $("#create-intersections-btn").on("click", Intersections.calcIntersections);
        },
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
        initializeBaselineEditForm : function() {
            LOG.info('UI.js::initializeBaselineEditForm: Initializing Display')
            
            var layerName = $("#baseline-list option:selected")[0].value;
            var layerTitle = $("#baseline-list option:selected")[0].text;
            LOG.debug('UI.js::initializeBaselineEditForm: Layer to be edited: ' + layerName);
            
            LOG.debug('UI.js::initializeBaselineEditForm: Re-binding edit layer save button click event');
            $('#baseline-edit-save-button').unbind('click', Baseline.saveEditedLayer);
            $('#baseline-edit-save-button').on('click', Baseline.saveEditedLayer);
            
            $('.baseline-edit-toggle').each(function(i,toggle) {
                
                LOG.debug('UI.js::initializeBaselineEditForm: Turning all toggles to DISABLED');
                if ($(toggle).find('input').attr('checked')) {
                    $(toggle).find('input').removeAttr('checked');
                    $(toggle).toggleSlide();
                }
                
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
                
            })
        },
        initializeUploader : function(args) {
            LOG.info('UI.js::initializeUploader: Initializing uploader for the '  + context + ' context');
            var caller = args.caller;
            var context = caller.stage;
            
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
                caller : caller,
                text: {
                    uploadButton: '<i class="icon-upload icon-white"></i>Upload'
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
                                            callbacks : {
                                                success : [
                                                function (data) {
                                                    CONFIG.tempSession.updateLayersFromWMS(data);
                                                    CONFIG.ui.populateFeaturesList({
                                                        caps : data,
                                                        caller : caller
                                                    });
                                                }
                                                ],
                                                error : []
                                            }
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
        populateFeaturesList : function(args) {
            var caps = args.caps;
            var caller = args.caller;
            var suffixes = caller.suffixes || [];
            var stage = caller.stage;
            
            LOG.info('UI.js::populateFeatureList:: Populating feature list for ' + stage);
            $('#'+stage+'-list').children().remove();
        
            // Add a blank spot at the top of the select list
            if (stage == Baseline.stage|| stage == Transects.stage||stage == Intersections.stage) {
                $('#'+stage+'-list')
                .append($("<option />")
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
                    
                    var type = title.substr(title.lastIndexOf('_'));
                    if (suffixes.length == 0 || suffixes.find(type.toLowerCase())) {
                        LOG.debug('UI.js::populateFeaturesList: Found a layer to add to the '+stage+' listbox: ' + title)
                        
                        var stageConfig = CONFIG.tempSession.getStageConfig({
                            stage : stage,
                            name : layer.name
                        })
                        
                        $('#'+stage+'-list')
                        .append($("<option />")
                            .attr("value",layer.name)
                            .text(shortenedTitle));
                            
                        
                        CONFIG.tempSession.setStageConfig({
                            stage : stage,
                            config : stageConfig
                        })
                    } 
                }
            })
            
            LOG.debug('UI.js::populateFeaturesList: Re-binding select list');
            $('#'+stage+'-list').unbind('change');
            $('#'+stage+'-list').change(function(index, option) {
                caller.listboxChanged(index, option)
            }) 
            
            return  $('#'+stage+'-list');
        },
        showShorelineInfo : function(event) {
            LOG.info('UI.js::showShorelineInfo: The map was clicked and a response from the OWS resource was received');
            if (event.features.length) {
                LOG.debug('UI.js::showShorelineInfo: Features were returned from the OWS resource. Parsing and creating table to display');
                
                LOG.trace('UI.js::showShorelineInfo: Closing any other open identify windows');
                $('.olPopupCloseBox').each(function(i,v){
                    v.click();
                }) 
                
                var layerName = event.features[0].fid.split('.')[0];
                var shorelineIdContainer = $('<div />').attr('id', layerName + '-id-container').addClass('shoreline-id-container');
                var shorelineIdTable = $('<table />').attr('id', layerName + '-id-table').addClass('shoreline-id-table table table-striped table-condensed');
                var thead = $('<thead />');
                var theadTr = $('<tr />');
                var tbody = $('<tbody />');
                thead.append($('<caption />').append($('<h3 />').append(layerName)))
                
                $(Object.keys(event.features[0].attributes)).each(function(i,v) {
                    theadTr.append($('<th />').append(v))
                });
                thead.append(theadTr);
                
                LOG.debug('UI.js::showShorelineInfo: Creating table for ' + event.features.length + ' features');
                $(event.features).each(function(i,v) {
                    var tbodyTr = $('<tr />');
                    
                    $(Object.values(v.attributes)).each(function(aInd, aVal) {
                        tbodyTr.append($('<td />').append(aVal))
                    })
                    
                    var layer =  CONFIG.tempSession.getStageConfig({
                        name : layerName,
                        stage : Shorelines.stage
                    })
                    var dateAttribute = this.attributes['DATE_'] || this.attributes['Date_'];
                    var year = dateAttribute.split('/')[2];
                    var isVisible = layer.view["years-disabled"].indexOf(year) == -1;
                    var  disableButton = $('<button />').addClass('btn btn-year-toggle').attr({
                        'type' : 'button',
                        'year' :  year
                    }).html(isVisible ? 'Disable' : 'Enable');
                    if (isVisible) {
                        disableButton.addClass('btn-success');
                    } else {
                        disableButton.addClass('btn-danger');
                    }
                    tbodyTr.append($('<td />').append(disableButton))
                    tbody.append(tbodyTr);
                });
                
                shorelineIdTable.append(thead);
                shorelineIdTable.append(tbody);
                shorelineIdContainer.append(shorelineIdTable);
                    
                LOG.debug('UI.js::showShorelineInfo: Table created, displaying new identify window');
                CONFIG.map.getMap().addPopup(new OpenLayers.Popup.FramedCloud(
                    "FramedCloud", 
                    CONFIG.map.getMap().getLonLatFromPixel(event.xy),
                    null,
                    shorelineIdContainer.html(),
                    null,
                    true
                    ));
                        
                $('.btn-year-toggle').click(function(event) {
                    var year = $(event.target).attr('year');
                    var toggle = $('#shoreline-color-table-row-'+year+' .toggle-button');
                    
                    var allButtonsOfSameYear = $('.btn-year-toggle[year="'+year+'"]');
                    if (toggle.hasClass('disabled')) {
                        allButtonsOfSameYear.removeClass('btn-success');
                        allButtonsOfSameYear.addClass('btn-danger');
                        allButtonsOfSameYear.html('Enable');
                    } else {
                        allButtonsOfSameYear.removeClass('btn-danger');
                        allButtonsOfSameYear.addClass('btn-success');
                        allButtonsOfSameYear.html('Disable');
                    }
                    
                    toggle.toggleButtons('toggleState');
                });
                        
            } else {
                LOG.debug('UI.js::showShorelineInfo: No features were found at point of mouse click');
            }
        }
    });
}




