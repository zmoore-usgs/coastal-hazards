var UI = function() {
    LOG.info('UI.js::constructor: UI class is initializing.');
    
    var me = (this === window) ? {} : this;
    
    me.work_stages = ['shorelines', 'baseline', 'transects', 'calculation', 'results'];
    me.work_stages_objects = [Shorelines, Baseline, Transects, Calculation, Results];
    me.base_name = undefined;//init to undefined. Update in baselines
    
    $('#manage-sessions-btn').on('click', CONFIG.tempSession.createSessionManagementModalWindow);
	
    $('.collapsibleHelp').accordion({
        collapsible: true,
        heightStyle: 'content'
    });
    
    // Set up on-click functionality for stage buttons
    $('.nav-stacked>li>a').each(function(index, ele) { 
        $(ele).on('click', function() {
            me.switchStage(index);
        });
    });
    
    LOG.debug('UI.js::constructor: UI class initialized.');
    return $.extend(me, {
		appInit : function() {
			this.bindWindowResize();
			this.addIntroContent();
			$(window).resize();
		},
        displayStage : function(caller) {
            $('#stage-select-tablist a[href="#'+caller.stage+'"]').trigger('click');
        },
		bindWindowResize: function() {
			$(window).resize(function() {
				var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height() - $('#alert-row').height() - 40;
				$('#content-row').css('min-height', contentRowHeight);
				$('#nav-list').css('min-height', contentRowHeight);
				$('#toolbox-span').css('min-height', contentRowHeight);
				$('#map-span').css('min-height', contentRowHeight);
				$('#map').css('height', contentRowHeight);
			});
		},
        createModalWindow : function(args) {
            var headerHtml = args.headerHtml || '';
            var bodyHtml = args.bodyHtml || '';
            var buttons = args.buttons || [];
            var includeCancelButton = args.includeCancelButton || true;
            var doneButtonText = args.doneButtonText || 'Done';
            var callbacks = args.callbacks || [];
                
            $('#application-overlay').fadeOut();
            $('#modal-window-label').html(headerHtml);
            $('#modal-body-content').html(bodyHtml);
            $('#modal-window>.modal-footer').html('');

            buttons.each(function(button) {
                var text = button.text;
                var callback = button.callback;
                var modalButton = $('<button />')
                .attr('id', button.id || '')
                .addClass('btn')
                .addClass(button.type)
                .html(text)
                .on('click', callback)
                .on('click', function() {
                    $("#modal-window").modal('hide');
                });
                $('#modal-window>.modal-footer').append(modalButton);
            });
            
            if (includeCancelButton) {
                $('#modal-window>.modal-footer').append(
                    $('<button />')
                    .addClass('btn')
                    .attr({
                        'id' : 'cancel-button',
                        'data-dismiss' : 'modal',
                        'aria-hidden' : 'true'
                    })
                    .html(doneButtonText));
            }
            
            callbacks.each(function(callback) {
                callback();
            });
            
            $('#modal-window').modal('show');
        },
        lockBaseNameTo : function(name){
            me.base_name = name;
            $('#results-form-name').val(name).trigger('change');
            $('#create-transects-input-name').val(name).trigger('change');
        },
        switchStage : function (stage) {
            LOG.info('UI.js::switchImage: Changing application context to ' + me.work_stages[stage]);
            
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
        initializeUploader: function(args) {
            LOG.info('UI.js::initializeUploader: Initializing uploader for the ' + context + ' context');
            var caller = args.caller;
            var context = caller.stage;

            var uploader = new qq.FineUploader({
                element: document.getElementById(context + '-uploader'),
                multiple : false,
                request: {
                    endpoint: 'service/upload',
                    paramsInBody: false,
                    forceMultipart : false,
                    params: {
                        'response.encoding': 'json',
                        'filename.param': 'qqfile',
                        'overwrite.existing.layer': 'true',
                        'workspace': CONFIG.tempSession.getCurrentSessionKey(),
                        'store': 'ch-input',
                        'srs': CONFIG.map.getMap().getProjection(),
                        'use.crs.failover': 'true',
                        'projection.policy': 'reproject',
                        'layer': '' // Use the file name for the name
                    }
                },
                validation: {
                    allowedExtensions: ['zip']
                },
                autoUpload: true,
                caller: caller,
                text: {
                    uploadButton: '<i class="icon-upload icon-white"></i>Upload'
                },
                classes: {
                    success: 'alert alert-success',
                    fail: 'alert alert-error'
                },
                callbacks: {
                    onSubmit: function(id, name) {
                        CONFIG.ui.showSpinner();

                        CONFIG.ui.showAlert({
                            close: false,
                            message: 'Upload beginning',
                            style: {
                                classes: ['alert-info']
                            }
                        });

                        // Test to see if the upload name ends with an underscore and the stage name we are in. If not, add it
                        if (!name.endsWith(caller.stage + '.zip')) {
                            this._options.request.params.layer = name.substring(0, name.length - 4) + '_' + caller.stage;
                        }

                        // Test to see if the first character in the layer is a digit. If so, prepend an underscore. Otherwise we get big 
                        // fails working with the layer later on
                        if (/^[0-9]/.test(this._options.request.params.layer)) {
                            this._options.request.params.layer = '_' + this._options.request.params.layer;
                        }

                    },
                    onCancel: function(id, name) {
                        CONFIG.ui.hideSpinner();
                        $('#application-alert').alert('close');

                    },
                    onError: function(id, name, errorReason, xhr) {
                        CONFIG.ui.hideSpinner();
                        $('#application-alert').alert('close');
                    },
                    onProgress: function(id, name, uploadBytes, totalBytes) {
                        $('#application-alert #message').html('Uploading <b>' + uploadBytes + '<b /> of <b>' + totalBytes + '<b /> total bytes');
                    },
                    onComplete: function(id, fileName, responseJSON) {
                        CONFIG.ui.hideSpinner();
                        $('#application-alert').alert('close');
                        var success = responseJSON.success;
                        var layerName = responseJSON.name;
                        var workspace = responseJSON.workspace;

                        if (success === 'true') {
                            LOG.info("UI.js::initializeUploader: Upload complete");
                            LOG.info('UI.js::initializeUploader: Import complete. Will now call WMS GetCapabilities to refresh session object and ui.');
                            CONFIG.ows.getWMSCapabilities({
                                namespace: CONFIG.tempSession.getCurrentSessionKey(),
                                layerName: layerName,
                                callbacks: {
                                    success: [
                                        function(args) {
                                            CONFIG.ui.showAlert({
                                                message: 'Upload Successful',
                                                caller: caller,
                                                displayTime: 3000,
                                                style: {
                                                    classes: ['alert-success']
                                                }
                                            });
                                            CONFIG.tempSession.updateLayersFromWMS(args);
                                            CONFIG.ui.populateFeaturesList({
                                                caller: caller
                                            });
                                            $('a[href="#' + caller.stage + '-view-tab"]').tab('show');
                                            $('#' + caller.stage + '-list')
                                                    .val(layerName)
                                                    .trigger('change');

                                        }
                                    ],
                                    error: [
                                        function(args) {
                                            LOG.info('UI.js::Uploader Error Callback: Import incomplete.');
                                            CONFIG.ui.showAlert({
                                                message: 'Import incomplete',
                                                caller: caller,
                                                displayTime: 3000,
                                                style: {
                                                    classes: ['alert-error']
                                                }
                                            });
                                        }
                                    ]
                                }
                            });
                        } else {
                            LOG.warn('UI.js::Uploader Error Callback: Import incomplete.');
                            CONFIG.ui.showAlert({
                                message: 'Import incomplete. ' + (responseJSON.exception ? responseJSON.exception : ''),
                                caller: caller,
                                displayTime: 3000,
                                style: {
                                    classes: ['alert-error']
                                }
                            });
                        }
                    }
                }
            });
            $('#' + context + '-triggerbutton').on('click', function() {
                $('#' + context + '-uploader input').fineUploader().trigger('click');
            });
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
			$('#'+stage+'-list')
			.append($("<option />")
				.attr("value",'')
				.text(''));
        
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
                    if (layerNS === CONFIG.name.published || layerNS === currentSessionKey) {
                        var type = title.substr(title.lastIndexOf('_'));
                        if (suffixes.length === 0 || suffixes.find(type.toLowerCase())) {
                            LOG.debug('UI.js::populateFeaturesList: Found a layer to add to the '+stage+' listbox: ' + title);
                            var layerFullName = layer.prefix + ':' + layer.name;
                            var sessionStage = CONFIG.tempSession.getStage(stage);
                            var lIdx = sessionStage.layers.findIndex(function(l) {
                                return l === layerFullName;
                            });
                            if (lIdx === -1) {
                                sessionStage.layers.push(layerFullName);
                            }
                            CONFIG.tempSession.persistSession();
                            var option = $("<option />")
                            .attr({
                                "value" : layerNS + ':' + layer.name
                            })
                            .addClass(layerNS === 'sample' ? publishedLayerClass : sessionLayerClass)
                            .text(layer.name);
                            
                            $('#'+stage+'-list')
                            .append(option);
                        } 
                    }
                });
            });
            
            CONFIG.tempSession.persistSession();
            LOG.debug('UI.js::populateFeaturesList: Re-binding select list');
            $('#'+stage+'-list').unbind('change');
            $('#'+stage+'-list').change(function(index, option) {
                caller.listboxChanged(index, option);
            }) ;
            
            return  $('#'+stage+'-list');
        },
        showShorelineInfo : function(event) {
            LOG.info('UI.js::showShorelineInfo');
            LOG.debug('UI.js::showShorelineInfo: The map was clicked and a response from the OWS resource was received');
            Shorelines.closeShorelineIdWindows();
            if (event.features.length) {
                LOG.debug('UI.js::showShorelineInfo: Features were returned from the OWS resource. Parsing and creating table to display');
                
                LOG.debug('UI.js::showShorelineInfo: Creating table for ' + event.features.length + ' features');
                var groupingColumn = CONFIG.tempSession.getStage(Shorelines.stage).groupingColumn;
                var uniqueFeatures = event.features.unique(function(feature) {
                    return feature.data[groupingColumn];
                }).sortBy(function(feature) {
                    return Date.parse(feature.data[groupingColumn]);
                });
                
                LOG.trace('UI.js::showShorelineInfo: Closing any other open identify windows');
                $('.olPopupCloseBox').each(function(i,v){
                    v.click();
                }); 
                
                var layerTitle = event.features[0].fid.split('.')[0]
                var layerName = event.features[0].gml.featureNSPrefix + ':' + layerTitle;
                var shorelineIdContainer = $('<div />').attr('id', layerName + '-id-container').addClass('shoreline-id-container');
                var shorelineIdTable = $('<table />').attr('id', layerName + '-id-table').addClass('shoreline-id-table table table-striped table-condensed');
                var thead = $('<thead />');
                var theadTr = $('<tr />');
                var tbody = $('<tbody />');
                thead.append($('<caption />').append($('<h3 />').append(layerTitle)));
                
                $(Object.keys(event.features[0].attributes)).each(function(i,v) {
                    theadTr.append($('<th />').append(v));
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
                });
            }
        },
        showAlert : function(args) {
            var caller = args.caller || {
                stage : 'application'
            };
            var message = args.message || '';
            var style = args.style || {
                classes : []
            };
            var alertContainer = $('#' + caller.stage + '-alert-container');
            var alertDom = $('<div />').attr('id', caller.stage + '-alert');
            var close = args.close || true;
            var displayTime = args.displayTime || 0;
            
            CONFIG.alertQueue[caller.stage].unshift({
                message : message,
                style : style,
                displayTime : displayTime,
                close : close
            });
            
            var createAlert = function(args) {
                var nextMessageObj = CONFIG.alertQueue[args.caller.stage].pop();
                if (nextMessageObj.hasOwnProperty('message')) {
                    var alertContainer = args.alertContainer;
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
                            .html('&times;'));
                    }
                    
                    if (queueLength) {
                        alertDom.append($('<div />').addClass('alert-queue-notifier').html(queueLength + ' more'));
                    }
            
                    alertDom.append($('<div id="message"/>').html(message));
                    alertContainer.append(alertDom);
                
                    alertDom.on('closed', function() {
                        if (CONFIG.alertQueue[args.caller.stage].length) {
                            createAlertFn({
                                alertDom : alertDom,
                                alertContainer : alertContainer,
                                createAlertFn : createAlertFn,
                                caller : args.caller
                            });
                        }
                    });
                
                    alertDom.alert();
                
                    if (displayTime) {
                        setTimeout(function() {
                            alertDom.alert('close');
                        },displayTime);
                    }
                }
            };
            
            // The container is empty so go ahead and fire the alert
            if (alertContainer.children().length === 0) {
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
            if (tab === 'view') {
                $('#action-'+stage+'-tablist a[href="#'+stage+'-view-tab"]').trigger('click');
            } else if (tab === 'manage') {
                $('#action-'+stage+'-tablist a[href="#'+stage+'-manage-tab"]').trigger('click');
            }
        },
        buildColumnMatchingModalWindow : function(args) {
            var layerName = args.layerName;
            var columns = args.columns;
            var caller = args.caller;
            
            LOG.debug('UI.js::buildColumnMatchingModalWindow: Could not automatically map all layer attributes. Need help');
            var container = $('<div />').addClass('container-fluid');
                            
            var explanationRow = $('<div />').addClass('row-fluid').attr('id', 'explanation-row');
            var explanationWell = $('<div />').addClass('well').attr('id', 'explanation-well');
            explanationWell.html('There is a attribute mismatch between the resource you are trying to view and what is considered a valid '+caller.stage+' resource. <br /><br />We require '+caller.mandatoryColumns.toString()+'. Please drag attributes from the left to the right to properly map to the correct attributes. The resource will be updated server-side once complete.');
            container.append(explanationRow.append(explanationWell));
                            
            var containerRow = $('<div />').addClass('row-fluid').attr('id', layerName + '-drag-drop-row');
                        
            // Create the draggable column
            var dragListContainer = $('<div />').
            attr('id', layerName + '-drag-container').
            addClass('well span5');
            var dragList = $('<ul />').
            attr('id', layerName + '-drag-list').
            addClass('ui-helper-reset');
            columns.keys().each(function(name) {
                                
                var li = $('<li />');
                var dragHolder = $('<div />').
                addClass(layerName + '-drop-holder left-drop-holder');
                var dragItem = $('<div />').
                addClass(layerName + '-drag-item ui-state-default ui-corner-all').
                attr('id', name + '-drag-item').
                html(name);
                var iconSpan = $('<span />').
                attr('style', 'float:left;').
                addClass('ui-icon ui-icon-link').
                html('&nbsp;');
                            
                dragItem.append(iconSpan);
                dragHolder.append(dragItem);
                li.append(dragHolder);
                dragList.append(li);
            });
            dragListContainer.append(dragList);
            containerRow.append(dragListContainer);
            container.append(containerRow);
                            
            // Create the droppable column
            var dropListContainer = $('<div />').
            attr('id', layerName + '-drop-container').
            addClass('well span5 offset2');
            var dropList = $('<ul />').
            attr('id', layerName + '-drop-list').
            addClass('ui-helper-reset');
            caller.mandatoryColumns.each(function(name) {
                var listItem = $('<li />').
                append(
                    $('<div />').
                    addClass(layerName + '-drop-holder right-drop-holder').
                    attr('id', name + '-drop-item').
                    html(name));
                            
                dropList.append(listItem);
            });
            dropListContainer.append(dropList);
            containerRow.append(dropListContainer);
                            
            container.append(containerRow);
                            
            CONFIG.ui.createModalWindow({
                headerHtml : 'Layer Attribute Mismatch Detected',
                bodyHtml : container.html(),
                doneButtonText : 'Cancel',
                buttons : [{
                    id : 'modal-update-button',
                    text : 'Update',
                    type : 'btn-success',
                    callback : function(event, context) {
                        var mapping = $('#' + layerName + '-drag-drop-row').data('mapping');
                        
                        var columns = [];
                        mapping.keys().each(function(key) {
                            if (key && mapping[key] && key !== mapping[key]) {
                                columns.push(key + '|' + mapping[key]);
                            }
                        });
                        CONFIG.ows.renameColumns({
                            layer : layerName,
                            workspace : CONFIG.tempSession.getCurrentSessionKey(),
                            store : 'ch-input',
                            columns : columns.filter(function(c) {
                                return !c.endsWith('|');
                            }),
                            callbacks : [
                            function() {
                                $("#"+caller.stage+"-list").val(CONFIG.tempSession.getCurrentSessionKey() + ':' + layerName);
                                $("#"+caller.stage+"-list").trigger('change');    
                            }
                            ]
                        });
                    }
                }],
                callbacks : [
                function() {
                    $('#modal-update-button').attr('disabled', 'disabled');
                    
                    // When cancel button is clicked, remove the layer on the server as well
                    $('#cancel-button').click(function() {
                        CONFIG.ows.clearFeaturesOnServer({
                            layer: CONFIG.tempSession.getCurrentSessionKey() + ':' + layerName,
                            callbacks: [
                                function() {
                                    caller.removeResource();
                                }
                            ]
                        });
                    });
                    
                    $('#' + layerName + '-drag-drop-row').data('mapping', columns);
                    $('.' + layerName + '-drag-item').draggable({
                        containment: '#' + layerName + '-drag-drop-row', 
                        scroll: false,
                        snap :  '.'+layerName+'-drop-holder',
                        snapMode : 'inner',
                        cursor: 'move',
                        revert : 'invalid',
                        stack : '.'+layerName+'-drag-item'
                    });
                    $('.'+layerName+'-drop-holder').droppable({
                        greedy: true,
                        activeClass: 'ui-state-highlight',
                        hoverClass: 'drop-hover',
                        tolerance : 'fit',
                        drop: function(event,ui) {
                            var draggable = ui.draggable;
                            var dragId = draggable.attr('id');
                            var dropId = this.id;
                            var layerAttribute = dragId.substr(0, dragId.indexOf('-drag-item'));
                            var layerMappingAttribute = dropId.substr(0, dropId.indexOf('-drop-item'));
                            var mapping = $('#' + layerName + '-drag-drop-row').data('mapping');
                                            
                            // Figure out if we are in a drag or drop well
                            if ($(this).closest('.well').attr('id').contains('drop-container')) {
                                mapping[layerAttribute] = layerMappingAttribute;
                            } else { // left column, remove from map
                                mapping[layerAttribute] = '';
                            }
                                            
                            var readyToUpdate = true;
                            Shorelines.mandatoryColumns.each(function(mc) { 
                                if (!mapping.values().filter(mc).length) {
                                    readyToUpdate = false;
                                }
                            });
                            if (readyToUpdate) {
                                $('#modal-update-button').removeAttr('disabled');
                            } else {
                                $('#modal-update-button').attr('disabled', 'disabled');
                            }
                                            
                        }
                    });
                                    
                    var moveDraggable = function(draggable, droppable) {
                        var dragTop = draggable.position().top;
                        var dragLeft = draggable.position().left;
                        var dropTop = droppable.position().top;
                        var dropLeft = droppable.position().left;
                        var horizontalMove = dropLeft - dragLeft;
                        var verticalMove = dropTop < dragTop ? dropTop - dragTop + 5 : dropTop + dragTop + 5; // 5 = margin-top
                        draggable.animate({
                            left: horizontalMove
                        },{
                            queue : 'fx',
                            duration : 1000
                        }).animate({
                            top: verticalMove
                        },
                        {
                            queue : 'fx',
                            duration : 1000,
                            complete : function() {
                                this.style.zIndex = 9999;
                            }
                        });
                    };
                    var showCallback = function() {
                        $("#modal-window").unbind('shown', showCallback);
                        // Move stuff over if the layers are already mapped
                        columns.keys().each(function(key) {
                            if (columns[key]) {
                                var draggable = $('#' + key + '-drag-item').draggable('widget');
                                var droppable = $('#' + columns[key] + '-drop-item').droppable('widget');
                                draggable.queue("fx");
                                moveDraggable(draggable,droppable);
                            }
                        });
                        if (columns.values().filter(function(v) {
                            return v !== '';
                        }).length === Shorelines.mandatoryColumns.length) {
                            $('#modal-update-button').removeAttr('disabled');
                        }
                    };
                    $("#modal-window").on('shown', showCallback);
                                    
                    $("#modal-window").on('hidden', function() {
                        $('#' + layerName + '-drag-drop-row').data('mapping', undefined);
                    });
                                    
                }]
            });
        },
        showSpinner: function() {
            $("#application-spinner").fadeIn();
        },
        hideSpinner: function() {
            $("#application-spinner").fadeOut();
        },
        buildGeocodingPopup: function(args) {
            var map = CONFIG.map.getMap();
            var currentLocationIndex = args.currentLocationIndex || 0;
            var locations = args.locations || $('#location-container').data('locations');
            var currentLocation = locations[currentLocationIndex];
            var xmax = currentLocation.extent.xmax;
            var xmin = currentLocation.extent.xmin;
            var ymax = currentLocation.extent.ymax;
            var ymin = currentLocation.extent.ymin;
            var x = currentLocation.feature.geometry.x;
            var y = currentLocation.feature.geometry.y;
            var locAttr = currentLocation.feature.attributes;
            var select = $('<select />').attr('id', 'alt-location-list');

            // Build Market
            var markerLayer = CONFIG.map.getMarkerLayer();
            var iconSize = new OpenLayers.Size(32, 32);
            var icon = new OpenLayers.Icon('js/openlayers/img/BulbGrey.png', iconSize, new OpenLayers.Pixel(-(iconSize.w / 2), -iconSize.h));
            var marker = new OpenLayers.Marker(new OpenLayers.LonLat(x, y), icon);

            // Build HTML
            var container = $('<div />').addClass('container-fluid').attr('id', 'location-container');
            var table = $('<table />').addClass('table table-hover table-condensed');
            table.append(
                    $('<thead>').append(
                    $('<tr />').attr('colspan', '2').append(
                    $('<th />').attr('id', 'location-popup-title').html(locAttr.Match_addr))));
            var tbody = $('<tbody />');
            if (locAttr.Type) {
                tbody.append('<tr><td>Address Type</td><td>' + locAttr.Addr_type + ' : ' + locAttr.Type + '</td></tr>');
            }
            if (locAttr.Country) {
                tbody.append('<tr><td>Country</td><td>' + locAttr.Country + '</td></tr>');
            }
            if (locAttr.Loc_name) {
                tbody.append('<tr><td>Source</td><td>' + locAttr.Loc_name + '</td></tr>');
            }
            table.append(tbody);
            container.append($('<div />').addClass('row-fluid span12').append(table));

            select.append($('<option />').attr('value', '-1').html(''));

            for (var lInd = 0; lInd < locations.length; lInd++) {
                if (lInd !== currentLocationIndex) {
                    var loc = locations[lInd];
                    var addr = loc.feature.attributes.Match_addr;
                    var country = loc.feature.attributes.Country;
                    var type = loc.feature.attributes.Type;
                    var type2 = loc.feature.attributes.Addr_type;
                    var typeDesc = ' (Type: ' + type + ', ' + type2 + ')';
                    select.append($('<option />').attr('value', lInd).html(addr + ', ' + country + typeDesc));
                }
            }
            
            if (locations.length > 1) {
                container.append($('<div />').addClass('row-fluid span12').html("Did you mean... ")).append($('<div />').addClass('fluid-row span12').append(select));
            }
            
            markerLayer.addMarker(marker);

            map.zoomToExtent([xmin, ymin, xmax, ymax], true);

            var popup = new OpenLayers.Popup.FramedCloud("geocoding-popup",
                    new OpenLayers.LonLat(x, y),
                    new OpenLayers.Size(200, 200),
                    $('<div />').append(container).html(),
                    icon,
                    true,
                    function() {
                        markerLayer.removeMarker(marker);
                        map.removePopup(this);
                    });

            if (map.popups.length) {
                map.popups[0].closeDiv.click();
            }

            map.addPopup(popup);

            $('#alt-location-list').change(function(event) {
                var index = parseInt(event.target.value);
                if (index !==  -1) {
                    CONFIG.ui.buildGeocodingPopup({
                        currentLocationIndex : index,
                        locations : locations
                    });
                }
            });
            // map.zoomToScale(300000, true);

        },
        bindSearchInput: function() {
            $('#app-navbar-search-form').submit(function(evt) {
                var query = $('#app-navbar-search-input').val();
                if (query) {
                    $.ajax({
                        type: 'GET',
                        url: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find',
                        data: {
                            text: query,
                            maxLocations: '20',
                            outFields: '*',
                            f: 'pjson',
                            outSR: '3785'
                        },
                        async: false,
                        contentType: 'application/json',
                        dataType: 'jsonp',
                        success: function(json) {
                            if (json.locations[0]) {
                                
                                CONFIG.ui.buildGeocodingPopup({
                                    locations: json.locations
                                });

                            } else {
                                CONFIG.ui.showAlert({
                                    close: false,
                                    message: query + ' not found',
                                    displayTime: 1000,
                                    style: {
                                        classes: ['alert-info']
                                    }
                                });
                            }
                        }
                    });
                }

            });
        },
		bindBootstroPrevNextButtons: function() {
			bootstro.onStepFunc = function() {
				var step = $('.popover .label').html() ? parseInt($('.popover .label').html().split('/')[0]) : 0;

				switch (step) {
					case 4 :
						$('#stage-select-tablist >li a[href=#shorelines]').click();
						$('#action-shorelines-tablist > li a[href=#shorelines-view-tab]').click();
						break;
					case 5 :
						$('#stage-select-tablist >li a[href=#shorelines]').click();
						$('#action-shorelines-tablist > li a[href=#shorelines-view-tab]').click();
						break
					case 6 :
						$('#stage-select-tablist >li a[href=#shorelines]').click();
						$('#action-shorelines-tablist > li a[href=#shorelines-manage-tab]').click();
						break
					case 7 :
						$('#stage-select-tablist >li a[href=#shorelines]').click();
						$('#action-shorelines-tablist > li a[href=#shorelines-view-tab]').click();
						$('#shorelines-list').click();
						break
					case 8 :
						$('#stage-select-tablist >li a[href=#baseline]').click();
						$('#action-baseline-tablist > li a[href=#baseline-view-tab]').click();
						break
					case 9 :
						$('#stage-select-tablist >li a[href=#baseline]').click();
						$('#action-baseline-tablist > li a[href=#baseline-view-tab]').click();
						break
					case 10 :
						$('#stage-select-tablist >li a[href=#baseline]').click();
						$('#action-baseline-tablist > li a[href=#baseline-manage-tab]').click();
						break
					case 11 :
						$('#stage-select-tablist >li a[href=#transects]').click();
						$('#action-transects-tablist > li a[href=#transects-view-tab]').click();
						break
					case 12 :
						$('#stage-select-tablist >li a[href=#transects]').click();
						$('#action-transects-tablist > li a[href=#transects-view-tab]').click();
						break
					case 13 :
						$('#stage-select-tablist >li a[href=#transects]').click();
						$('#action-transects-tablist > li a[href=#transects-manage-tab]').click();
						break
					case 14 :
						$('#stage-select-tablist >li a[href=#calculation]').click();
						$('#action-calculation-tablist > li a[href=#calculation-view-tab]').click();
						break
					case 15 :
						$('#stage-select-tablist >li a[href=#calculation]').click();
						$('#action-calculation-tablist > li a[href=#calculation-view-tab]').click();
						break
					case 16 :
						$('#stage-select-tablist >li a[href=#calculation]').click();
						$('#action-calculation-tablist > li a[href=#calculation-manage-tab]').click();
						break
					case 17 :
						$('#stage-select-tablist >li a[href=#results]').click();
						$('#action-results-tablist > li a[href=#results-view-tab]').click();
						break
					case 18 :
						$('#stage-select-tablist >li a[href=#results]').click();
						$('#action-results-tablist > li a[href=#results-view-tab]').click();
						break
					case 19 :
						$('#stage-select-tablist >li a[href=#results]').click();
						$('#action-results-tablist > li a[href=#results-manage-tab]').click();
						break
				}
			};
		},
		bindIntroMenuItems : function() {
			$('#nav-menu-intro').on('click', function() {
				bootstro.start(undefined, {
					finishButton: '<button class="btn btn-mini btn-success bootstro-finish-btn"><i class="icon-ok" ></i> Finish</button>'
				});
			});
			$('#nav-menu-shorelines').on('click', function() {
				bootstro.start(undefined, {
					finishButton: '<button class="btn btn-mini btn-success bootstro-finish-btn"><i class="icon-ok" ></i> Finish</button>'
				});
				$('#stage-select-tablist >li a[href=#shorelines]').click();
				$('#action-shorelines-tablist > li a[href=#shorelines-view-tab]').click();
				bootstro.go_to(4);
			});
			$('#nav-menu-baseline').on('click', function() {
				bootstro.start(undefined, {
					finishButton: '<button class="btn btn-mini btn-success bootstro-finish-btn"><i class="icon-ok" ></i> Finish</button>'
				});
				$('#stage-select-tablist >li a[href=#baseline]').click();
				$('#action-baseline-tablist > li a[href=#baseline-view-tab]').click();
				bootstro.go_to(8);
			});
			$('#nav-menu-transects').on('click', function() {
				bootstro.start(undefined, {
					finishButton: '<button class="btn btn-mini btn-success bootstro-finish-btn"><i class="icon-ok" ></i> Finish</button>'
				});
				$('#stage-select-tablist >li a[href=#transects]').click();
				$('#action-transects-tablist > li a[href=#transects-view-tab]').click();
				bootstro.go_to(11);
			});
			$('#nav-menu-calculation').on('click', function() {
				bootstro.start(undefined, {
					finishButton: '<button class="btn btn-mini btn-success bootstro-finish-btn"><i class="icon-ok" ></i> Finish</button>'
				});
				$('#stage-select-tablist >li a[href=#calculation]').click();
				$('#action-calculation-tablist > li a[href=#calculation-view-tab]').click();
				bootstro.go_to(14);
			});
			$('#nav-menu-results').on('click', function() {
				bootstro.start(undefined, {
					finishButton: '<button class="btn btn-mini btn-success bootstro-finish-btn"><i class="icon-ok" ></i> Finish</button>'
				});
				$('#stage-select-tablist >li a[href=#results]').click();
				$('#action-results-tablist > li a[href=#results-view-tab]').click();
				bootstro.go_to(17);
			});
		},
		addIntroContent: function() {
			this.bindBootstroPrevNextButtons();
			this.bindIntroMenuItems();

			$('#app-navbar-container').addClass('bootstro').attr({
				'data-bootstro-title': 'Welcome to USGS Coastal Change Hazards',
				'data-bootstro-content': 'This web-based Digital Shoreline Analysis System (DSASweb) is a software application that enables a user to calculate shoreline rate-of-change statistics from multiple historical shoreline positions.' +
						'<br /><br />A user-friendly interface of simple buttons and menus guides the user through the major steps of shoreline change analysis.' +
						'<br /><br />You can use our current database of shorelines, or upload your own.' +
						'<br /><br />DSASweb is a convenient, web-based version of the original USGS DSAS analysis tool.',
				'data-bootstro-placement': 'bottom',
				'data-bootstro-html': true,
				'data-bootstro-step': 0
			});

			$('#stage-select-tablist').addClass('bootstro').attr({
				'data-bootstro-title': 'Stage Selection',
				'data-bootstro-content': 'Each stage in the DSASweb workflow can be accessed by clicking one of these navigation buttons.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 1
			});

			$('#toolbox-well').addClass('bootstro').attr({
				'data-bootstro-title': 'Toolbox',
				'data-bootstro-content': 'The workspace for the active stage is designed to allow users to edit, define parameters, and interact with various DSASweb selection options.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 2
			});

			$('#map-span').addClass('bootstro').attr({
				'data-bootstro-title': 'Map',
				'data-bootstro-content': 'The map view provides an interactive view of active DSASweb geospatial elements.<br />These elements include shorelines, baselines, transects, intersections, and results.<br /><br />' +
						'Use the +/- buttons  in the upper left to change the zoom level of the map, or double click to zoom in.<br />To quickly zoom in, draw a bounding box with the mouse by holding down the shift key on your keyboard.',
				'data-bootstro-placement': 'left',
				'data-bootstro-html': true,
				'data-bootstro-step': 3
			});

			$('#stage-select-tablist >li a[href=#shorelines]').addClass('bootstro').attr({
				'data-bootstro-title': 'Shorelines',
				'data-bootstro-content': 'Shorelines are geospatial polylines which represent the location of the shoreline at different times.<br />DSASweb uses the difference between these shorelines to calculate metrics of shoreline change.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 4
			});

			$('#action-shorelines-tablist > li a[href=#shorelines-view-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Shorelines View',
				'data-bootstro-content': 'A existing set of shorelines selected from the view menu will be added to the active workspace.' +
						'Use the visibility toggles, or click on shorelines in the map to disable shorelines.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 5
			});

			$('#action-shorelines-tablist > li a[href=#shorelines-manage-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Shorelines Manage',
				'data-bootstro-content': 'A set of shorelines can be added or removed from the view menu using the manage menu.',
				'data-bootstro-placement': 'top',
				'data-bootstro-html': true,
				'data-bootstro-step': 6
			});

			$('#shorelines-list').addClass('bootstro').attr({
				'data-bootstro-title': 'Individual Shorelines',
				'data-bootstro-content': 'Individual shorelines can be disabled, which will result in those shorelines being ignored during DSASweb calculations. ',
				'data-bootstro-placement': 'top',
				'data-bootstro-html': true,
				'data-bootstro-step': 7
			});

			$('#stage-select-tablist >li a[href=#baseline]').addClass('bootstro').attr({
				'data-bootstro-title': 'Baseline',
				'data-bootstro-content': 'The baseline provides a local frame of reference for calculating metrics of shoreline change.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 8
			});

			$('#action-baseline-tablist > li a[href=#baseline-view-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Baseline View',
				'data-bootstro-content': 'A baseline selected from the view menu will be added to the active workspace.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 9
			});

			$('#action-baseline-tablist > li a[href=#baseline-manage-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Baseline Manage',
				'data-bootstro-content': '<p>A baseline can be added or removed from the view menu using the manage menu. <br />The manage tab also provides tools to draw new baselines or clone and edit existing baselines.</p><img src="images/workflow_figures/BaselineDraw.gif" />',
				'data-bootstro-placement': 'bottom',
				'data-bootstro-html': true,
				'data-bootstro-step': 10
			});

			$('#stage-select-tablist >li a[href=#transects]').addClass('bootstro').attr({
				'data-bootstro-title': 'Transects',
				'data-bootstro-content': 'Transects are cast perpendicular to the workspace baseline, and their intersections with shorelines are used to calculate metrics of shoreline change.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 11
			});

			$('#action-transects-tablist > li a[href=#transects-view-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Transects View',
				'data-bootstro-content': 'An existing set of transects selected from the view menu will be added to the active workspace.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 12
			});

			$('#action-transects-tablist > li a[href=#transects-manage-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Transects Manage',
				'data-bootstro-content': 'A set of transects can be added or removed from the view menu using the manage menu. The manage tab also provides tools to cast new transects at user defined intervals or to edit existing transects. </p><img src="images/workflow_figures/EditTransects.gif" />',
				'data-bootstro-placement': 'bottom',
				'data-bootstro-html': true,
				'data-bootstro-step': 13
			});

			$('#stage-select-tablist >li a[href=#calculation]').addClass('bootstro').attr({
				'data-bootstro-title': 'Review/Calculation',
				'data-bootstro-content': ' Review the workspace elements and specify parameters for the calculations. Calculate metrics of shoreline change.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 14
			});

			$('#action-intersections-tablist > li a[href=#intersections-view-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Review/Calculation View',
				'data-bootstro-content': ' An existing set of intersections can be selected from the view menu will be added to the active workspace.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 15
			});

			$('#action-intersections-tablist > li a[href=#intersections-manage-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Review/Calculation  Manage',
				'data-bootstro-content': 'Specify parameters for calculations, and begin DSASweb calculation algorithms. ',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 16
			});

			$('#stage-select-tablist >li a[href=#results]').addClass('bootstro').attr({
				'data-bootstro-title': 'Results',
				'data-bootstro-content': 'Visualize and/or download metrics of shoreline change resulting from processing of DSASweb workspace elements as defined by the user.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 17
			});

			$('#action-result-tablist > li a[href=#results-view-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Results View',
				'data-bootstro-content': 'An existing set of rates can be selected from the view menu will be added to the active workspace.<br />View the interactive plot for metrics of shoreline change.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 18
			});

			$('#action-result-tablist > li a[href=#results-manage-tab]').addClass('bootstro').attr({
				'data-bootstro-title': 'Results Manage',
				'data-bootstro-content': 'Download images, csv files, or shapefiles for the DSASweb calculation results.',
				'data-bootstro-placement': 'right',
				'data-bootstro-html': true,
				'data-bootstro-step': 19
			});
		}
    });
};