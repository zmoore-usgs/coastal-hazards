$(document).ready(function() {
	splashUpdate("Loading Main module...");
	
	splashUpdate("Initializing Logging...");
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
	});

	CCH.LOG = LOG;
	
	splashUpdate("Initializing Session...");
	CCH.session = new CCH.Objects.Session();

	splashUpdate("Initializing UI...");
	CCH.ui = new CCH.Objects.UI({
		spinner: $("#application-spinner"),
		searchbar: $('.app-navbar-search-form'),
		mapdiv: $('#map'),
		descriptionDiv: $('#description-wrapper')
	});
	CCH.ui.init();

	splashUpdate("Initializing Map...");
	CCH.map = new CCH.Objects.Map({
		mapDiv: 'map'
	});
	CCH.map.init();

	splashUpdate("Initializing OWS Services");
	CCH.ows = new CCH.Objects.OWS();
	CCH.CONFIG.popularity.populate({
		callbacks: {
			success: [
				function() {
					if (CCH.CONFIG.popularity.results) {
						CCH.ui.createSlideshow();
					}
				}
			]
		}
	});

	var sid = CCH.session.getIncomingSid();
	if (sid) {
		splashUpdate("Reading session information from server...");
		CCH.session.updateFromServer({
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