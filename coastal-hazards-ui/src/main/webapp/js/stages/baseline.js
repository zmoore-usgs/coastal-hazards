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
        //        baselineLayer.events.register("featuresadded", null, function() {
        //            this.map.zoomToExtent(this.getDataExtent());
        //        });
	
        map.getMap().addLayer(baselineLayer);
    },
    populateFeaturesList : function(caps) {
        ui.populateFeaturesList(caps, 'baseline');
    }
//    ,
//    initializeUploader : function() {
//        var uploader = new qq.FineUploader({
//            element: document.getElementById('baseline-uploader'),
//            request: {
//                endpoint: 'server/upload'
//            },
//            validation: {
//                allowedExtensions: ['zip']
//            },
//            multiple : false,
//            autoUpload: true,
//            text: {
//                uploadButton: '<i class="icon-upload icon-white"></i>Upload Baseline'
//            },
//            template: '<div class="qq-uploader span4">' +
//            '<pre class="qq-upload-drop-area span4"><span>{dragZoneText}</span></pre>' +
//            '<div class="qq-upload-button btn btn-success" style="width: auto;">{uploadButtonText}</div>' +
//            '<ul class="qq-upload-list hidden" style="margin-top: 10px; text-align: center;"></ul>' +
//            '</div>',
//            classes: {
//                success: 'alert alert-success',
//                fail: 'alert alert-error'
//            },
//            debug: true,
//            callbacks: {
//                onComplete: function(id, fileName, responseJSON) {
//                    if (responseJSON.success) {
//                        if (responseJSON.success != 'true') {
//                            LOG.info('File failed to complete upload')
//                        } else {
//                            LOG.info("file-token :" + responseJSON['file-token']);
//                        
//                            tempSession.addFileToSession({
//                                token : responseJSON['file-token'], 
//                                name : responseJSON['file-name']
//                            });
//                            
//                            var importName = tempSession.getCurrentSessionKey() + '_' + responseJSON['file-name'].split('.')[0] + '_baseline';
//                            
//                            geoserver.importFile({
//                                token : responseJSON['file-token'],
//                                importName : importName, 
//                                workspace : 'ch-input',
//                                callbacks : [function(data) {
//                                    if (data.success === 'true') {
//                                        LOG.info('File imported successfully - reloading current file set from server');
//                                        geoserver.getWMSCapabilities({
//                                            callbacks : [
//                                            function (data) {
//                                                ui.populateFeaturesList(data, "baseline");
//                                                tempSession.addFileToSession(data);
//                                            // TODO - add the layer just imported 
//                                            }
//                                            ]
//                                        })
//                                    } else {
//                                        // TODO - Notify the user
//                                        LOG.warn(data.error);
//                                    }
//                                }]
//                            });
//                        }
//                    }
//                }
//            }
//        })
//    }

}