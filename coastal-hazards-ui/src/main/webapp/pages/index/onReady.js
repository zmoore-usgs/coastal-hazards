var tempSession, permSession;
$(document).ready(function() {
    
    // Set up sessions
    permSession = new Session('coastal-hazards', true);
    permSession.session.sessions = permSession.session.sessions ? permSession.session.sessions : new Object();
    
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : 'info'
    });
    
    map = new OpenLayers.Map( 'map', {
        projection : "EPSG:900913"
    });
    
    var layer = {};
    layer["phys"] = new OpenLayers.Layer.Google(
        "Google Physical",
        {
            type: google.maps.MapTypeId.TERRAIN, 
            isBaseLayer: true
        });
    layer["sat"] = new OpenLayers.Layer.Google(
        "Google Satellite",
        {
            type: google.maps.MapTypeId.SATELLITE, 
            numZoomLevels: 20
        });
    layer["ghyb"] = new OpenLayers.Layer.Google(
        "Google Hybrid",
        {
            type: google.maps.MapTypeId.HYBRID, 
            numZoomLevels: 20
        });
    layer["gstreets"] = new OpenLayers.Layer.Google(
        "Google Streets", // the default
        {
            numZoomLevels: 20
        });
	
    map.addLayer(layer["sat"]);
	
    map.zoomToMaxExtent();
	
    map.addControl(new OpenLayers.Control.MousePosition());
	
    OpenLayers.Request.GET({
        url: "pages/index/sld-shorelines.xml",
        success: complete
    });
	
    $("#upload-shorelines-btn").on("click", addShorelines);
    $("#upload-baseline-btn").on("click", addBaseline);
    $("#calculate-transects-btn").on("click", calcTransects);
    $("#create-intersections-btn").on("click", makeDots);
    $("#display-results-btn").on("click", displayResults);
    
    $('.nav-stacked>li>a').each(function(indexInArray, valueOfElement) { 
        $(valueOfElement).on('click', function() {
            switchImage(indexInArray);
        })
    })
    
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
                        console.warn('FAIL!!!')
                    } else {
                        console.log("file-token :" + responseJSON['file-token']);
                        
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