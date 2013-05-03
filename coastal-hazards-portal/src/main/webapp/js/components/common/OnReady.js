$(document).ready(function() {
	splashUpdate("Loading Main module...");

	splashUpdate("Initializing Logging...");
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CONFIG.development ? 'debug' : 'info'
	});

	splashUpdate("Initializing Session...");
	CONFIG.session = new Session();

	splashUpdate("Initializing UI...");
	CONFIG.ui = new UI({
		spinner: $("#application-spinner"),
		searchbar: $('#app-navbar-search-form'),
		mapdiv: $('#map')
	});
	CONFIG.ui.init();

	splashUpdate("Initializing Map...");
	CONFIG.map = new Map({
		mapDiv: 'map'
	});

	CONFIG.storms = new Storms({
		collapseDiv: $('#accordion-group-storms'),
		shareMenuDiv: $('#accordion-group-storms-share'),
		viewMenuDiv: $('#accordion-group-storms-view')
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

	var sid = CONFIG.session.getIncomingSid();
	if (sid) {
		LOG.info('OnReady.js:: Application initialized. Preparing call to server for spatial data');
		CONFIG.session.updateFromServer({
			sid: sid,
			callbacks: {
				success:
						[
							function() {
								CONFIG.map.updateFromSession();
								[CONFIG.storms, CONFIG.vulnerability, CONFIG.historical].each(function(item) {
									item.init();
								});
							}
						]
						,
				error: []
			}
		});
	} else {
		[CONFIG.storms, CONFIG.vulnerability, CONFIG.historical].each(function(item) {
			item.init();
		});
	}



});