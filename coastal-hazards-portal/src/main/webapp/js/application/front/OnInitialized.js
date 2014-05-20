/*global CCH*/
/*global splashUpdate*/
/*global OpenLayers*/
/*global alertify*/
window.CCH = CCH || {};
CCH.CONFIG = CCH.CONFIG || {};

/**
 * Loads the top-level item for the entire portal
 * 
 * @param {type} args
 * @returns {undefined}
 */
CCH.CONFIG.loadUberItem = function (args) {
	"use strict";
	args = args || {};

	var zoomToBbox = args.zoomToBbox === true ? true : false,
		returningVisitor = document.referrer.toLowerCase().indexOf('info/item') !== -1,
		cookie = $.cookie(CCH.session.cookieName),
		// Do I load the entire item with all its children? 
		subtree = args.subtree || false,
		callbacks = args.callbacks || {
			success: [],
			error: []
		};

	// If the user is coming from the back of the card, shortcut to not zoom to a bounding box because
	// the user wants to maintain their zoom level from when they left
	if (returningVisitor && cookie !== undefined && cookie.bbox !== undefined && cookie.bbox.length === 4) {
		zoomToBbox = false;
	}

	callbacks.error.unshift(CCH.ui.errorResponseHandler);
	callbacks.success.unshift(function (data) {
		if (zoomToBbox) {
			CCH.map.zoomToBoundingBox({
				bbox: data.bbox,
				fromProjection: new OpenLayers.Projection('EPSG:4326')
			});
		}

		$(window).on('cch.item.loaded', function (evt, obj) {
			var item;

			// If the incoming item is the uber item, that means that by now, everything under it has been
			// fully hydrated, so I can now add sub items to the accordion and remove the overlay
			if (obj.id === 'uber') {
				data.children.each(function (id, index) {
					item = CCH.items.getById({id: id});
					// Add it to the accordion...
					CCH.ui.accordion.addCard({
						item: item,
						index: index
					});
					item = CCH.items.getById({id: id});
				});

				$(window).trigger('cch.item.loaded.all');
				splashUpdate("Starting Application...");
				CCH.ui.removeOverlay();
				$(window).resize();
				$(window).off('cch.app.initialized', CCH.CONFIG.onAppInitialize); // Remove handler
				delete CCH.CONFIG.onAppInitialize; // no longer needed

			}
		});

		new CCH.Objects.Item(data).loadFromData(data);
	});

	new CCH.Util.Search().submitItemSearch({
		item: 'uber',
		subtree: subtree,
		callbacks: {
			'success': callbacks.success,
			'error': callbacks.error
		}
	});
};

CCH.CONFIG.onAppInitialize = function () {
	"use strict";
	//Begins the item loading process based on how the user is entering the application
	var type = (CCH.CONFIG.params.type + String()).toLowerCase(),
		id = CCH.CONFIG.params.id,
		cookieItems = CCH.session.getItems();

	splashUpdate('Loading Application...');

	// Populate the UI with incoming data
	// Decide how to load the application. 
	// Depending on the 'idType' string, the application can be loaded either through:
	// 'ITEM' = Load a single item from the database
	// 'VIEW' = Load a session which can have zero, one or more items
	// '' = Load the application normally through the uber item
	// 
	// Most of the application is now initialized, so I'm going to try and load
	// either one item, a view or all top level items. First I check if idType exists
	if (type) {
		// User is coming in with either an item or a view, check which
		if (type === 'view') {
			splashUpdate("Loading View...");

			// Begin by trying to load the session from the incoming url
			CCH.session.load({
				sid: CCH.CONFIG.params.id,
				callbacks: {
					success: [
						function (session) {
							var items = CCH.session.getSession().items;

							CCH.ui.addItemsToBucketOnLoad(items);

							CCH.CONFIG.loadUberItem({
								zoomToBbox: false,
								subtree: true
							});

							CCH.map.zoomToBoundingBox({
								'bbox': session.bbox,
								'fromProjection': new OpenLayers.Projection('EPSG:4326')
							});
						}
					],
					error: [
						function () {
							// The session couldn't be loaded for whatever reason
							// so just load the top level item and move forward
							CCH.CONFIG.loadUberItem({
								zoomToBbox: true,
								subtree: true,
								callbacks: {
									success: [
										function () {
											alertify.error('The Coastal Change Hazards Portal could not find your session.', 6000);
										}
									]
								}
							});
						}
					]
				}
			});
		} else if (type === 'item') {
			// User is coming in with an item, so load that item
			$(window).on('cch.item.loaded.all', function (evt) {
				if (evt.namespace === 'all.item.loaded') {
					var item = CCH.items.getById({id: id});
					if (item) {
						// I want to zoom to the bounding box of the item
						CCH.map.zoomToBoundingBox({
							bbox: item.bbox,
							fromProjection: new OpenLayers.Projection('EPSG:4326')
						});

						// And I want to open the accordion to that item
						$(window).trigger('cch.slide.search.button.click.explore', {
							id: id
						});
					}
				}
			});

			CCH.ui.addItemsToBucketOnLoad(cookieItems);

			CCH.CONFIG.loadUberItem({
				subtree: true,
				zoomToBbox: false
			});
		}
	} else {
		// The user is initially loading the application. I do not have any items or views
		// to load, nor do I have any session to load, so just start with the top level item
		CCH.ui.addItemsToBucketOnLoad(cookieItems);

		CCH.CONFIG.loadUberItem({
			subtree: true,
			zoomToBbox: true
		});
	}
};

$(window).on('cch.app.initialized', CCH.CONFIG.onAppInitialize);