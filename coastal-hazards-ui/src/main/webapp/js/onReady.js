// TODO - Add current user session to temp session and use temp session as the work session and persist temp session to permSession at intervals
var sld;
$(document).ready(function() {
    initializeLogging({
        LOG4JS_LOG_THRESHOLD : CONFIG.development ? 'debug' : 'info'
    });
    
    $(document).ajaxStart(function() {
        LOG.debug('start');
        $("#application-spinner").fadeIn();
    });
    
    $(document).ajaxStop(function() {
        LOG.debug('end');
        $("#application-spinner").fadeOut();
    });
    
    // Math.seedrandom('Look @ http://davidbau.com/encode/seedrandom.js')
    
    try {
        // Contains the pemanent session object which holds one or more sessions
        CONFIG.permSession = new Session('coastal-hazards', true);
        // Contains the non-permanent single-session object
        CONFIG.tempSession = new Session('coastal-hazards', false);
        var currentSessionKey = CONFIG.permSession.getCurrentSessionKey();
        LOG.info('OnReady.js:: Sessions created. User session list has ' + Object.keys(CONFIG.permSession.session.sessions).length + ' sessions.')
        LOG.info('OnReady.js:: Current session key: ' + currentSessionKey);
        CONFIG.tempSession.setCurrentSession(currentSessionKey, CONFIG.permSession);
    } catch (e) {
        LOG.error('OnReady.js:: Session could not be read correctly')
        LOG.error(e);
        // This could probably be hardcoded into index but... here it is
        var modal = $('<div />')
        .addClass('modal hide fade')
        .attr('id', 'session-reset-modal')    
        .append(
            $('<div />')
            .addClass('modal-header')
            .append($('<button />')
                .attr({
                    type : 'button',
                    'data-dismiss' : 'modal',
                    'aria-hidden' : 'true'
                })
                .html('&times;')
                .addClass('close'))
            .append($('<h3 />').html('Invalid Session State')))
        .append($('<div />').addClass('modal-body')
            .append('<p />')
            .html('Your session information is invalid or out of date. We strongly suggest you reset your session. You may also try reloading the application. We can not garuantee proper application functionality if you choose to keep your current session. For further information, check the browser logs.'))
        .append($('<div />').addClass('modal-footer')
            .append($('<a />').attr({
                'href' : '#',
                'data-dismiss' : 'modal',
                'aria-hidden' : 'true'
            }).addClass('btn').html('Close'))
            .append($('<a />').attr('href', '#').addClass('btn').html('Reload').on('click', function(){
                location.reload()
            }))
            .append($('<a />').attr('href', '#').addClass('btn btn-primary').html('Reset Session').css('color', '#FFFFFF').on('click', function(){
                localStorage.clear();
                sessionStorage.clear();
                location.reload();
            })))
            
        modal.modal();
    }
    
    // Utility class for the user interface
    CONFIG.ui = new UI();
    
    // Map interaction object. Holds the map and utilities 
    CONFIG.map = new Map();
    
    // Primarily a utility class
    CONFIG.ows = new OWS();
    
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
                        Calculation.populateFeaturesList,
                        Results.populateFeaturesList,
                        function() {
                            $('.qq-upload-button').addClass('btn btn-success');
                            $('#application-overlay').fadeOut()
                        }
                        
                        ],
                        error : [
                        Shorelines.initializeUploader,
                        Baseline.initializeUploader,
                        Transects.initializeUploader,
                        Shorelines.populateFeaturesList,
                        Baseline.populateFeaturesList,
                        Transects.populateFeaturesList,
                        Calculation.populateFeaturesList,
                        Results.populateFeaturesList,
                        function() {
                            $('#application-overlay').fadeOut()
                        }
                        ]
                    }
                })
            }
            ]
        }
    })
    
})