var UI = function() {
    LOG.info('UI.js::constructor: UI class is initializing.');
    var me = (this === window) ? {} : this;
    me.work_stages = ['shorelines', 'baseline', 'transects', 'calculation', 'results'];
    me.work_stages_objects = [Shorelines, Baseline, Transects, Calculation, Results];
    
    LOG.debug('UI.js::constructor: Setting popup hover delay to ' + popupHoverDelay);
    var popupHoverDelay = CONFIG.popupHoverDelay;
    
    $('#clear-sessions-btn').on("click", CONFIG.tempSession.clearSessions)
        
    LOG.debug('UI.js::constructor: Initializing AJAX start/stop hooks');
    $(document).ajaxStart(function() {
        LOG.debug('AJAX Call Started');
        $("#application-spinner").fadeIn();
    });
    $(document).ajaxStop(function() {
        LOG.debug('AJAX Call Finished');
        $("#application-spinner").fadeOut();
    });
    
    me.work_stages_objects.each(function(stage) {
        if (stage.description.stage) {
            $('#nav-list a[href="#'+stage.stage+'"]').popover({
                title : stage.stage.capitalize(),
                content : $('<div />')
                .append($('<div />').html(stage.description.stage))
                .html(),
                html : true,
                placement : 'right',
                trigger : 'hover',
                delay : {
                    show : popupHoverDelay
                }
            })
        }
        
        if (stage.description['view-tab']) {
            $('#'+stage.stage+' [href="#'+stage.stage+'-view-tab"]').popover({
                title : stage.stage.capitalize() + ' View',
                content : $('<div />')
                .append($('<div />').html(stage.description['view-tab']))
                .html(),
                html : true,
                placement : 'top',
                trigger : 'hover',
                delay : {
                    show : popupHoverDelay
                }
            })
        }
            
        if (stage.description['manage-tab']) {
            $('#'+stage.stage+' [href="#'+stage.stage+'-manage-tab"]').popover({
                title : stage.stage.capitalize() + ' Manage',
                content : $('<div />')
                .append($('<div />').html(stage.description['manage-tab']))
                .html(),
                html : true,
                placement : 'top',
                trigger : 'hover',
                delay : {
                    show : popupHoverDelay
                }
            })
        }
            
        if (stage.description['upload-button']) {
            $('#'+stage.stage+'-triggerbutton').popover({
                title : stage.stage.capitalize() + ' Resource Upload',
                content : $('<div />')
                .append($('<div />').html(stage.description['upload-button']))
                .html(),
                html : true,
                placement : 'bottom',
                trigger : 'hover',
                delay : {
                    show : popupHoverDelay
                }
            })
        }
    
        $('.feature-list').popover({
            title : 'Layer Selection',
            content : $('<div />')
            .append($('<div />').css({
                'color': '#661111',
                'text-shadow' : '0px 0px 1px #ffffff',
                'filter' : 'dropshadow(color=#ffffff, offx=0, offy=0);'
            }).html('Published (read-only)'))
            .append($('<div />').css({
                'color' : '#116611',
                'text-shadow' : '0px 0px 1px #ffffff',
                'filter' : 'dropshadow(color=#ffffff, offx=0, offy=0);'
            }).html('Yours'))
            .html(),
            html : true,
            placement : 'bottom',
            trigger : 'hover',
            delay : {
                show : popupHoverDelay
            }
        })
    })
    
    $('#map-well').popover({
        title : 'Map',
        content : $('<div />')
        .append($('<div />').html('Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium'))
        .html(),
        html : true,
        placement : 'left',
        trigger : 'hover',
        delay : {
            show : popupHoverDelay
        }
    })
    
    $('.nav-stacked>li>a').each(function(index, ele) { 
        $(ele).on('click', function() {
            me.switchStage(index);
        })
    })
    
    LOG.debug('UI.js::constructor: UI class initialized.');
    return $.extend(me, {
        displayStage : function(caller) {
            $('#stage-select-tablist a[href="#'+caller.stage+'"]').trigger('click');
        },
        createModalWindow : function(args) {
            var headerHtml = args.headerHtml || '';
            var bodyHtml = args.bodyHtml || '';
            var buttons = args.buttons || [];
            
            $('#application-overlay').fadeOut();
            $('#modal-window-label').html(headerHtml);
            $('#modal-body-content').html(bodyHtml);
            $('#modal-window>.modal-footer').html('');

            buttons.each(function(button) {
                var text = button.text;
                var callback = button.callback;
                var modalButton = $('<button />')
                .addClass('btn')
                .html(text)
                .on('click', callback)
                .on('click', function() {
                    $("#modal-window").modal('hide');
                })
                $('#modal-window>.modal-footer').append(modalButton)
            })
            
            $('#modal-window>.modal-footer').append(
                $('<button />')
                .addClass('btn')
                .attr({
                    'data-dismiss' : 'modal',
                    'aria-hidden' : 'true'
                })
                .html('Cancel'))
            
            
            $("#modal-window").modal('show');
        },
        switchStage : function (stage) {
            LOG.info('UI.js::switchImage: Changing application context to ' + me.work_stages[stage])
            
            var caller = me.work_stages_objects[stage]
            me.work_stages_objects.filter(function(stage) {
                return stage != caller
            }).each(function(stage) {
                stage.leaveStage();
            })
            
            caller.enterStage();
            
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
        baselineEditFormButtonToggle : function($el, status, e) {
            var modifyControl = CONFIG.map.getMap().getControlsBy('id', 'baseline-edit-control')[0];
            var selectControl = CONFIG.map.getMap().getControlsBy('title', 'baseline-select-control')[0];
            var id = $el.parent().attr('id');
                        
            LOG.debug('UI.js::baselineEditFormButtonToggle: Edit control is being deactivated. Will get reactivated after initialization');
                        
            if (modifyControl.active) {
                modifyControl.deactivate();
            }
            if (status) {
                if (id != 'toggle-aspect-ratio-checkbox') {
                    $('.baseline-edit-toggle:not(#'+id+')').bootstrapSwitch('setState', false);
                }
                        
                modifyControl.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
                            
                switch(id) {
                    case 'toggle-create-vertex-checkbox': {
                        modifyControl.mode.createVertices = true;
                        break;
                    }
                    case 'toggle-allow-rotation-checkbox': {
                        modifyControl.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
                        modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                        break;
                    }
                    case 'toggle-allow-dragging-checkbox': {
                        modifyControl.mode |= OpenLayers.Control.ModifyFeature.DRAG;
                        modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                        break;
                    }
                    case 'toggle-allow-resizing-checkbox': {
                        modifyControl.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
                        if ($('.baseline-edit-toggle#toggle-aspect-ratio-checkbox').bootstrapSwitch('status')) {
                            modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                        }
                        break
                    }
                    case 'toggle-aspect-ratio-checkbox': {
                        if ($('.baseline-edit-toggle#toggle-allow-resizing-checkbox').bootstrapSwitch('status')) {
                            modifyControl.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
                            modifyControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                        }
                        break;
                    }
                }
                LOG.debug('UI.js::baselineEditFormButtonToggle:Found at least one modify option toggled true. Activating modify control.')
                modifyControl.activate();
                if (selectControl.layer.selectedFeatures[0]) {
                    modifyControl.selectFeature(selectControl.layer.selectedFeatures[0]);
                }
            }
        },
        initializeBaselineEditForm : function() {
            LOG.info('UI.js::initializeBaselineEditForm: Initializing Display')
            
            var layerName = $("#baseline-list option:selected")[0].value;
            LOG.debug('UI.js::initializeBaselineEditForm: Layer to be edited: ' + layerName);
            
            LOG.debug('UI.js::initializeBaselineEditForm: Re-binding edit layer save button click event');
            $('#baseline-edit-save-button').unbind('click', Baseline.saveEditedLayer);
            $('#baseline-edit-save-button').on('click', Baseline.saveEditedLayer);
            
            // Searching for toggles that do NOT have the toggle-button class means 
            // we won't re-intialize a toggle button (which causes all sorts of issues)
            var toggles = $('.baseline-edit-toggle:not(.switch)');
            toggles.removeAttr('checked');
            toggles.bootstrapSwitch();
            toggles.on('switch-change', function(e, data){
                var $el = $(data.el).parent();
                var status = data.value;
                CONFIG.ui.baselineEditFormButtonToggle($el, status, e);
                });
            $.each(toggles, function(index, element){
                $(element).addClass('switch');
            });
            if (!$('#toggle-direction-checkbox').hasClass('switch')) {

                $('#toggle-direction-checkbox').bootstrapSwitch({
                    width: 200,
                });
                 $('#toggle-direction-checkbox').on('switch-change', function($el, status, e) {
                        var selectControl = CONFIG.map.getMap().getControlsBy('title', 'baseline-select-control')[0];
                        var selectedFeature = CONFIG.map.getMap().getLayersBy('name', 'baseline-edit-layer')[0].features.find(function(n){
                            return n.id == selectControl.layer.selectedFeatures[0].id
                        })
                        if (status) {
                            selectedFeature.attributes.Orient = 'seaward';
                            selectedFeature.state = OpenLayers.State.UPDATE;
                        } else {
                            selectedFeature.attributes.Orient = 'shoreward';
                            selectedFeature.state = OpenLayers.State.UPDATE;
                        }
                    });
            }
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
                classes: {
                    success: 'alert alert-success',
                    fail: 'alert alert-error'
                },
                callbacks: {
                    onComplete: function(id, fileName, responseJSON) {
                        if (responseJSON.success != 'true') {
                            LOG.warn('File failed to complete upload')
                        } else {
                            LOG.info("UI.js::initializeUploader: Upload complete: File token returned: :" + responseJSON['file-token']);
                            
                            var importName = responseJSON['file-name'].split('.')[0] + '_' + context;
                            
                            CONFIG.ows.importFile({
                                'file-token' : responseJSON['file-token'],
                                importName : importName, 
                                workspace : CONFIG.tempSession.getCurrentSessionKey(),
                                callbacks : [
                                function(data) {
                                    if (data.success === 'true') {
                                        LOG.info('UI.js::(anon function): Import complete. Will now call WMS GetCapabilities to refresh session object and ui.');
                                        CONFIG.ows.getWMSCapabilities({
                                            namespace : CONFIG.tempSession.getCurrentSessionKey(),
                                            layerName : data,
                                            callbacks : {
                                                success : [
                                                function (args) {
                                                    CONFIG.ui.showAlert({
                                                        message : 'Upload Successful',
                                                        caller : caller,
                                                        displayTime : 3000,
                                                        style: {
                                                            classes : ['alert-success']
                                                        }
                                                    })
                                                    CONFIG.tempSession.updateLayersFromWMS(args);
                                                    CONFIG.ui.populateFeaturesList({
                                                        caller : caller
                                                    });
                                                    $('a[href="#' + caller.stage + '-view-tab"]').tab('show');
                                                    $('#' + caller.stage + '-list')
                                                    .val(args.context.layerName.feature)
                                                    .trigger('change');
                                                    
                                                }
                                                ],
                                                error : [
                                                function(args) {
                                                    LOG.info('UI.js::Uploader Error Callback: Import incomplete.');
                                                    CONFIG.ui.showAlert({
                                                        message : 'Import incomplete',
                                                        caller : caller,
                                                        displayTime : 3000,
                                                        style: {
                                                            classes : ['alert-error']
                                                        }
                                                    })
                                                }
                                                ]
                                            }
                                        })
                                    } else {
                                        LOG.warn(data.error);
                                        LOG.info('UI.js::Uploader Error Callback: Import incomplete.');
                                        CONFIG.ui.showAlert({
                                            message : 'Import incomplete',
                                            caller : caller,
                                            displayTime : 3000,
                                            style: {
                                                classes : ['alert-error']
                                            }
                                        })
                                                
                                    }
                                }]
                            });
                        }
                    }
                }
            })
            $('#'+context+'-triggerbutton').on('click', function() {
                $('#'+context+'-uploader input').fineUploader().trigger('click')
            })
            return uploader;
        },
        populateFeaturesList : function(args) {
            var wmsCapabilities = CONFIG.ows.wmsCapabilities;
            var caller = args.caller;
            var suffixes = caller.suffixes || [];
            var stage = args.stage || caller.stage;
            
            LOG.info('UI.js::populateFeaturesList:: Populating feature list for ' + stage);
            $('#'+stage+'-list').children().remove();
        
            // Add a blank spot at the top of the select list
            if (stage != Shorelines.stage) {
                $('#'+stage+'-list')
                .append($("<option />")
                    .attr("value",'')
                    .text(''));
            }
        
            wmsCapabilities.keys().each(function(layerNS) {
                var cap = wmsCapabilities[layerNS];
                var layers = cap.capability.layers;
                var sessionLayerClass = 'session-layer';
                var publishedLayerClass = 'published-layer';
                
                layers.each(function(layer) {
                    var currentSessionKey = CONFIG.tempSession.getCurrentSessionKey();
                    var title = layer.title;
            
                    // Add the option to the list only if it's from the sample namespace or
                    // if it's from the input namespace and in the current session
                    if (layerNS == CONFIG.name.published || layerNS == currentSessionKey) {
                        var type = title.substr(title.lastIndexOf('_'));
                        if (suffixes.length == 0 || suffixes.find(type.toLowerCase())) {
                            LOG.debug('UI.js::populateFeaturesList: Found a layer to add to the '+stage+' listbox: ' + title)
                            var layerFullName = layer.prefix + ':' + layer.name;
                            var sessionStage = CONFIG.tempSession.getStage(stage);
                            var lIdx = sessionStage.layers.findIndex(function(l) {
                                return l == layerFullName;
                            })
                            if (lIdx == -1) {
                                sessionStage.layers.push(layerFullName);
                            }
                            CONFIG.tempSession.persistSession();
                            var option = $("<option />")
                            .attr({
                                "value" : layerNS + ':' + layer.name
                            })
                            .addClass(layerNS == 'sample' ? publishedLayerClass : sessionLayerClass)
                            .text(layer.name)
                            
                            $('#'+stage+'-list')
                            .append(option);
                        } 
                    }
                })
            })
            
            CONFIG.tempSession.persistSession();
            LOG.debug('UI.js::populateFeaturesList: Re-binding select list');
            $('#'+stage+'-list').unbind('change');
            $('#'+stage+'-list').change(function(index, option) {
                caller.listboxChanged(index, option)
            }) 
            
            return  $('#'+stage+'-list');
        },
        showShorelineInfo : function(event) {
            LOG.info('UI.js::showShorelineInfo');
            LOG.debug('UI.js::showShorelineInfo: The map was clicked and a response from the OWS resource was received');
            Shorelines.closeShorelineIdWindows();
            if (event.features.length) {
                LOG.debug('UI.js::showShorelineInfo: Features were returned from the OWS resource. Parsing and creating table to display');
                
                LOG.debug('UI.js::showShorelineInfo: Creating table for ' + event.features.length + ' features');
                var groupingColumn = CONFIG.tempSession.getStage(Shorelines.stage).groupingColumn
                var uniqueFeatures = event.features.unique(function(feature) {
                    return feature.data[groupingColumn];
                }).sortBy(function(feature) {
                    return Date.parse(feature.data[groupingColumn]);
                })
                
                LOG.trace('UI.js::showShorelineInfo: Closing any other open identify windows');
                $('.olPopupCloseBox').each(function(i,v){
                    v.click();
                }) 
                
                var layerTitle = event.features[0].fid.split('.')[0]
                var layerName = event.features[0].gml.featureNSPrefix + ':' + layerTitle;
                var shorelineIdContainer = $('<div />').attr('id', layerName + '-id-container').addClass('shoreline-id-container');
                var shorelineIdTable = $('<table />').attr('id', layerName + '-id-table').addClass('shoreline-id-table table table-striped table-condensed');
                var thead = $('<thead />');
                var theadTr = $('<tr />');
                var tbody = $('<tbody />');
                thead.append($('<caption />').append($('<h3 />').append(layerTitle)))
                
                $(Object.keys(event.features[0].attributes)).each(function(i,v) {
                    theadTr.append($('<th />').append(v))
                });
                thead.append(theadTr);
                
                
                
                uniqueFeatures.each(function(feature) {
                    var tbodyTr = $('<tr />');
                    
                    $(Object.values(feature.attributes)).each(function(aInd, aVal) {
                        tbodyTr.append($('<td />').append(aVal))
                    })
                    
                    var config =  CONFIG.tempSession.getStage(Shorelines.stage);
                    var date = new Date(feature.attributes[groupingColumn]).format(config.dateFormat);
                    var isVisible = CONFIG.tempSession.getDisabledDatesForShoreline(layerName).indexOf(date) == -1;
                    var  disableButton = $('<button />')
                    .addClass('btn btn-year-toggle')
                    .attr({
                        type : 'button',
                        date : date,
                        layer : layerName
                    })
                    .html(isVisible ? 'Disable' : 'Enable');
                    
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
                    var date = $(event.target).attr('date');
                    var toggle = $('#shoreline-table-tabcontent>#'+$(event.target).attr('layer').split(':')[1]+' .feature-toggle').filter(function() {
                        return Date.parse($(this).data('date')) == Date.parse(date)
                    })
                    
                    var allButtonsOfSameYear = $('.btn-year-toggle[date="'+date+'"]');
                    if (toggle.bootstrapSwitch('status')) {
                        allButtonsOfSameYear.removeClass('btn-success');
                        allButtonsOfSameYear.addClass('btn-danger');
                        allButtonsOfSameYear.html('Enable');
                    } else {
                        allButtonsOfSameYear.removeClass('btn-danger');
                        allButtonsOfSameYear.addClass('btn-success');
                        allButtonsOfSameYear.html('Disable');
                    }
                    
                    toggle.bootstrapSwitch('toggleState');
                });
                        
            } else {
                LOG.debug('UI.js::showShorelineInfo: No features were found at point of mouse click');
                CONFIG.ui.showAlert({
                    message : 'No shorelines found',
                    caller : Shorelines,
                    displayTime : 2000,
                    style: {
                        classes : ['alert-info']
                    }
                })
            }
        },
        showAlert : function(args) {
            var caller = args.caller || {
                stage : 'application'
            };
            var message = args.message || '';
            var style = args.style || {
                classes : []
            }
            var alertContainer = $('#' + caller.stage + '-alert-container');
            var alertDom = $('<div />').attr('id', caller.stage + '-alert');
            var close = args.close || true;
            var displayTime = args.displayTime || 0;
            
            if (caller.stage == 'application') {
                style.classes.push('span11');
                style.classes.push('offset1');
            }
            
            CONFIG.alertQueue[caller.stage].unshift({
                message : message,
                style : style,
                displayTime : displayTime,
                close : close
            })
            
            var createAlert = function(args) {
                var nextMessageObj = CONFIG.alertQueue[args.caller.stage].pop();
                if (nextMessageObj.hasOwnProperty('message')) {
                    var alertContainer = args.alertContainer;
                    var alertDom = $('<div />');
                    var style = nextMessageObj.style;
                    var close = nextMessageObj.close;
                    var message = nextMessageObj.message;
                    var displayTime = nextMessageObj.displayTime;
                    var createAlertFn = args.createAlertFn
                    var queueLength = CONFIG.alertQueue[args.caller.stage].length;
                    
                    alertDom.addClass('alert fade in');
                    if (style.classes) {
                        alertDom.addClass(style.classes.join(' '));
                    }
            
                    if (close) {
                        alertDom.append($('<button />')
                            .attr({
                                'type' : 'button',
                                'data-dismiss' : 'alert',
                                'href' : '#'
                            })
                            .addClass('close')
                            .html('&times;'))
                    }
                    
                    if (queueLength) {
                        alertDom.append($('<div />').addClass('alert-queue-notifier').html(queueLength + ' more'))
                    }
            
                    alertDom.append($('<div />').html(message));
                    alertContainer.append(alertDom);
                
                    alertDom.on('closed', function() {
                        if (CONFIG.alertQueue[args.caller.stage].length) {
                            createAlertFn({
                                alertDom : alertDom,
                                alertContainer : alertContainer,
                                createAlertFn : createAlertFn,
                                caller : args.caller
                            })
                        }
                    })
                
                    alertDom.alert()
                
                    if (displayTime) {
                        setTimeout(function() {
                            alertDom.alert('close');
                        },displayTime)
                    }
                }
            }
            
            // The container is empty so go ahead and fire the alert
            if (alertContainer.children().length == 0) {
                createAlert({
                    alertDom : alertDom,
                    alertContainer : alertContainer,
                    createAlertFn : createAlert,
                    caller : caller
                })
            }
        },
        switchTab : function(args) {
            var caller = args.caller;
            var stage = caller ? caller.stage : args.stage || '';
            var tab = args.tab;
            if (tab == 'view') {
                $('#action-'+stage+'-tablist a[href="#'+stage+'-view-tab"]').trigger('click');
            } else if (tab == 'manage') {
                $('#action-'+stage+'-tablist a[href="#'+stage+'-manage-tab"]').trigger('click');
            }
        }
    });
}
    
