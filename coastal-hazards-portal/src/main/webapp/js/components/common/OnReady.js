$(document).ready(function() {
	splashUpdate("Loading Main module...");

	splashUpdate("Initializing Logging...");
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CONFIG.development ? 'debug' : 'info'
	});

	splashUpdate("Initializing Session...");
	CONFIG.session = new Session();

	splashUpdate("Initializing UI...");
	CONFIG.ui = new UI();
	CONFIG.ui.init();

	splashUpdate("Initializing Map...");
	CONFIG.map = new Map({
		mapDiv: 'map'
	});

	CONFIG.storms = new Storms({
		shareMenuDiv: $('#accordion-group-storms-share')
	});
	CONFIG.storms.init();

	CONFIG.vulnerability = new Vulnerability({
		shareMenuDiv: $('#accordion-group-vulnerability-share')
	});
	CONFIG.vulnerability.init();

	CONFIG.historical = new Historical({
		shareMenuDiv: $('#accordion-group-historical-share')
	});
	CONFIG.historical.init();

	splashUpdate("Starting Application...");
	splashUpdate = undefined;

	$('#application-overlay').fadeOut(2000, function() {
		$('#application-overlay').remove();
	});

	CONFIG.ui.bindSearchInput();

	CONFIG.session.updateFromServer();
});