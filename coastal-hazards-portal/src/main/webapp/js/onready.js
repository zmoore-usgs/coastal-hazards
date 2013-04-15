$(document).ready(function() {
	splashUpdate("Loading Main module...");
	
	splashUpdate("Initializing Logging...");
    initializeLogging({
        LOG4JS_LOG_THRESHOLD: CONFIG.development ? 'debug' : 'info'
    });
	
	splashUpdate("Initializing Map...");
    CONFIG.map = new Map();

	splashUpdate("Starting Application...");
	splashUpdate = undefined;

	$(window).resize(function() {
		var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height();
		$('#content-row').css('min-height', contentRowHeight);
		$('#map-wrapper-div').css('min-height',contentRowHeight);
	});
	$(window).resize();

	$('#application-overlay').fadeOut(2000, function() {
			$('#application-overlay').remove();
	});
});