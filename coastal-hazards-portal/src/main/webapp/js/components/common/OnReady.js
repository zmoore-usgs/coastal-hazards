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

	CONFIG.vulnerability = new Vulnerability({
		shareMenuDiv: $('#accordion-group-vulnerability-share')
	});

	CONFIG.historical = new Historical({
		collapseDiv: $('#accordion-group-historical'),
		shareMenuDiv: $('#accordion-group-historical-share'),
		viewMenuDiv: $('#accordion-group-historical-view')
	});

	splashUpdate("Starting Application...");
	splashUpdate = undefined;

	$('#application-overlay').fadeOut(2000, function() {
		$('#application-overlay').remove();
	});

	CONFIG.ui.bindSearchInput();

	CONFIG.ows = new OWS();

	LOG.info('OnReady.js:: Application initialized. Preparing call to server for spatial data');
	CONFIG.ows.getWMSCapabilities({
		callbacks: {
			success: [
				function(data, textStatus, jqXHR) {
					LOG.info('OnReady.js:: Initial spatial data retrieved from server.');
					CONFIG.session.updateFromServer({
						callbacks: [
							function() {
								CONFIG.map.updateFromSession();
							}
						]
					});
				},
				function() {
					[CONFIG.storms, CONFIG.vulnerability, CONFIG.historical].each(function(item) {
						item.init();
					});
				}
			],
			error: [
				function(data, textStatus, jqXHR) {
					LOG.error('OnReady.js:: Got an error while getting WMS GetCapabilities from server');
				}
			]
		}
	});
});