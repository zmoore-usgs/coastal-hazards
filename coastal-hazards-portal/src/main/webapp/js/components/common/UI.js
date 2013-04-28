var UI = function() {
	LOG.info('UI.js::constructor: UI class is initializing.');
	var me = (this === window) ? {} : this;
	LOG.debug('UI.js::constructor: UI class initialized.');

	return $.extend(me, {
		init: function() {
			this.bindSearchInput();
			this.bindWindowResize();
			this.bindSubmenuButtons();
			$(window).resize();
		},
				
		showSpinner: function() {
			$("#application-spinner").fadeIn();
		},
				
		hideSpinner: function() {
			$("#application-spinner").fadeOut();
		},
				
		bindWindowResize: function() {
			$(window).resize(function() {
				var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height();
				$('#content-row').css('min-height', contentRowHeight);
				$('#map-wrapper').css('min-height', contentRowHeight);
				$('#map').css('height', contentRowHeight);
			});
		},
				
		bindSubmenuButtons: function() {
			['storms', 'vulnerability', 'historical'].each(function(item) {
				$('#accordion-group-' + item + '-view').popover({
					html: true,
					placement: 'right',
					trigger: 'click',
					title: 'View ' + item.capitalize(),
					container: 'body',
					content: "<ul><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li></ul>"
				}).on({
					show : function() {
						LOG.debug('shown')
					}
				});

//				$('#accordion-group-' + item + '-share').popover({
//					html: true,
//					placement: 'right',
//					trigger: 'click',
//					title: 'Share ' + item.capitalize(),
//					container: 'body',
//					content: "<ul><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li></ul>"
//				});

				$('#accordion-group-' + item + '-learn').popover({
					html: true,
					placement: 'right',
					trigger: 'click',
					title: 'Learn About ' + item.capitalize(),
					container: 'body',
					content: "<ul><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li></ul>"
				});
			});
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