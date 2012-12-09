$(document).ready(function() {
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : 'info'
    });
    map = new OpenLayers.Map( 'map', {
        projection : "EPSG:900913"
    } );
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
        autoUpload: false,
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
        onError : function(id, fileName, errorReason) {
            //TODO- do something
        },
        onComplete : function(id, filename, responseJSON) {
            if (responseJSON.sucess != 'true') {
                console.warn('FAIL!!!')
            } else {
                console.log("file-token :" + responseJSON['file-token']);
            }
        }
    })
    
    $('#myModal-save-btn').click(function() {
        uploader.uploadStoredFiles();
    });
    
})