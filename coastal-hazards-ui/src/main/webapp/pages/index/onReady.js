// TODO - Add current user session to temp session and use temp session as the work session and persist temp session to permSession at intervals
var tempSession, permSession, geoserver, map, ui, sld;

$(document).ready(function() {
    
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : CONFIG.development ? 'debug' : 'info'
    });
    
    Shorelines.initializeUploader();
        
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
    
    geoserver.getCapabilities({
        callbacks : [
        function(caps) {
            Shorelines.populateFeaturesList(caps);
            Baseline.populateFeaturesList(caps);
        }
        ]
    })
})