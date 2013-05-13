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
		mapdiv: $('#map'),
		descriptionDiv: $('#description-wrapper')
	});
	CONFIG.ui.init();

	splashUpdate("Initializing Map...");
	CONFIG.map = new Map({
		mapDiv: 'map'
	});

	splashUpdate("Initializing OWS Services");
	CONFIG.ows = new OWS();
	CONFIG.popularity.populate({
		callbacks: {
			success: [
				function() {
					if (CONFIG.popularity.results) {
						CONFIG.ui.createSlideshow();
					}
				}
			]
		}
	});

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
							}
						],
				error: []
			}
		});
	}
	
	splashUpdate("Starting Application...");
	$('#application-overlay').fadeOut(2000, function() {
		$('#application-overlay').remove();
		splashUpdate = undefined;
	});
});