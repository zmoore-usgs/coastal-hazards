$(document).ready(function() {
	splashUpdate("Loading Main module...");

	splashUpdate("Initializing Logging...");
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
	});

	CCH.LOG = LOG;
	
	splashUpdate("Initializing Session...");
	CCH.CONFIG.session = new CCH.Session();

	splashUpdate("Initializing UI...");
	CCH.CONFIG.ui = new CCH.UI({
		spinner: $("#application-spinner"),
		searchbar: $('.app-navbar-search-form'),
		mapdiv: $('#map'),
		descriptionDiv: $('#description-wrapper')
	});
	CCH.CONFIG.ui.init();

	splashUpdate("Initializing Map...");
	CCH.CONFIG.map = new CCH.Map({
		mapDiv: 'map'
	});

	splashUpdate("Initializing OWS Services");
	CCH.CONFIG.ows = new CCH.OWS();
	CCH.CONFIG.popularity.populate({
		callbacks: {
			success: [
				function() {
					if (CCH.CONFIG.popularity.results) {
						CCH.CONFIG.ui.createSlideshow();
					}
				}
			]
		}
	});

	var sid = CCH.CONFIG.session.getIncomingSid();
	if (sid) {
		splashUpdate("Reading session information from server...");
		CCH.CONFIG.session.updateFromServer({
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