/*global CCH*/
/*global splashUpdate*/
/*global alertify*/
/*global ga*/
window.CCH = CCH || {};
CCH.CONFIG = CCH.CONFIG || {};

/**
 * Loads the top-level item for the entire portal
 * 
 * @param {viewType} args
 * @returns {undefined}
 */
CCH.CONFIG.loadUberItem = function (args) {
	"use strict";
	args = args || {};

	// Will the application zoom to the bounding box of uber? 
	var zoomToUberBbox = args.zoomToUberBbox === true ? true : false,
		// This will override the zoomToUberBbox setting 
		overridePreviousBounds = args.overridePreviousBounds,
		// Do I load the entire item with all its children? 
		subtree = args.subtree || false,
		callbacks = {};
		
	$.extend(true, callbacks, args.callbacks, {
		success: [],
		error: []
	});

	if (callbacks.error) {
		callbacks.error.unshift(CCH.ui.errorResponseHandler);
	}
	
	callbacks.success.unshift(function (data) {
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

				var resizeHandler = function () {
					// Unbind this one-time function
					$(window).off('cch.ui.resized', resizeHandler);
					// Is the user coming in from another part of the application?
					if (CCH.session.getSession().center && !overridePreviousBounds) {
						// This gets set in the cookie when visitors click 'back to portal' from back of card or info page
						CCH.map.updateFromSession();
					} else if (zoomToUberBbox) {
						CCH.map.zoomToBoundingBox({
							bbox: data.bbox,
							fromProjection: CCH.CONFIG.map.modelProjection,
							attemptClosest : true
						});
					} else {
						// User is loading the app fresh and we want to zoom to the 
						// lower 48 (or get as close as possible). The OL docs mention
						// that setting the second argument to true (getting as close
						// as possible) may be problematic though I have not seen
						// this to be the case so I am leaving it for now.
						CCH.map.getMap().zoomToExtent(CCH.map.initialExtent, true);
					}
				};
				$(window).on('cch.ui.resized', resizeHandler);
				$(window).resize();
				$(window).trigger('cch.item.loaded.all');
				splashUpdate("Starting Application...");
				CCH.ui.removeOverlay();
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
	var viewType = (CCH.CONFIG.params.type + String()).toLowerCase(),
		id = CCH.CONFIG.params.id,
		sessionItems = CCH.session.getSession().items;

	// Populate the UI with incoming data
	// Decide how to load the application. 
	// Depending on the 'idType' string, the application can be loaded either through:
	// 'ITEM' = Load a single item from the database
	// 'VIEW' = Load a session which can have zero, one or more items
	// '' = Load the application normally through the uber item
	// 
	// Most of the application is now initialized, so I'm going to try and load
	// either one item, a view or all top level items. First I check if idType exists
	if (viewType) {
		// User is coming in with either an item or a view, check which
		if (viewType === 'view') {
			// Begin by trying to load the session from the incoming url
			CCH.session.load({
				sid: CCH.CONFIG.params.id,
				callbacks: {
					success: [
						function (session) {
							var items = CCH.session.getSession().items;

							var resizeHandler = function () {
								$(window).off('cch.ui.resized', resizeHandler);

								CCH.map.zoomToBoundingBox({
									'bbox': session.bbox,
									'fromProjection': CCH.CONFIG.map.modelProjection
								});
							};
							$(window).on('cch.ui.resized', resizeHandler);
							$(window).on('cch.ui.overlay.removed', function () {
								// User is coming in with a view (from a shared bucket)
								// so open the bucket when the app is finished loading.
								// Only do this if bucket has items in it
								// 
								// The bucket SVG may or may not be loaded by the time
								// I am at this point in the code. 
								var openBucketFunction = function () {
									if (CCH.ui.bucket.getCount() !== 0) {
										CCH.ui.bucketSlide.open();
									}
								};
								
								if (CCH.ui.bucket.bucketSVG) {
									openBucketFunction();
								} else {
									$(document).on(CCH.ui.bucket.bucketLoadEvent, openBucketFunction);
								}
								
							});
							
							CCH.ui.addItemsToBucketOnLoad(items);

							CCH.CONFIG.loadUberItem({
								zoomToUberBbox: false,
								subtree: true,
								overridePreviousBbox: true
							});
						}
					],
					error: [
						function () {
							// The session couldn't be loaded for whatever reason
							// so just load the top level item and move forward
							CCH.CONFIG.loadUberItem({
								zoomToUberBbox: true,
								subtree: true,
								overridePreviousBbox: false,
								callbacks: {
									success: [
										function () {
											alertify.error('The Coastal Change Hazards Portal could not find your session.', 6000);
										}
									]
								}
							});

							ga('send', 'exception', {
								'exDescription': 'ViewNotFound',
								'exFatal': false
							});
						}
					]
				}
			});

			ga('send', 'event', {
				'eventCategory': 'load',
				'eventAction': 'loadView',
				'eventLabel': '"' + CCH.CONFIG.params.id + '"'
			});
			
		} else if (viewType === 'item') {
			// User is coming in with an item, so load that item
			$(window).on('cch.item.loaded.all', function (evt) {
				if (evt.namespace === 'all.item.loaded') {
					var item = CCH.items.getById({id: id});
					if (item) {
						// All items have been loaded and my item exists. Show my item in the accordion.
						$(window).trigger('cch.slide.search.button.click.explore', {
							id: id
						});

						// Triggering the explore click above also triggers the basket slider to close. When 
						// the basket slider closes, it may hide all the layers though through testing, sometimes
						// it doesn't. It looks like a timing issue. Adding this hack here ensure that the layer 
						// the user came to see shows up
						CCH.items.getById({id: id}).showLayer();
						
						$(window).on('cch.ui.resized', function () {
							CCH.map.zoomToBoundingBox({
								'bbox': CCH.items.getById({ id : id }).bbox,
								'fromProjection': CCH.CONFIG.map.modelProjection.projCode
							});
						});
					} else {
						// The item could not be found. Show an error and wait for the app to resize
						// (happens on loading completetion). When it happens, zoom to the bounding
						// box of the map's initial extent (the continentat US) and then unbind the handler
						alertify.error('The item you\'re looking for could not be found.', 6000);
						var resizeHandler = function () {
							$(window).off('cch.ui.resized', resizeHandler);
							CCH.map.getMap().zoomToExtent(CCH.map.getMap().initialExtent);
						};
						$(window).on('cch.ui.resized', resizeHandler);
						ga('send', 'exception', {
							'exDescription': 'ItemNotFound',
							'exFatal': false
						});

					}
				}
			});

			CCH.ui.addItemsToBucketOnLoad(sessionItems);

			CCH.CONFIG.loadUberItem({
				subtree: true,
				zoomToUberBbox: true,
				overridePreviousBounds: false
			});

			ga('send', 'event', {
				'eventCategory': 'load',
				'eventAction': 'loadItem',
				'eventLabel': '"' + id + '"'
			});
		}
	} else {
		// The user is not coming in from a view and is not viewing an item.
		CCH.ui.addItemsToBucketOnLoad(sessionItems);
		
		// The user is initially loading the application. I do not have any items or views
		// to load, nor do I have any session to load, so just start with the top level item
		// and no pre-defined zoom level
		var doNotUsePreviousBounds = true;
		
		if (CCH.CONFIG.referer.indexOf("/info") !== -1) {
			// The user is coming in from the info page so it is possible that they
			// have a bounding box in their cache. If so, jump to that. 
			// If there isn't anything in the session, uber bbox will be used anyway
			doNotUsePreviousBounds = false;
		}
		
		CCH.CONFIG.loadUberItem({
			subtree: true,
			zoomToUberBbox: true,
			overridePreviousBounds: doNotUsePreviousBounds
		});

		ga('send', 'event', {
			'eventCategory': 'load',
			'eventAction': 'loadDefault'
		});
	}
};

$(window).on('cch.app.initialized', CCH.CONFIG.onAppInitialize);