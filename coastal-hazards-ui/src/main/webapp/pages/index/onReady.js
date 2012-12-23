// TODO - Add current user session to temp session and use temp session as the work session and persist temp session to permSession at intervals
var sld;
$(document).ready(function() {
    
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : CONFIG.development ? 'debug' : 'info'
    });
    
    // Utility class for the user interface
    CONFIG.ui = new UI();
    
    // Map interaction object. Holds the map and utilities 
    CONFIG.map = new Map();
    
    // Primarily a utility class
    CONFIG.ows = new OWS();
    
    // Contains the pemanent session object which holds one or more sessions
    CONFIG.permSession = new Session('coastal-hazards', true);
    // Contains the non-permanent single-session object
    CONFIG.tempSession = new Session('coastal-hazards', false);
    
    LOG.info('Sessions created. User session list has ' + Object.keys(CONFIG.permSession.session.sessions).length + ' sessions.')
    LOG.info('Current session key: ' + CONFIG.permSession.getCurrentSessionKey());
    
    CONFIG.tempSession.setCurrentSession(CONFIG.permSession.getCurrentSessionKey(), CONFIG.permSession);
    
    LOG.info('Preparing call to OWS GetCapabilities')
    CONFIG.ows.getWMSCapabilities({
        callbacks : [
        CONFIG.tempSession.updateSessionLayersFromWMSCaps,
        Shorelines.initializeUploader,
        Baseline.initializeUploader,
        Transects.initializeUploader,
        function() {
            $("#calculate-transects-btn").on("click", Transects.calcTransects);
            $("#create-intersections-btn").on("click", Intersections.calcIntersections);
            $('#baseline-draw-btn').on("click", Baseline.drawButtonToggled);
        },
        Shorelines.populateFeaturesList,
        Baseline.populateFeaturesList,
        Transects.populateFeatureList
        ]
    })
})