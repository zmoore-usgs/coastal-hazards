var CCH = CCH || {};
$(document).ready(function() {
	splashUpdate("Loading Main module...");

	splashUpdate("Initializing Logging...");
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
	});

	CCH.LOG = LOG;

	CCH.session = new CCH.Objects.Session();

	splashUpdate("Initializing Card Subsystem...");
	CCH.cards = new CCH.Objects.Cards({
		navPinControlCount: $('#app-navbar-pin-control-pincount'),
		navPinControlButton: $('#app-navbar-pin-control-button'),
		navPinControlDropdownButton: $('#app-navbar-pin-control-dropdown-button')
	}).init();

	splashUpdate("Initializing Search Subsystem...");
	CCH.search = new CCH.Objects.Search({
		itemSearchModalWindow: $('#item-search-modal'),
		searchbar: $('.map-search-form'),
		geocodeEndoint: CCH.CONFIG.data.sources.geocoding.endpoint,
		modalContainer: $('#item-search-modal'),
		north: $('#item-search-map-input-north'),
		south: $('#item-search-map-input-south'),
		east: $('#item-search-map-input-east'),
		west: $('#item-search-map-input-west'),
		searchContainer: $('#app-navbar-item-search-container'),
		submitButton: $('#item-search-submit'),
		keywordInput: $('#item-search-keyword-input'),
		themeInput: $('#item-search-theme-input'),
		popularityCb: $('#popularity-sort-checkbox'),
		searchQuery: $('.search-query')
	}).init();

	splashUpdate("Initializing UI...");
	CCH.ui = CCH.Objects.UI({
		itemSearchModalWindow: $('#item-search-modal'),
		applicationContainer: $('#application-container'),
		headerRow: $('#header-row'),
		footerRow: $('#footer-row'),
		mapdiv: $('#map'),
		descriptionDiv: $('#description-wrapper'),
		navbarPinButton: $('#app-navbar-pin-control-button'),
		navbarDropdownIcon: $('#app-navbar-pin-control-icon'),
		navbarClearMenuItem: $('#app-navbar-pin-control-clear'),
		navbarShareMenuListItem: $('#app-navbar-pin-control-share-li'),
		mapSearchContainer: $('#map-search-container'),
		ccsArea: $('#ccsa-area')
	}).init();

	splashUpdate("Initializing Map...");
	CCH.map = new CCH.Objects.Map({
		mapDiv: 'map',
		maximizeDiv: $('#OpenLayers_Control_MaximizeDiv_innerImage'),
		minimizeDiv: $('#OpenLayers_Control_MinimizeDiv_innerImage')
	}).init();

	splashUpdate("Initializing OWS Services");
	CCH.ows = new CCH.Objects.OWS().init();

	splashUpdate("Initializing Items");
	CCH.items = new CCH.Objects.Items().init();

	if (CCH.CONFIG.idType) {
		var type = CCH.CONFIG.idType;
		if (type === 'ITEM') {
			var itemId = CCH.CONFIG.id;
			splashUpdate('Loading Item With ID ' + itemId);
			CCH.items.load({
//				items: [itemId],
				callbacks: {
					success: [
						function() {
							CCH.ui.removeOverlay();
						}
					],
					error: [
						function(jqXHR, textStatus, errorThrown) {
							splashUpdate("<b>There was an error attempting to load an item.</b><br />The application may not function correctly.<br />Either try to reload the application or contact the system administrator.");
							LOG.error(errorThrown + ' : ' + jqXHR.responseText);
							$('#splash-spinner').fadeOut(2000);
						}
					]
				}
			});
		} else if (type === 'VIEW') {
			splashUpdate("Initializing Session...");
			CCH.session.init({
				callbacks: {
					success: [
						function() {
							CCH.ui.removeOverlay();
						}
					],
					error: [
						function(jqXHR, textStatus, errorThrown) {
							splashUpdate("<b>There was an error attempting to load session.</b><br />The application may not function correctly.<br />Either try to reload the application or contact the system administrator.");
							LOG.error(errorThrown + ' : ' + jqXHR.responseText);
							$('#splash-spinner').fadeOut(2000);
						}
					]
				}
			});
		}
	} else {
		CCH.items.load({
			callbacks: {
				success: [
					function() {
						CCH.ui.removeOverlay();
					}
				],
				error: [
					function(jqXHR, textStatus, errorThrown) {
						splashUpdate("<b>There was an error attempting to load an item.</b><br />The application may not function correctly.<br />Either try to reload the application or contact the system administrator.");
						LOG.error(errorThrown + ' : ' + jqXHR.responseText);
						$('#splash-spinner').fadeOut(2000);
					}
				]
			}
		});
	}
});