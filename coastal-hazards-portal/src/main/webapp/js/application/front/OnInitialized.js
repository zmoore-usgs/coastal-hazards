/*global CCH*/
/*global alertify*/
/*global ga*/
window.CCH = (window.CCH === undefined) ? {} : window.CCH;
CCH.CONFIG = CCH.CONFIG || {};

(function () {
	"use strict";

	// Loads the top-level item for the entire portal
	var loadUberItem = function (args) {
		args = args || {};

		// Will the application zoom to the bounding box of uber? 
		var zoomToUberBbox = args.zoomToUberBbox === true ? true : false,
			// This will override the zoomToUberBbox setting 
			overridePreviousBounds = args.overridePreviousBounds,
			search = CCH.Util.Search().submitItemSearch({
				item: 'uber',
				subtree: args.subtree,
				timestamp: new Date().getTime()
			}),
				searchSuccessHandler = function (data) {
					$(window).on('cch.item.loaded', function (evt, obj) {
						
						CCH.LOG.trace("Loaded " + obj.id);
						
						// If the incoming item is the uber item, that means that by now, everything under it has been
						// fully hydrated, so I can now add sub items to the accordion and remove the overlay.
						// I can also now load and attach item aliases
						if (obj.id === 'uber') {
							data.children.each(function (id, index) {
								var item = CCH.items.getById({id: id});

								// Add it to the accordion...
								CCH.ui.accordion.addCard({
									item: item,
									index: index
								});
								item = CCH.items.getById({id: id});
							});

							var resizeHandler = function () {
								// Is the user coming in from another part of the application?
								if (CCH.session.getSession().center && !overridePreviousBounds) {
									// This gets set in the cookie when visitors click 'back to portal' from back of card or info page
									CCH.map.updateFromSession();
								} else if (zoomToUberBbox) {
									CCH.map.zoomToBoundingBox({
										bbox: data.bbox,
										fromProjection: CCH.CONFIG.map.modelProjection,
										attemptClosest: true
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
							
							//Load aliases and assign them to items
							CCH.Util.Search().getAllAliases({
								callbacks: {
									success: [function(data) {
										data.each(function(alias, index) {
											if(alias.item_id != null && CCH.items.getById({id: alias.item_id}) != null){
												CCH.items.getById({id: alias.item_id}).aliases.push(alias.id);
											}
										});
										
										$(window).one('cch.ui.resized', resizeHandler);
										$(window).trigger('cch.loaded.uber');
										CCH.splashUpdate("Working...");
										CCH.ui.removeOverlay();
										$(window).resize();
									}],
									error: [
										CCH.ui.errorResponseHandler
									]
								}
							});
						}
					});

					new CCH.Objects.Item(data).loadFromData(data);
				};

		return search.then(searchSuccessHandler, CCH.ui.errorResponseHandler);
	},
	loadView = function () {
		// Begin by trying to load the session from the incoming url
		var loadSession = CCH.session.load({
			sid: CCH.CONFIG.params.id
		});
		
		loadSession.done(function (session) {
			CCH.ui.addItemsToBucketOnLoad(CCH.session.getSession().items);

			loadUberItem({
				zoomToUberBbox: false,
				subtree: true,
				overridePreviousBbox: true
			});

			$(window).one({
				'cch.ui.resized' : function () {
					CCH.map.zoomToBoundingBox({
						'bbox': session.bbox,
						'zoomLevel' : session.zoomLevel,
						'fromProjection': CCH.CONFIG.map.modelProjection
					});
				},
				'cch.ui.overlay.removed' : function () {
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
				}
			});
		});
		
		loadSession.fail(function () {
			// The session couldn't be loaded for whatever reason
			// so just load the top level item and move forward
			loadUberItem({
				zoomToUberBbox: true,
				subtree: true,
				overridePreviousBbox: false
			}).done(function () {
				alertify.error('The Coastal Change Hazards Portal could not find your session.', 6000);
			});

			ga('send', 'exception', {
				'exDescription': 'ViewNotFound',
				'exFatal': false
			});
		});
	},
	loadAliasItem = function() {
		// User is coming in with an item, so load that item
		$(window).one('cch.loaded.uber', function () {
			var alias = CCH.CONFIG.params.id;
			CCH.Util.Search().getAliasById({
				id: alias, 
				callbacks: {
					success: [function(data) {
						var id = data.item_id;
						
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
									'bbox': CCH.items.getById({id: id}).bbox,
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
					}],
					error: [
						CCH.ui.errorResponseHandler
					]
				}
			});
		});

		CCH.ui.addItemsToBucketOnLoad(CCH.session.getSession().items);

		loadUberItem({
			subtree: true,
			zoomToUberBbox: true,
			overridePreviousBounds: false
		});
	},
	loadItem = function () {
		var id = CCH.CONFIG.params.id;
		// User is coming in with an item, so load that item
		$(window).one('cch.loaded.uber', function () {
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
						'bbox': CCH.items.getById({id: id}).bbox,
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
		});

		CCH.ui.addItemsToBucketOnLoad(CCH.session.getSession().items);

		loadUberItem({
			subtree: true,
			zoomToUberBbox: true,
			overridePreviousBounds: false
		});
	},
	loadTour = function () {
		$(window).one('cch.ui.overlay.removed', function () {
			// The tour begins here
			CCH.intro.start(CCH.CONFIG.params.id);
		});
		
		loadUberItem({
			subtree: true,
			zoomToUberBbox: false,
			overridePreviousBounds: true
		});
		
		//Zoom to default extent
		CCH.map.zoomToBoundingBox({
			bbox: CCH.map.initialExtent,
			fromProjection: CCH.CONFIG.map.modelProjection,
			attemptClosest: true
		});
	},
	loadDefault = function () {
		CCH.ui.addItemsToBucketOnLoad(CCH.session.getSession().items);

		// The user is initially loading the application. I do not have any items or views
		// to load, nor do I have any session to load, so just start with the top level item
		// and no pre-defined zoom level
		var doNotUsePreviousBounds = true;

		if (CCH.CONFIG.referer.indexOf("/info") !== -1) {
			// The user is coming in from the info page so it is possible that they
			// have a bounding box in their cache. If so, jump to that. 
			// If there isn't anything in the session, uber bbox will be used anyway
			doNotUsePreviousBounds = false;
			
			$(window).one('cch.loaded.uber', function () {
				var lastOpenItem = CCH.session.getOpenItemId();
				if (lastOpenItem) {
					// There was an item open when the user went to the info page.
					// Open that item again
					CCH.ui.accordion.explore(null, { id : lastOpenItem });
				}
			});
		}
		
		loadUberItem({
			subtree: true,
			zoomToUberBbox: false,
			overridePreviousBounds: doNotUsePreviousBounds
		});
		
		//Zoom to default extent
		CCH.map.zoomToBoundingBox({
			bbox: CCH.map.initialExtent,
			fromProjection: CCH.CONFIG.map.modelProjection,
			attemptClosest: true
		});
	};

	CCH.CONFIG.onAppInitialize = function () {
		//Begins the item loading process based on how the user is entering the application
		var viewType = (CCH.CONFIG.params.type + String()).toLowerCase();

		// Populate the UI with incoming data
		// Decide how to load the application. 
		// Depending on the 'idType' string, the application can be loaded either through:
		// 'ITEM' = Load a single item from the database
		// 'ALIAS' = Load a single item from the datbase using the specified alias
		// 'VIEW' = Load a session which can have zero, one or more items
		// '' = Load the application normally through the uber item
		// 
		// Most of the application is now initialized, so I'm going to try and load
		// either one item, a view or all top level items. First I check if idType exists
		switch (viewType) {
		case 'view':
			ga('send', 'event', {
				'eventCategory': 'app',
				'eventAction': 'loadView',
				'eventLabel': 'app load'
			});
			loadView();
			break;
		case 'item':
			ga('send', 'event', {
				'eventCategory': 'app',
				'eventAction': 'loadItem',
				'eventLabel': 'app load'
			});
			loadItem();
			break;
		case 'alias':
			ga('send', 'event', {
				'eventCategory': 'app',
				'eventAction': 'loadItem',
				'eventLabel': 'app load'
			});
			loadAliasItem();
			break;
		case 'tour':
			ga('send', 'event', {
				'eventCategory': 'app',
				'eventAction': 'loadTour',
				'eventLabel': 'app load'
			});
			loadTour();
			break;
		default :
			ga('send', 'event', {
				'eventCategory': 'app',
				'eventAction': 'loadDefault',
				'eventLabel': 'app load'
			});
			loadDefault();
		}
		delete CCH.CONFIG.onAppInitialize;
	};

})();

