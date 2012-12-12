// TODO - Add current user session to temp session and use temp session as the work session and persist temp session to permSession at intervals
var tempSession, permSession, geoserver, map, ui, sld;

$(document).ready(function() {
    
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : CONFIG.development ? 'debug' : 'info'
    });
    
        
    ui = new UI();
    map = new Map();
    geoserver = new Geoserver();
    
    // Set up sessions
    tempSession = new Session('coastal-hazards', false);
    permSession = new Session('coastal-hazards', true);
    LOG.info('Sessions created. User session list has ' + Object.keys(permSession.session.sessions).length + ' sessions.')
    LOG.info('Current session key: ' + permSession.getCurrentSessionKey());
	
    $("#upload-shorelines-btn").on("click", Shorelines.addShorelines);
    $("#upload-baseline-btn").on("click", Baseline.addBaseline);
    $("#calculate-transects-btn").on("click", Transects.calcTransects);
    $("#create-intersections-btn").on("click", Intersections.calcIntersections);
    $("#display-results-btn").on("click", function() { /* not yet implemented */});
    
    
    //Initialize the uploader
    var uploader = new qq.FineUploader({
        element: document.getElementById('shoreline-uploader'),
        request: {
            endpoint: 'server/upload'
        },
        validation: {
            allowedExtensions: ['zip']
        },
        multiple : false,
        autoUpload: true,
        text: {
            uploadButton: '<i class="icon-upload icon-white"></i>Upload A File'
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
                                        $('#shorelines-list').children().remove();
                                        $(caps.featureTypeList.featureTypes).each(function(index, item, arr) { 
                                            var title = item.title;
                                            var shortenedTitle = title.has(permSession.getCurrentSessionKey()) ? 
                                            title.remove(permSession.getCurrentSessionKey() + '_') : 
                                            title;
                                            if (title.has(permSession.getCurrentSessionKey()));
                                            if (title.substr(title.lastIndexOf('_') + 1) == 'shorelines') {
                                                $('#shorelines-list')
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
    
    $('#myModal-save-btn').click(function() {
        uploader.uploadStoredFiles();
    });
    
})