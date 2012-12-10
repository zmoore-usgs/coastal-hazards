var tempSession, permSession;
$(document).ready(function() {
    
    // Set up sessions
    tempSession = new Session('coastal-hazards', false);
    permSession = new Session('coastal-hazards', true);
    permSession.session.sessions = permSession.session.sessions ? permSession.session.sessions : [];
    
    if (permSession.session.sessions.length == 0) {
        var newSession = {};
        var randID = randomUUID();
        newSession[randID] = {}; 
        permSession.session.sessions.push(newSession);
        permSession['current-session'] = randID;
        permSession.save();
    } 
    tempSession.session = permSession[permSession['current-session']];
    tempSession.save();
    
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
        element: document.getElementById('bootstrapped-fine-uploader'),
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
        template: '<div class="qq-uploader span12">' +
        '<pre class="qq-upload-drop-area span12"><span>{dragZoneText}</span></pre>' +
        '<div class="qq-upload-button btn btn-success" style="width: auto;">{uploadButtonText}</div>' +
        '<ul class="qq-upload-list" style="margin-top: 10px; text-align: center;"></ul>' +
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
                    }
                }
            }
        }
    })
    
    $('#myModal-save-btn').click(function() {
        uploader.uploadStoredFiles();
    });
    
})