var CCH = CCH || {};
CCH.Objects.UI = function(args) {
	CCH.LOG.info('UI.js::constructor: UI class is initializing.');
	var me = (this === window) ? {} : this;
	me.search;
	me.applicationOverlay = args.applicationOverlay;
	me.mapdiv = args.mapdiv;
	me.descriptionDiv = args.descriptionDiv;
	me.magicResizeNumber = 767;
	me.minimumHeight = args.minimumHeight || 480;
	me.previousWidth = $(window).width();
	me.navbarPinButton = args.navbarPinButton;
	me.navbarPinDropdownButton = args.navbarDropdownIcon;
	me.navbarClearMenuItem = args.navbarClearMenuItem;
	me.navbarShareMenuListItem = args.navbarShareMenuListItem;
	me.applicationContainer = args.applicationContainer;
	me.headerRow = args.headerRow;
	me.footerRow = args.footerRow;
	me.mapSearchContainer = args.mapSearchContainer;
	me.ccsArea = args.ccsArea;
	me.shareModal = args.shareModal;
	me.shareUrlButton = args.shareUrlButton;
	me.shareInput = args.shareInput;
	me.shareTwitterBtn = args.shareTwitterBtn;

	CCH.LOG.debug('UI.js::constructor: UI class initialized.');
	return $.extend(me, {
		init: function() {
			// This window name is used for the info window to launch into when 
			// a user chooses to go back to the portal
			window.name = "portal_main_window";

			$(window).on({
				'resize': me.windowResizeHandler,
				'cch.data.items.searched': function(evt, count) {
					// Display a notification with item count
					$.pnotify({
						text: 'Found ' + count + ' item' + (count === 1 ? '.' : 's.'),
						styling: 'bootstrap',
						type: 'info',
						nonblock: true,
						sticker: false,
						icon: 'icon-search'
					});
				},
				'cch.navbar.pinmenu.item.clear.click': function() {
					me.navbarPinButton.removeClass('slider-card-pinned');
				}
			});
			me.navbarPinButton.on('click', me.navbarMenuClickHandler);
			me.navbarClearMenuItem.on('click', me.navbarClearItemClickHandler);
			me.shareModal.on('show', me.sharemodalDisplayHandler);
			$('#app-navbar-search-storms-container').tooltip({
				title: 'View All Storms',
				placement: 'left'
			});
			$('#app-navbar-search-storms-container').on('click', function() {
				$(window).trigger('cch.search.item.submit', {
					'popularity': true,
					'themes': ['storms']
				});
			});
			$('#app-navbar-search-vulnerability-container').tooltip({
				title: 'View All Vulnerability',
				placement: 'left'
			});
			$('#app-navbar-search-vulnerability-container').on('click', function() {
				$(window).trigger('cch.search.item.submit', {
					'popularity': true,
					'themes': ['vulnerability']
				});
			});
			$('#app-navbar-search-historical-container').tooltip({
				title: 'View All Historical',
				placement: 'left'
			});
			$('#app-navbar-search-historical-container').on('click', function() {
				$(window).trigger('cch.search.item.submit', {
					'popularity': true,
					'themes': ['historical']
				});
			});
			// Header fix
			me.ccsArea.find('br').first().remove();

			$(window).resize();
			$(window).trigger('cch.ui.initialized');
			return me;
		},
		navbarMenuClickHandler: function() {
			// Check to see if any cards are pinned
			var pinnedCardIds = CCH.session.getPinnedItemIds();
			var items = null;

			if (pinnedCardIds.length) {
				// Toggle how the button looks
				me.navbarPinDropdownButton.toggleClass('muted');
				me.navbarPinButton.toggleClass('slider-card-pinned');

				// Check if button is active
				if (!me.navbarPinDropdownButton.hasClass('muted')) {
					// If cards are pinned, show only pinned cards
					// Otherwise, show all cards
					// TODO- This functionality should probably be in Cards
					items = [];
					for (var pcIdx = 0; pcIdx < pinnedCardIds.length; pcIdx++) {
						var id = pinnedCardIds[pcIdx];
						items.push(CCH.session.getSession().items.find(function(result) {
							return result.id === id;
						}));
					}
					CCH.map.zoomToActiveLayers();
				}
			}

			// pinnedResults may or may not be an empty array. If it is, 
			// the full deck will be seen. Otherwise, if pinnedResults is
			// populated, only pinned cards will be seen
			$(window).trigger('cch.navbar.pinmenu.button.pin.click', {items: items});
		},
		navbarClearItemClickHandler: function() {
			$(window).trigger('cch.navbar.pinmenu.item.clear.click');
		},
		windowResizeHandler: function() {
			var currWidth = $(window).width();
			var currentSizing = me.getCurrentSizing();
			var contentRowHeight = $(window).height() - me.headerRow.height() - me.footerRow.height();
			contentRowHeight = contentRowHeight < me.minimumHeight ? me.minimumHeight : contentRowHeight;

			if (currentSizing === 'small') {
				// In a profile view, we care about the height of the description container
				var descriptionHeight = Math.round(contentRowHeight * .30);
				if (descriptionHeight < 280) {
					descriptionHeight = 280;
				}
				me.descriptionDiv.height(descriptionHeight);
				me.mapdiv.height(contentRowHeight - descriptionHeight);

			} else if (currentSizing === 'large') {
				me.mapdiv.height(contentRowHeight);
				me.descriptionDiv.height(contentRowHeight);
			}

			// Check if the application was resized. If so, re-initialize the slideshow to easily
			// fit into the new layout
			if ((me.previousWidth > me.magicResizeNumber && currWidth <= me.magicResizeNumber) ||
					(me.previousWidth <= me.magicResizeNumber && currWidth > me.magicResizeNumber)) {
				$(window).trigger('cch.ui.resized', currentSizing);
			}

			// Because the window was resized, the search container in the map
			// needs to be repositioned
			var mapPosition = me.mapdiv.position();
			var mapHeight = me.mapdiv.height();
			var mapWidth = me.mapdiv.width();
			var searchContainerHeight = me.mapSearchContainer.height();
			var searchContainerWidth = me.mapSearchContainer.width();
			me.mapSearchContainer.css({
				top: mapPosition.top + mapHeight - searchContainerHeight - 10,
				left: mapPosition.left + mapWidth - searchContainerWidth - 20,
				zIndex: 1004
			});

			me.previousWidth = currWidth;
		},
		removeOverlay: function() {
			splashUpdate("Starting Application...");

			$(window).resize();

			// Get rid of the overlay and clean it up out of memory and DOM
			me.applicationOverlay.fadeOut(2000, function() {
				me.applicationOverlay.remove();
				$(window).trigger('cch.ui.overlay.removed');
				splashUpdate = undefined;
				me.applicationOverlay = undefined;
			});
		},
		getCurrentSizing: function() {
			// Bootstrap decides when to flip the application view based on 
			// a specific width. 767px seems to be the point 
			// https://github.com/twitter/bootstrap/blob/master/less/responsive-767px-max.less
			if (me.previousWidth <= me.magicResizeNumber) {
				return 'small';
			} else if (me.previousWidth > me.magicResizeNumber) {
				return 'large';
			}
		},
		sharemodalDisplayHandler: function() {
			me.shareUrlButton.addClass('disabled');
			me.shareInput.val('');
			me.shareTwitterBtn.empty();

			// A user has clicked on the share menu item. A session needs to be 
			// created and a token retrieved...
			CCH.session.writeSession({
				callbacks: {
					success: [
						function(json, textStatus, jqXHR) {
							var sid = json.sid;
							var sessionUrl = CCH.CONFIG.publicUrl + '/ui/view/' + sid;
							CCH.Util.getMinifiedEndpoint({
								contextPath: CCH.CONFIG.contextPath,
								location: sessionUrl,
								callbacks: {
									success: [
										function(json, textStatus, jqXHR) {
											var url = json.tinyUrl;
											me.shareInput.val(url);
											me.shareUrlButton.attr({
												'href': url
											}).removeClass('disabled');
											me.shareInput.select();
											twttr.widgets.createShareButton(
													url,
													me.shareTwitterBtn[0],
													function(element) {
														// Any callbacks that may be needed
													},
													{
														hashtags: 'USGS_CCH',
														lang: 'en',
														size: 'large',
														text: 'Check out my CCH View!',
														count: 'none'
													});

											twttr.events.bind('tweet', function(event) {
												$.pnotify({
													text: 'Your view has been tweeted. Thank you.',
													styling: 'bootstrap',
													type: 'info',
													nonblock: true,
													sticker: false,
													icon: 'icon-twitter'
												});
											});
										}
									],
									error: [
										function(data, textStatus, jqXHR) {
											var url = data.responseJSON.full_url;
											me.shareInput.val(url);
											me.shareUrlButton.attr({
												'href': url
											}).removeClass('disabled');
											me.shareInput.select();
											twttr.widgets.createShareButton(
													url,
													me.shareTwitterBtn[0],
													function(element) {
														// Any callbacks that may be needed
													},
													{
														hashtags: 'USGS_CCH',
														lang: 'en',
														size: 'large',
														text: 'Check out my CCH View!',
														count: 'none'
													});

											twttr.events.bind('tweet', function(event) {
												$.pnotify({
													text: 'Your view has been tweeted. Thank you.',
													styling: 'bootstrap',
													type: 'info',
													nonblock: true,
													sticker: false,
													icon: 'icon-twitter'
												});
											});
										}
									]
								}
							});
						}
					],
					error: [
						function(data, textStatus, jqXHR) {
							$('#shareModal').modal('hide');
							$.pnotify({
								text: 'We apologize, but we could not create a share url for this session!',
								styling: 'bootstrap',
								type: 'error',
								nonblock: true,
								sticker: false,
								icon: 'icon-warning-sign'
							});
						}
					]
				}
			});
		},
		displayLoadingError: function(args) {
			var continueLink = $('<a />').attr({
				'href': CCH.CONFIG.contextPath,
				'role': 'button'
			}).addClass('btn btn-large').html('<i class="icon-refresh"></i> Click to continue')

			var emailLink = $('<a />').attr({
				'href': args.mailTo,
				'role': 'button'
			}).addClass('btn btn-large').html('<i class="icon-envelope"></i> Contact Us');

			splashUpdate(args.splashMessage);
			$('#splash-status-update').append(continueLink);
			$('#splash-status-update').append(emailLink);
			$('#splash-spinner').fadeOut(2000);
		}
	});
};