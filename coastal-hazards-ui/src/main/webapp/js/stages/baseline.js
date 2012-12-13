var Baseline = {
    
    addBaseline : function() {
        var layer = [];
        layer[3] = new OpenLayers.Layer.Vector("WFS3", {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.WFS({
                url:  "geoserver/sample/wfs",
                featureType: "baseline",
                featureNS: CONFIG.namespace.sample,
                geometryName: "the_geom"
            }),
            styleMap: new OpenLayers.StyleMap(sld.namedLayers["Simple Line"]["userStyles"][0])
        });
        layer[3].events.register("featuresadded", null, function() {
            this.map.zoomToExtent(this.getDataExtent());
        });
	
        map.getMap().addLayer(layer[3]);
    },
    populateFeaturesList : function(caps) {
        $('#baseline-list').children().remove();
        
        for (var index = 0;index <  caps.featureTypeList.featureTypes.length;index++) { 
            var featureType = caps.featureTypeList.featureTypes[index];
            
            if (featureType.featureNS === CONFIG.namespace.sample || featureType.featureNS === CONFIG.namespace.input) {
                var title = featureType.title;
                var shortenedTitle = title.has(permSession.getCurrentSessionKey()) 
                ?  title.remove(permSession.getCurrentSessionKey() + '_') 
                : title;
                
                if (featureType.featureNS === CONFIG.namespace.input && !title.has(permSession.getCurrentSessionKey())) {
                    continue;
                }
                
                if (title.substr(title.lastIndexOf('_') + 1) == 'baseline') {
                    $('#baseline-list')
                    .append($("<option></option>")
                        .attr("value",title)
                        .text(shortenedTitle));
                } 
            }
        }
    },
    initializeUploader : function() {
        var uploader = new qq.FineUploader({
            element: document.getElementById('baseline-uploader'),
            request: {
                endpoint: 'server/upload'
            },
            validation: {
                allowedExtensions: ['zip']
            },
            multiple : false,
            autoUpload: true,
            text: {
                uploadButton: '<i class="icon-upload icon-white"></i>Upload Baseline'
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
                            LOG.info('FAIL!!!')
                        } else {
                            LOG.info("file-token :" + responseJSON['file-token']);
                        
                            permSession.addFileToSession({
                                token : responseJSON['file-token'], 
                                name : responseJSON['file-name']
                            });
                            permSession.save();
                            var geoserver = new Geoserver();
                            var importName = permSession.getCurrentSessionKey() + '_' + responseJSON['file-name'].split('.')[0] + '_shorelines';
                            var importArgs = {
                                token : responseJSON['file-token'],
                                importName : importName, 
                                workspace : 'ch-input',
                                callbacks : [function(data) {
                                    new Geoserver().getCapabilities({
                                        callbacks : [
                                        function(caps) {
                                            $('#baseline-list').children().remove();
                                            $(caps.featureTypeList.featureTypes).each(function(index, item, arr) { 
                                                var title = item.title;
                                                var shortenedTitle = title.has(permSession.getCurrentSessionKey()) ? 
                                                title.remove(permSession.getCurrentSessionKey() + '_') : 
                                                title;
                                                if (title.has(permSession.getCurrentSessionKey()));
                                                if (title.substr(title.lastIndexOf('_') + 1) == 'baseline') {
                                                    $('#baseline-list')
                                                    .append($("<option></option>")
                                                        .attr("value",title)
                                                        .text(shortenedTitle));
                                                } 
                                            });
                                        }
                                        ]
                                    })
                                //                                
                                }]
                            }
                            geoserver.importFile(importArgs);
                        }
                    }
                }
            }
        })
    }

}