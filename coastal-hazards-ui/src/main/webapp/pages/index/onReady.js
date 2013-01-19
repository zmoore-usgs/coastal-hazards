// TODO - Add current user session to temp session and use temp session as the work session and persist temp session to permSession at intervals
var sld;
$(document).ready(function() {
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : CONFIG.development ? 'debug' : 'info'
    });
    
    // Math.seedrandom('Look @ http://davidbau.com/encode/seedrandom.js')
    
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
    
    var currentSessionKey = CONFIG.permSession.getCurrentSessionKey();
    LOG.info('OnReady.js:: Sessions created. User session list has ' + Object.keys(CONFIG.permSession.session.sessions).length + ' sessions.')
    LOG.info('OnReady.js:: Current session key: ' + currentSessionKey);
    
    CONFIG.tempSession.setCurrentSession(currentSessionKey, CONFIG.permSession);
    
    LOG.info('OnReady.js:: Preparing call to OWS GetCapabilities')
    CONFIG.ows.getWMSCapabilities({
        namespace : 'sample',
        callbacks : {
            success : [
            function() {
                CONFIG.ows.getWMSCapabilities({
                    namespace : currentSessionKey,
                    callbacks : {
                        success : [
                        CONFIG.tempSession.updateLayersFromWMS,
                        Shorelines.initializeUploader,
                        Baseline.initializeUploader,
                        Transects.initializeUploader,
                        Shorelines.populateFeaturesList,
                        Baseline.populateFeaturesList,
                        Transects.populateFeaturesList,
                        Intersections.populateFeaturesList,
                        Results.populateFeaturesList
                        ],
                        error : [
                        Shorelines.initializeUploader,
                        Baseline.initializeUploader,
                        Transects.initializeUploader,
                        Shorelines.populateFeaturesList,
                        Baseline.populateFeaturesList,
                        Transects.populateFeaturesList,
                        Intersections.populateFeaturesList,
                        Results.populateFeaturesList
                        ]
                    }
                })
            }
            ]
        }
    })
})