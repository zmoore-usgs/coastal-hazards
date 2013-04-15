var UI = function() {
	LOG.info('UI.js::constructor: UI class is initializing.');
	var me = (this === window) ? {} : this;

	$(window).resize(function() {
		var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height();
		$('#content-row').css('min-height', contentRowHeight);
		$('#map-wrapper-div').css('min-height', contentRowHeight);
		$('#map').css('height', $('#map-wrapper-div').height());
	});
	$(window).resize();

	LOG.debug('UI.js::constructor: UI class initialized.');

	return $.extend(me, {
		showSpinner: function() {
			$("#application-spinner").fadeIn();
		},
		hideSpinner: function() {
			$("#application-spinner").fadeOut();
		},
		bindSearchInput: function() {
			$('#app-navbar-search-form').submit(function(evt) {
				var query = $('#app-navbar-search-input').val();
				if (query) {
					$.ajax({
						type: 'GET',
						url: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find',
						data: {
							text: query,
							maxLocations: '20',
							outFields: '*',
							f: 'pjson',
							outSR: '3785'
						},
						async: false,
						contentType: 'application/json',
						dataType: 'jsonp',
						success: function(json) {
							if (json.locations[0]) {

								CONFIG.map.buildGeocodingPopup({
									locations: json.locations
								});

							} else {
//								CONFIG.ui.showAlert({
//									close: false,
//									message: query + ' not found',
//									displayTime: 1000,
//									style: {
//										classes: ['alert-info']
//									}
//								});
							}
						}
					});
				}

			});
		}
	});
};