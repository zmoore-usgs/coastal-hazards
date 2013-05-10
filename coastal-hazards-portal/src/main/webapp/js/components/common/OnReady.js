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

//	splashUpdate("Initializing Storms View...");
//	CONFIG.storms = new Storms({
//		collapseDiv: $('#accordion-group-storms'),
//		shareMenuDiv: $('#accordion-group-storms-share'),
//		viewMenuDiv: $('#accordion-group-storms-view')
//	});
//
//	splashUpdate("Initializing Vulnerability View...");
//	CONFIG.vulnerability = new Vulnerability({
//		collapseDiv: $('#accordion-group-vulnerability'),
//		shareMenuDiv: $('#accordion-group-vulnerability-share')
//	});
//
//	splashUpdate("Initializing Historical View...");
//	CONFIG.historical = new Historical({
//		collapseDiv: $('#accordion-group-historical'),
//		shareMenuDiv: $('#accordion-group-historical-share'),
//		viewMenuDiv: $('#accordion-group-historical-view')
//	});

	splashUpdate("Initializing OWS Services");
	CONFIG.ows = new OWS();
	CONFIG.popularity.populate({
		callbacks: {
			success: [
				function() {
					var results = CONFIG.popularity.results.sortBy(function(result) {
						return parseInt(result.hotness);
					}, true);
					
					results.each(function(result) {
						var item = CONFIG.ui.buildDescription({
							'cswId' : result.id
						});
						$('#description').append(item);
					})
				}
			]
		}
	});
			
	var initAllStages = function() {
		splashUpdate("Initializing Application sections...");
		[CONFIG.storms, CONFIG.vulnerability, CONFIG.historical].each(function(item) {
			item.init();
		});
	};
	var sid = CONFIG.session.getIncomingSid();
	if (sid) {
		splashUpdate("Reading session information from server...");
		CONFIG.session.updateFromServer({
			sid: sid,
			callbacks: {
				success:
						[
							function() {
								splashUpdate("Applying session information to application...");
//								initAllStages();
//								[CONFIG.storms, CONFIG.vulnerability, CONFIG.historical, CONFIG.map].each(function(item) {
//									item.updateFromSession();
//								});
							}
						],
				error: []
			}
		});
	} else {
//		initAllStages();
//		CONFIG.storms.enterSection();
	}

	splashUpdate("Starting Application...");
	$('#application-overlay').fadeOut(2000, function() {
		$('#application-overlay').remove();
		splashUpdate = undefined;
	});
	
});