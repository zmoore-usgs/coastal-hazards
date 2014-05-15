/*jslint browser: true */
/*jslint plusplus: true */
/*global $ */
/*global CCH */
/*global twttr */
/*global splashUpdate */
/*global OpenLayers */
/*global alertify */
/*global ga */

/**
 *  Central control object for the user interface
 * 
 * @param {shareType} args
 * @returns {CCH.Objects.UI.Anonym$22}
 */
CCH.Objects.Front.UI = function (args) {
	"use strict";
	CCH.LOG.info('UI.js::constructor: UI class is initializing.');

	var me = (this === window) ? {} : this,
		removeMarkers = function () {
			CCH.map.clearBoundingBoxMarkers();
			$(window).off('cch-map-bbox-marker-added', removeMarkers);
		};

	me.APPLICATION_CONTAINER = $('#application-container');
	me.APPLICATION_OVERLAY_ID = args.applicationOverlayId || 'application-overlay';
	me.HEADER_ROW_ID = args.headerRowId || 'header-row';
	me.FOOTER_ROW_ID = args.footerRowId || 'footer-row';
	me.CONTENT_ROW_ID = args.contentRowId || 'content-row';
	me.MAP_DIV_ID = args.mapdivId || 'map';
	me.SLIDE_CONTAINER_DIV_ID = args.slideContainerDivId || 'application-slide-items-content-container';
	me.SHARE_MODAL_ID = args.shareModalId || 'modal-content-share';
	me.SHARE_URL_BUTTON_ID = args.shareUrlButtonId || 'modal-share-summary-url-button';
	me.SHARE_INPUT_ID = args.shareInputId || 'modal-share-summary-url-inputbox';
	me.SHARE_TWITTER_BUTTON_ID = args.shareTwitterBtnId || 'multi-card-twitter-button';
	me.ITEMS_SLIDE_CONTAINER_ID = args.slideItemsContainerId || 'application-slide-items-container';
	me.BUCKET_SLIDE_CONTAINER_ID = args.slideBucketContainerId || 'application-slide-bucket-container';
	me.SEARCH_SLIDE_CONTAINER_ID = args.slideSearchContainerId || 'application-slide-search-container';
	me.$NAVBAR_BUCKET_CONTAINER = $('#app-navbar-bucket-button-container');
	me.$NAVBAR_HELP_CONTAINER = $('#app-navbar-help-container');
	me.minimumHeight = args.minimumHeight || 480;
	me.previousWidth = $(window).width();
	me.magicResizeNumber = 992;
	me.isSmall = function () {
		// Bootstrap decides when to flip the application view based on 
		// a specific width. 992 seems to be the point 
		return $(window).outerWidth() < me.magicResizeNumber;
	};
	me.previouslySmall = me.isSmall();
	me.bucketSlide = new CCH.Objects.Widget.BucketSlide({
		containerId: me.BUCKET_SLIDE_CONTAINER_ID,
		mapdivId: me.MAP_DIV_ID,
		isSmall: me.isSmall
	});
	me.bucket = new CCH.Objects.Bucket({
		slide: me.bucketSlide
	});
	me.itemsSlide = new CCH.Objects.ItemsSlide({
		containerId: me.ITEMS_SLIDE_CONTAINER_ID,
		mapdivId: me.MAP_DIV_ID,
		headerRowId: me.HEADER_ROW_ID,
		footerRowId: me.FOOTER_ROW_ID,
		isSmall: me.isSmall,
		bucket: me.bucket
	});
	me.searchSlide = new CCH.Objects.SearchSlide({
		containerId: me.SEARCH_SLIDE_CONTAINER_ID,
		isSmall: me.isSmall,
		bucket: me.bucket
	});
	me.accordion = new CCH.Objects.Widget.Accordion({
		containerId: me.SLIDE_CONTAINER_DIV_ID
	});
	me.combinedSearch = new CCH.Objects.CombinedSearch();

	// This object holds the legend items that are currently viewed
	me.legends = {
		// May hold one or more legend items based on what card is currently open in the accordion. Usually this
		// will only hold one card but because a card may emit an open event before the other one emits a close
		// event, this object may hold two objects momentarily. No big deal.
		card: {},
		// May hold one or more legend items based on what items are currently being viewed in the bucket
		bucket: {}
	};

	me.itemsSearchedHandler = function (evt, data) {
		if (data.items) {
			CCH.LOG.info('UI:: Items found: ' + data.items.length);
		}
	};

	me.locationsSearchedHandler = function (evt, data) {
		if (data.items) {
			CCH.LOG.info('UI:: Locations found: ' + data.items.length);
		}
	};

	me.windowResizeHandler = function () {
		var isSmall = me.isSmall(),
			$headerRow = $('#' + me.HEADER_ROW_ID),
			$footerRow = $('#' + me.FOOTER_ROW_ID),
			$contentRow = $('#' + me.CONTENT_ROW_ID),
			$titleContainer = $headerRow.find('> div:nth-child(2)'),
			$titleContainerSiblings,
			titleContainerSiblingsWidth = 0,
			headerHeight = $headerRow.outerHeight(true),
			footerHeight = $footerRow.outerHeight(true),
			tHeight,
			contentRowHeight;

		$(window).trigger('cch.ui.resizing', isSmall);

		// Check if the application was resized. If so, re-initialize the slideshow to easily
		// fit into the new layout
		if (isSmall !== me.previouslySmall) {
			CCH.LOG.debug('UI:: Redimensioned To ' + isSmall ? ' Small' : ' Large');
			$(window).trigger('cch.ui.redimensioned', isSmall);
		}

		contentRowHeight = contentRowHeight < me.minimumHeight ? me.minimumHeight : $('body').outerHeight(true) - (headerHeight + footerHeight);

		// This is an issue that happens with IE9. I've still not figured out why
		// but the height numbers seem to switch. It's probably an IE9 event
		// handling timing issue
		if (footerHeight > contentRowHeight) {
			tHeight = contentRowHeight;
			contentRowHeight = footerHeight;
			footerHeight = tHeight;
		}

		if (isSmall) {
			contentRowHeight += footerHeight;
			$titleContainerSiblings = $headerRow.find('>:not(:nth-child(2)):not(.modal)');
			$titleContainerSiblings.each(function (ind, obj) {
				titleContainerSiblingsWidth += $(obj).outerWidth();
			});
			$titleContainer.css('width', ($headerRow.innerWidth() - titleContainerSiblingsWidth - 25) + 'px');
		} else {
			$titleContainer.css('width', '');
		}

		$contentRow.height(contentRowHeight - 1);

		$(window).trigger('cch.ui.resized', isSmall);

		me.previouslySmall = isSmall;
	};

	me.displayShareModal = function (url) {
		CCH.Util.Util.getMinifiedEndpoint({
			location: url,
			callbacks: {
				success: [
					function (json) {
						var minifiedUrl = json.tinyUrl,
							shareInput = $('#' + me.SHARE_INPUT_ID);

						shareInput.val(minifiedUrl);
						$('#' + me.SHARE_URL_BUTTON_ID).attr({
							'href': minifiedUrl
						}).removeClass('disabled');
						shareInput.select();
						twttr.widgets.createShareButton(
							minifiedUrl,
							$('#' + me.SHARE_TWITTER_BUTTON_ID)[0],
							function (element) {
								// Any callbacks that may be needed
							},
							{
								hashtags: 'USGS_CCH',
								lang: 'en',
								size: 'large',
								text: 'Check out my CCH View!',
								count: 'none'
							}
						);
						$('#' + me.SHARE_MODAL_ID).modal('show');
						twttr.events.bind('tweet', function () {
							alertify.log('Your view has been tweeted. Thank you.');
						});
					}
				],
				error: [
					function (data) {
						var fullUrl = data.responseJSON.full_url,
							shareInput = $('#' + me.SHARE_INPUT_ID);
						shareInput.val(fullUrl);
						$('#' + me.SHARE_URL_BUTTON_ID).attr({
							'href': fullUrl
						}).removeClass('disabled');
						shareInput.select();
						twttr.widgets.createShareButton(
							fullUrl,
							$('#' + me.SHARE_TWITTER_BUTTON_ID)[0],
							function () {
								// Any callbacks that may be needed
							},
							{
								hashtags: 'USGS_CCH',
								lang: 'en',
								size: 'large',
								text: 'Check out my CCH View!',
								count: 'none'
							}
						);
						$('#' + me.SHARE_MODAL_ID).modal('show');
						twttr.events.bind('tweet', function () {
							alertify.log('Your view has been tweeted. Thank you.');
						});
					}
				]
			}
		});
	};

	me.sharemodalDisplayHandler = function (evt, args) {
		$('#' + me.SHARE_URL_BUTTON_ID).addClass('disabled');
		$('#' + me.SHARE_INPUT_ID).val('');
		$('#' + me.SHARE_TWITTER_BUTTON_ID).empty();

		args = args || {};

		var shareType = args.type,
			shareId = args.id,
			session;

		if (shareType === 'session') {
			// A user has clicked on the share menu item. A session needs to be 
			// created and a token retrieved...
			session = CCH.session;
			session.writeSession({
				callbacks: {
					success: [
						function (json) {
							var sid = json.sid,
								shareUrl = CCH.CONFIG.publicUrl + '/ui/view/' + sid;

							me.displayShareModal(shareUrl);
						}
					],
					error: [
						function () {
							$('#' + me.SHARE_MODAL_ID).modal('hide');
							alertify.error('We apologize, but we could not create a share url for this session.', 2000);
						}
					]
				}
			});
		} else if (shareType === 'item') {
			me.displayShareModal(CCH.CONFIG.publicUrl + '/ui/item/' + shareId);
		}
	};

	me.removeOverlay = function () {
		// Make sure that the overlay is still around
		if ($('#' + me.APPLICATION_OVERLAY_ID).length) {
			splashUpdate("Starting Application...");

			var applicationOverlay = $('#' + me.APPLICATION_OVERLAY_ID);

			$(window).resize();

			// Get rid of the overlay and clean it up out of memory and DOM
			applicationOverlay.fadeOut(2000, function () {
				applicationOverlay.remove();
				$(window).trigger('cch.ui.overlay.removed');
			});
		}

	};

	me.displayLoadingError = function (args) {
		args = args || {};

		var errorThrown = args.errorThrown,
			mailTo = args.mailTo || 'mailto:' + CCH.CONFIG.emailLink +
			'?subject=Application Failed To Load Item (URL: '
			+ window.location.toString() + ' Error: ' + errorThrown + ')',
			splashMessage = args.splashMessage,
			status = args.status,
			continueLink = $('<a />').attr({
			'href': CCH.CONFIG.contextPath,
			'role': 'button'
		}).addClass('btn btn-lg').html('<i class="fa fa-refresh"></i> Click to continue'),
			emailLink = $('<a />').attr({
			'href': mailTo,
			'role': 'button'
		}).addClass('btn btn-lg').html('<i class="fa fa-envelope"></i> Contact Us');

		ga('send', 'event', {
			'eventCategory': 'loadingError',
			'eventAction': 'error',
			'eventLabel': errorThrown
		});

		if (!splashMessage) {
			switch (status) {
				case 404:
					splashMessage = '<b>Item Not Found</b><br /><div>There was a problem loading information.' +
						'We could not find information needed to continue loading the Coastal Change Hazards Portal. ' +
						'Either try to reload the application or let us know.</div>';
					break;
			}
		}

		$('#splash-status-update').
			empty().
			addClass('error-message').
			append(splashMessage, $('<span />').append(continueLink), emailLink);
		$('#splash-spinner').remove();
	};

	me.errorResponseHandler = function (jqXHR, textStatus, errorThrown) {
		CCH.ui.displayLoadingError({
			errorThrown: errorThrown,
			status: jqXHR.status,
			textStatus: textStatus
		});
	};

	me.addItemsToBucketOnLoad = function (items) {
		items = items || [];
		// Wait for each item in the session to be loaded 
		// before adding it to the bucket
		items.each(function (item) {
			var loadedHandler = function (evt, args) {
				var loadedItemId = args.id,
					sessionItems = CCH.session.getSession().items,
					addIndex = sessionItems.findIndex(function (i) {
						return i.itemId === args.id;
					}),
					sessionItem = sessionItems[addIndex],
					itemById = CCH.items.getById({
						id: loadedItemId
					});

				// The following is done to add the items to the bucket and 
				// bucket slider in a specific order
				itemById.addAtIndex = addIndex;
				me.bucket.add({
					item: itemById,
					visibility: sessionItem.visible
				});
				me.bucket.bucket = me.bucket.getItems().sortBy(function (i) {
					return i.addAtIndex;
				});
				me.bucketSlide.cards = me.bucketSlide.cards.sort(function (card) {
					return me.bucket.getItemById($(card).data('id')).addAtIndex || -1;
				});
				me.bucketSlide.rebuild();
			};
			$(window).on('cch.item.loaded', function (evt, args) {
				if (args.id === item.itemId) {
					$(window).off('cch.item.loaded', loadedHandler);
					loadedHandler(evt, args);
				}
			});
		});
	};

	me.bucketClosing = function () {
		CCH.map.hideAllLayers();
		me.accordion.showCurrent();
	};
	
	me.bucketOpening = function () {
		
	};

	/**
	 * When a card is opened in the UI, create the legend 
	 * @param {type} evt
	 * @param {type} args
	 * @returns {undefined}
	 */
	me.cardDisplayed = function (evt, args) {
		var item = args.item,
			display = args.display;

		// Card is being opened. There may be a legend to show
		if (display) {
			// A new card is being opened. Remove all other legends
			Object.values(me.legends.card).each(function(legend) {
				legend.destroy();
			});
			
			// I want to show a legend if either the item is a data item or an aggregation with visible children
			// otherwise nothing is going to be shown 
			if (item.getLayerList().layers.length > 0) {
				me.legends.card[item.id] = new CCH.Objects.Widget.Legend({
					containerId: 'cchMapLegendInnerContainer',
					item: item
				}).init();
			}
			
			// If legends are available, show the legend, otherwise hide it
			if (Object.keys(me.legends.card).length > 0) {
				CCH.map.showLegend();
			} else {
				CCH.map.hideLegend();
			}
		} else {
			// I need to remove this legend from my map of legends and the legend container
			if (me.legends.card[item.id]) {
				me.legends.card[item.id].destroy();
				delete me.legends.card[item.id];
			}
			
			// Because closing this card doesn't re-trigger an 'open' event of its parent card (if there is one),
			// I have to re-trigger the event if the card has a parent with layers available (unless it's uber)
			if (item.parent.id !== 'uber' && item.parent &&  item.parent.getLayerList().layers.length > 0) {
				me.cardDisplayed(null, {
					item : item.parent,
					display : true
				});
			}
			
			if (Object.keys(me.legends.card).length === 0) {
				CCH.map.hideLegend();
			}
		}
	};

	// Do Bindings
	$(window).on({
		'cch.data.items.searched': me.itemsSearchedHandler,
		'cch.data.locations.searched': me.locationsSearchedHandler,
		'slide.bucket.button.click.share': me.sharemodalDisplayHandler,
		'cch.slide.bucket.closing': me.bucketClosing,
		'cch.slide.bucket.opening': me.bucketOpening,
		'cch.card.display.toggle': me.cardDisplayed,
		'resize': function () {
			setTimeout(function () {
				me.windowResizeHandler();
			}, 1);
		}
	});

	$(me.combinedSearch).on({
		'combined-searchbar-search-performed': function (evt, args) {
			var dispResults = function () {
				$(window).off('cch.slide.search.closed', dispResults);
				me.searchSlide.displaySearchResults(args);
			};

			if (!me.searchSlide.isClosed && !me.searchSlide.isClosing) {
				$(window).on('cch.slide.search.closed', dispResults);
				me.searchSlide.close({
					clearOnClose: false
				});
			} else {
				dispResults();
			}
		}
	});

	$(window).trigger('cch.ui.initialized');

	CCH.LOG.debug('UI.js::constructor: UI class initialized.');

	return $.extend(me, {
		removeOverlay: me.removeOverlay,
		isSmall: me.isSmall,
		displayLoadingError: me.displayLoadingError,
		itemsSlide: me.itemsSlide,
		bucketSlide: me.bucketSlide,
		searchSlide: me.searchSlide,
		bucket: me.bucket,
		share: me.share,
		accordion: me.accordion,
		errorResponseHandler: me.errorResponseHandler,
		addItemsToBucketOnLoad: me.addItemsToBucketOnLoad,
		CLASS_NAME: 'CCH.Objects.UI'
	});
};