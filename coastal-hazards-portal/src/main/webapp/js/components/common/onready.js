$(document).ready(function() {
	splashUpdate("Loading Main module...");

	splashUpdate("Initializing Logging...");
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CONFIG.development ? 'debug' : 'info'
	});

	splashUpdate("Initializing UI...");
	CONFIG.ui = new UI();

	splashUpdate("Initializing Map...");
	CONFIG.map = new Map();

	splashUpdate("Starting Application...");
	splashUpdate = undefined;

	$('#application-overlay').fadeOut(2000, function() {
		$('#application-overlay').remove();
	});
	
	CONFIG.ui.bindSearchInput();
});