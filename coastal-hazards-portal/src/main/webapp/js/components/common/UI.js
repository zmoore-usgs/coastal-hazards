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
	me.currentSizing = '';
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
			me.bindNavbarPinMenu();
			me.bindWindowResize();
			
			// Header fix
			me.ccsArea.find('br').first().remove();

			var currWidth = me.previousWidth;
			if (currWidth <= me.magicResizeNumber) {
				me.currentSizing = 'small';
			} else if (currWidth > me.magicResizeNumber) {
				me.currentSizing = 'large';
			}

			$(window).on({
				'cch.data.items.loaded': function(evt) {
					CCH.Slideshow.createSlideshow();
				}
			});
			$(window).trigger('cch.ui.initialized');
			$(window).resize();
			return me;
		},
		bindNavbarPinMenu: function() {
			me.navbarPinButton.on('click', function() {
				// Check to see if any cards are pinned
				var pinnedCardIds = CCH.session.getPinnedItemIds();
				var items = null;

				if (pinnedCardIds.length) {
					// Toggle how the button looks
					me.me.navbarPinDropdownButton.toggleClass('muted');
					me.navbarPinButton.toggleClass('slider-card-pinned');

					// Check if button is active
					if (!me.me.navbarPinDropdownButton.hasClass('muted')) {
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
				CCH.Slideshow.createSlideshow({
					items: items
				});

				$(window).trigger('cch.navbar.pinmenu.button.pin.click');
			});

			me.navbarClearMenuItem.on('click', function() {
				$(window).trigger('cch.navbar.pinmenu.item.clear.click');
				CCH.Slideshow.createSlideshow();
			});
		},
		bindWindowResize: function() {
			$(window).resize(function() {
				var currWidth = $(window).width();
				var contentRowHeight = $(window).height() - me.headerRow.height() - me.footerRow.height();

				if (contentRowHeight < me.minimumHeight) {
					contentRowHeight = me.minimumHeight;
				}

				var updated = false;
				if (me.previousWidth > me.magicResizeNumber && currWidth <= me.magicResizeNumber) {
					CCH.LOG.debug('resize-small');
					me.currentSizing = 'small';
					updated = true;
				} else if (me.previousWidth <= me.magicResizeNumber && currWidth > me.magicResizeNumber) {
					CCH.LOG.debug('resize-large');
					me.currentSizing = 'large';
					updated = true;
				}

				if (me.currentSizing === 'small') {
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

				} else if (me.currentSizing === 'large') {
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

				if (updated) {
					$(window).trigger('cch.ui.resized', me.currentSizing);
					CCH.Slideshow.createSlideshow();
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
				})

				me.previousWidth = currWidth;
			});
		}
	});
};