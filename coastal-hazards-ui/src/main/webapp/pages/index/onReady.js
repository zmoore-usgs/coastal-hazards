$(document).ready(function() {
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : 'info'
    });
    map = new OpenLayers.Map( 'map' );
    var layer = [];
    layer[0] = new OpenLayers.Layer.WMS( "OpenLayers WMS",
        "http://vmap0.tiles.osgeo.org/wms/vmap0",
        {
            layers: 'basic'
        } );
    map.addLayer(layer[0]);
	
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
            endpoint: 'server/upload',
            params: {
                'key1' : 'val1',
                'key2' : 'val2'
            }
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
        debug: true
    });
    
    $('#myModal-save-btn').click(function() {
        uploader.uploadStoredFiles();
    });
    
})