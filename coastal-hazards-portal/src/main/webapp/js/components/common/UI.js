var CCH = CCH || {};
CCH.Objects.UI = function(args) {
	CCH.LOG.info('UI.js::constructor: UI class is initializing.');
	var me = (this === window) ? {} : this;
	me.search;
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
	me.itemSearchModalWindow = args.itemSearchModalWindow;
	me.ccsArea = args.ccsArea;

	CCH.LOG.debug('UI.js::constructor: UI class initialized.');
	return $.extend(me, {
		init: function() {
			// Bindings
			$(window).on('resize', me.windowResizeHandler);
			me.navbarPinButton.on('click', me.navbarMenuClickHandler);
			me.navbarClearMenuItem.on('click', me.navbarClearItemClickHandler);

			// Header fix
			me.ccsArea.find('br').first().remove();

			$(window).trigger('cch.ui.initialized');
			$(window).resize();
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
			$(window).trigger('cch.navbar.pinmenu.button.pin.click', {
				items : items
			});
		},
		navbarClearItemClickHandler: function() {
			$(window).trigger('cch.navbar.pinmenu.item.clear.click');
		},
		windowResizeHandler: function(evt) {
			var currWidth = $(window).width();
			var currentSizing = me.getCurrentSizing();
			var contentRowHeight = $(window).height() - me.headerRow.height() - me.footerRow.height();
			contentRowHeight = contentRowHeight < me.minimumHeight ? me.minimumHeight : contentRowHeight;

			if (currentSizing === 'small') {
				$('body').css({
					'padding-left': '0px',
					'padding-right': '0px'
				});
				me.applicationContainer.css({
					'padding-left': '0px',
					'padding-right': '0px'
				});
				var descriptionHeight = Math.round(contentRowHeight * .30);
				if (descriptionHeight < 280) {
					descriptionHeight = 280;
				}
				me.descriptionDiv.height(descriptionHeight);
				me.mapdiv.height(contentRowHeight - descriptionHeight);

			} else if (currentSizing === 'large') {
				$('body').css({
					'padding-left': '20px',
					'padding-right': '20px'
				});
				me.applicationContainer.css({
					'padding-left': '20px',
					'padding-right': '20px'
				});
				me.mapdiv.height(contentRowHeight);
				me.descriptionDiv.height(contentRowHeight);
			}

			// Check if the application was resized. If so, re-initialize the slideshow to easily
			// fit into the new layout
			if ((me.previousWidth > me.magicResizeNumber && currWidth <= me.magicResizeNumber) ||
					(me.previousWidth <= me.magicResizeNumber && currWidth > me.magicResizeNumber)) {
				$(window).trigger('cch.ui.resized', currentSizing);
			}

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
			$('#application-overlay').fadeOut(2000, function() {
				$('#application-overlay').remove();
				splashUpdate = undefined;
			});
		},
		getCurrentSizing: function() {
			// Bootstrap decides when to flip the application view based on 
			// a specific width. 767px seems to be the point 
			// https://github.com/twitter/bootstrap/blob/master/less/responsive-767px-max.less
			var currWidth = me.previousWidth;
			var currentSizing;
			if (currWidth <= me.magicResizeNumber) {
				currentSizing = 'small';
			} else if (currWidth > me.magicResizeNumber) {
				currentSizing = 'large';
			}
			return currentSizing;
		}
	});
};