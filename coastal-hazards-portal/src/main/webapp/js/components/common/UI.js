var UI = function(args) {
	LOG.info('UI.js::constructor: UI class is initializing.');
	var me = (this === window) ? {} : this;
	me.spinner = args.spinner;
	me.searchbar = args.searchbar;
	me.mapdiv = args.mapdiv;
	LOG.debug('UI.js::constructor: UI class initialized.');

	return $.extend(me, {
		init: function() {
			this.bindSearchInput();
			this.bindWindowResize();
			this.bindSubmenuButtons();
			$(window).resize();
		},
		showSpinner: function() {
			me.spinner.fadeIn();
		},
		hideSpinner: function() {
			me.spinner.fadeOut();
		},
		bindWindowResize: function() {
			$(window).resize(function() {
				var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height();
				$('#content-row').css('min-height', contentRowHeight);
				$('#map-wrapper').css('min-height', contentRowHeight);
				me.mapdiv.css('height', contentRowHeight);
			});
		},
		popoverClickHandler: function(e) {
			var container = $(this);
			if (!CONFIG.popupHandling.isVisible) {
				$(container).popover('show');
				CONFIG.popupHandling.clickedAway = false;
				CONFIG.popupHandling.isVisible = true;
				e.preventDefault();
			}
		},
		popoverShowHandler: function() {
			var container = $(this);
			var closePopovers = function(e) {
				if (CONFIG.popupHandling.isVisible && CONFIG.popupHandling.clickedAway && !$(e.target.offsetParent).hasClass('popover')) {
					$(document).off('click', closePopovers);
					$(container).popover('hide');
					CONFIG.popupHandling.isVisible = false;
					CONFIG.popupHandling.clickedAway = false;
				} else {
					CONFIG.popupHandling.clickedAway = true;
				}
			};
			$(document).off('click', closePopovers);
			$(document).on('click', closePopovers);
		},
		bindSubmenuButtons: function() {
			['storms', 'vulnerability'].each(function(item) {
				$('#accordion-group-' + item + '-view').popover({
					html: true,
					placement: 'right',
					trigger: 'manual',
					title: 'View ' + item.capitalize(),
					container: 'body',
					content: "<ul><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li></ul>"
				}).on({
					click: CONFIG.ui.popoverClickHandler,
					shown: CONFIG.ui.popoverShowHandler
				});

				$('#accordion-group-' + item + '-learn').popover({
					html: true,
					placement: 'right',
					trigger: 'manual',
					title: 'Learn About ' + item.capitalize(),
					container: 'body',
					content: "<ul><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li></ul>"
				}).on({
					click: CONFIG.ui.popoverClickHandler,
					shown: CONFIG.ui.popoverShowHandler
				});
			});
		},
		bindSearchInput: function() {
			me.searchbar.submit(function(evt) {
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
		},
		bindShareMenu: function(args) {
			var menuItem = args.menuItem;
			menuItem.popover({
				html: true,
				placement: 'right',
				trigger: 'manual',
				title: 'Share Session',
				container: 'body',
				content: "<div class='container-fluid' id='prepare-container'><div>Preparing session export...</div></div>"
			}).on({
				'click': CONFIG.ui.popoverClickHandler,
				'shown': function() {
					CONFIG.session.getMinifiedEndpoint({
						callbacks: [
							function(args) {
								var response = args.response;
								var url = args.url;

								// URL controlset
								var container = $('<div />').addClass('container-fluid');
								var row = $('<div />').addClass('row-fluid');
								var controlSetDiv = $('<div />');
								container.append(row.append(controlSetDiv));
								$('#prepare-container').replaceWith(container);


								var goUsaResponse = JSON.parse(response.response);
								if (goUsaResponse.response.statusCode && goUsaResponse.response.statusCode.toLowerCase() === 'error') {
									LOG.warn(response.response);
								} else {
									url = goUsaResponse.response.data.entry[0].short_url;
								}
								controlSetDiv.html('Use the following URL to share your current view<br /><br /><b>' + url + '</b>');
							}
						]
					});
					CONFIG.ui.popoverShowHandler.call(this);
				}
			});
		}
	});
};