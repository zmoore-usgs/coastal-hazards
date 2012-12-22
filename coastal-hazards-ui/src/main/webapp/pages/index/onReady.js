// TODO - Add current user session to temp session and use temp session as the work session and persist temp session to permSession at intervals
var tempSession; // Contains the non-permanent single-session object
var permSession; // Contains the pemanent session object which holds one or more sessions
var geoserver; // Primarily a utility class
var map; // Map interaction object. Holds the map and utilities 
var ui; // Utility class for the user interface
var sld;
$(document).ready(function() {
    
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : CONFIG.development ? 'debug' : 'info'
    });
    
        
    ui = new UI();
    map = new Map();
    geoserver = new Geoserver();
    
    // Set up sessions
    permSession = new Session('coastal-hazards', true);
    tempSession = new Session('coastal-hazards', false);
    LOG.info('Sessions created. User session list has ' + Object.keys(permSession.session.sessions).length + ' sessions.')
    LOG.info('Current session key: ' + permSession.getCurrentSessionKey());
    tempSession.setCurrentSession(permSession.getCurrentSessionKey(), permSession);
    
    ui.initializeUploader('shorelines');
    ui.initializeUploader('baseline');
    ui.initializeUploader('transects');
    
    $("#calculate-transects-btn").on("click", Transects.calcTransects);
    $("#create-intersections-btn").on("click", Intersections.calcIntersections);
    $('#baseline-draw-btn').on("click", Baseline.drawBaseline);
    
    geoserver.getWMSCapabilities({
        callbacks : [
        function(caps) {
            Shorelines.populateFeaturesList(caps);
            Baseline.populateFeaturesList(caps);
            Transects.populateFeatureList(caps);
        }
        ]
    })
})