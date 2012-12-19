
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
        shorelinesListboxChanged : function() {
            
            $("#shorelines-list option:not(:selected)").each(function (index, option) {
                var layers = map.getMap().getLayersBy('name', option.text);
                if (layers.length) {
                    $(layers).each(function(i,l) {
                        map.getMap().removeLayer(l);
                    })
                }
            });
            
            var layerInfos = []
            $("#shorelines-list option:selected").each(function (index, option) {
                var layer = geoserver.getLayerByName(option.text);
                
                layerInfos.push(layer)
            });
            
            if (layerInfos.length) {
                Shorelines.addShorelines(layerInfos);
            }
            
        },
        baselineListboxChanged : function() {
            $("#baseline-list option:not(:selected)").each(function (index, option) {
                var layers = map.getMap().getLayersBy('name', option.value);
                if (layers.length) {
                    $(layers).each(function(i,l) {
                        map.getMap().removeLayer(l);
                    })
                }
            });
            if ($("#baseline-list option:selected")[0].value) {
                Baseline.addBaseline({
                    name : $("#baseline-list option:selected")[0].value 
                })
            }
        },
        transectListboxChanged : function() {
            LOG.debug('Transect listbox changed');
            $("#transects-list option:not(:selected)").each(function (index, option) {
                var layers = map.getMap().getLayersBy('name', option.value);
                if (layers.length) {
                    $(layers).each(function(i,l) {
                        map.getMap().removeLayer(l);
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
            $('#'+context+'-list').children().remove();
        
            if (context == 'baseline') {
                $('#'+context+'-list')
                .append($("<option></option>")
                    .attr("value",'')
                    .text(''));
            }
        
            $(caps.capability.layers).each(function(i, layer) { 
                var currentSessionKey = tempSession.getCurrentSessionKey();
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
                $('#'+context+'-list').change(function(index, option) {
                    ui.shorelinesListboxChanged()
                }) 
            } else if (context == 'baseline') {
                $('#'+context+'-list').change(function(index, option) {
                    ui.baselineListboxChanged()
                }) 
            }
        },
        initializeUploader : function(context) {
            var uploader = new qq.FineUploader({
                element: document.getElementById(context + '-uploader'),
                request: {
                    endpoint: 'server/upload'
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
                debug: true,
                callbacks: {
                    onComplete: function(id, fileName, responseJSON) {
                        if (responseJSON.success) {
                            if (responseJSON.success != 'true') {
                                LOG.info('File failed to complete upload')
                            } else {
                                LOG.info("file-token :" + responseJSON['file-token']);
                        
                                tempSession.addFileToSession({
                                    token : responseJSON['file-token'], 
                                    name : responseJSON['file-name']
                                });
                            
                                var importName = tempSession.getCurrentSessionKey() + '_' + responseJSON['file-name'].split('.')[0] + '_' + context;
                            
                                geoserver.importFile({
                                    token : responseJSON['file-token'],
                                    importName : importName, 
                                    workspace : 'ch-input',
                                    callbacks : [function(data) {
                                        if (data.success === 'true') {
                                            LOG.info('File imported successfully - reloading current file set from server');
                                            geoserver.getWMSCapabilities({
                                                callbacks : [
                                                function (data) {
                                                    ui.populateFeaturesList(data, context);
                                                    tempSession.addFileToSession(data);
                                                // TODO - add the layer just imported 
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
                }
            })
        }
    });
}




