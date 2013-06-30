var CCH = CCH || {};
$(document).ready(function() {
	splashUpdate("Loading Main module...");

	splashUpdate("Initializing Logging...");
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
	});

	CCH.LOG = LOG;

	CCH.session = new CCH.Objects.Session().init();

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
		ccsArea: $('#ccsa-area'),
		shareModal : $('#shareModal')
	}).init();

	CCH.slideshow = new CCH.Objects.Slideshow().init();

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



	splashUpdate("Initializing Map...");
	CCH.map = new CCH.Objects.Map({
		mapDiv: 'map'
	}).init();

	splashUpdate("Initializing OWS Services");
	CCH.ows = new CCH.Objects.OWS().init();

	splashUpdate("Initializing Items");
	CCH.items = new CCH.Objects.Items().init();

	// Decide how to load the application. 
	// Depending on the 'idType' string, the application can be loaded either through:
	// 'ITEM' = Load a single item from the database
	// 'VIEW' = Load a session which can have zero, one or more items
	// '' = Load the application normally
	if (CCH.CONFIG.idType) {
		var type = CCH.CONFIG.idType;
		if (type === 'ITEM') {
			var itemId = CCH.CONFIG.id;
			splashUpdate('Loading Item ' + itemId);
			CCH.items.load({
				items: [itemId],
				callbacks: {
					success: [
						function() {
							CCH.Util.updateItemPopularity({
								item: itemId,
								type: 'use'
							});
							CCH.ui.removeOverlay();
						}
					],
					error: [
						function(jqXHR, textStatus, errorThrown) {
							var continueLink = $('<a />').attr('href', CCH.CONFIG.contextPath).html('<br />Click to continue');
							var emailLink = $('<a />').attr('href', 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load Item (Item: ' + itemId + ' Error: ' + errorThrown + ')').html('<br />Send E-Mail To System Administrator');

							if (404 === jqXHR.status) {
								splashUpdate("<b>Item Not Found</b><br />The item you are attempting to view no longer exists.<br />");
							} else {
								splashUpdate("<b>There was an error attempting to load an item.</b><br />The application may not function correctly.<br />Either try to reload the application or contact the system administrator.<br />");
							}
							$('#splash-status-update').append(continueLink);
							$('#splash-status-update').append(emailLink);
							LOG.error(errorThrown + ' : ' + jqXHR.responseText);
							$('#splash-spinner').fadeOut(2000);
						}
					]
				}
			});
		} else if (type === 'VIEW') {
			splashUpdate("Loading View " + CCH.CONFIG.id);
			CCH.session.load({
				sid: CCH.CONFIG.id,
				callbacks: {
					success: [
						function() {
							var idList = CCH.session.getSession().items.map(function(i) {
								return i.id
							});
							CCH.items.load({
								items: idList,
								callbacks: {
									success: [
										function() {
											CCH.ui.removeOverlay();
										}
									],
									error: [
										function(jqXHR, textStatus, errorThrown) {
											var continueLink = $('<a />').attr('href', CCH.CONFIG.contextPath).html('<br />Click to continue');
											var emailLink = $('<a />').attr('href', 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load Item (Item: ' + itemId + ' Error: ' + errorThrown + ')').html('<br />Send E-Mail To System Administrator');

											if (404 === jqXHR.status) {
												splashUpdate("<b>Items Not Found</b><br />The items you are attempting to view no longer exist.<br />");
											} else {
												splashUpdate("<b>There was an error attempting to load items.</b><br />The application may not function correctly.<br />Either try to reload the application or contact the system administrator.<br />");
											}
											$('#splash-status-update').append(continueLink);
											$('#splash-status-update').append(emailLink);
											LOG.error(errorThrown + ' : ' + jqXHR.responseText);
											$('#splash-spinner').fadeOut(2000);
										}
									]
								}
							});
						}
					],
					error: [
						function(jqXHR, textStatus, errorThrown) {
							var continueLink = $('<a />').attr('href', CCH.CONFIG.contextPath).html('Click to continue');
							var emailLink = $('<a />').attr('href', 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load View (View: ' + CCH.CONFIG.id + ' Error: ' + errorThrown + ')').html('<br />Send E-Mail To System Administrator');

							if (404 === jqXHR.status) {
								splashUpdate("<b>View Not Found</b><br />The view you are attempting to load may no longer exist.<br />");
							} else {
								splashUpdate("<b>There was an error attempting to load your view.</b><br /><br />Either try to reload the application or contact the system administrator.<br />");
							}
							$('#splash-status-update').append(continueLink);
							$('#splash-status-update').append(emailLink);
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
						var continueLink = $('<a />').attr('href', CCH.CONFIG.contextPath).html('<br />Click to try again');
						var emailLink = $('<a />').attr('href', 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load Any Items (' + errorThrown + ')').html('<br />Send E-Mail To System Administrator');
						splashUpdate("<b>Application Error</b><br />Coastal Hazards Portal could not find any items to display.<br />Due to this error, the application can not function properly.<br />");
						$('#splash-status-update').append(continueLink);
						$('#splash-status-update').append(emailLink);
						LOG.error(errorThrown + ' : ' + jqXHR.responseText);
						$('#splash-spinner').fadeOut(2000);
					}
				]
			}
		});
	}
});