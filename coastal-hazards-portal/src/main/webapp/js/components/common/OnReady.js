/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global splashUpdate*/
/*global initializeLogging*/
/*global CCH*/
/*global LOG*/
/*global OpenLayers*/
$(document).ready(function () {
    "use strict";
    splashUpdate("Loading Main module...");

    splashUpdate("Initializing Logging...");
    initializeLogging({
        LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
    });
    CCH.LOG = LOG;

    $(document).ajaxStart(function () {
        $('body').css('cursor', 'wait');
    });
    $(document).ajaxStop(function () {
        $('body').css('cursor', 'default');
    });

    splashUpdate("Initializing Session Subsystem...");
    CCH.session = new CCH.Objects.Session().init();

    splashUpdate("Initializing Card Subsystem...");
    CCH.cards = new CCH.Objects.Cards();
    
    splashUpdate("Initializing UI...");
    CCH.ui = CCH.Objects.UI({
        applicationOverlayId: 'application-overlay',
        headerRowId: 'header-row',
        footerRowId: 'footer-row',
        contentRowId: 'content-row',
        mapdivId: 'map',
        navbarPinButtonId: 'app-navbar-pin-control-button',
        navbarDropdownIconId: 'app-navbar-pin-control-icon',
        navbarClearMenuItemId: 'app-navbar-pin-control-clear',
        ccsAreaId: 'ccsa-area',
        shareModalId: 'shareModal',
        shareUrlButtonId: 'modal-share-summary-url-button',
        shareInputId: 'modal-share-summary-url-inputbox',
        shareTwitterBtnId: 'multi-card-twitter-button',
        helpModalId: 'helpModal',
        helpModalBodyId: 'help-modal-body',
        slideContainerDivId: 'application-slide-items-content-container',
        slideItemsContainerId: 'application-slide-items-container',
        slideBucketContainerId: 'application-slide-bucket-container',
        slideSearchContainerId: 'application-slide-search-container'
    });

    splashUpdate("Initializing Map...");
    CCH.map = new CCH.Objects.Map({
        mapDiv: 'map'
    }).init();

    splashUpdate("Initializing OWS Services");
    CCH.ows = new CCH.Objects.OWS().init();

    splashUpdate("Initializing Items");
    CCH.items = new CCH.Objects.Items();

    // Decide how to load the application. 
    // Depending on the 'idType' string, the application can be loaded either through:
    // 'ITEM' = Load a single item from the database
    // 'VIEW' = Load a session which can have zero, one or more items
    // '' = Load the application normally through the uber item
    var type = (CCH.CONFIG.params.type + String()).toLowerCase(),
        itemId = CCH.CONFIG.id,
        ssListener,
        oneTimeItemsLoadResponseHandler,
        removeMarkers = function () {
            CCH.map.clearBoundingBoxMarkers();
            $(window).off('cch-map-bbox-marker-added', removeMarkers);
        },
        errorResponseHandler = function (jqXHR, textStatus, errorThrown) {
            CCH.ui.displayLoadingError({
                errorThrown: errorThrown,
                splashMessage: 404 === jqXHR.status ?
                        '<b>Item Not Found</b><br /><br />The item you are attempting to view no longer exists<br /><br />' :
                        '<b>There was an error attempting to load an item.</b><br />The application may not function correctly.<br />Either try to reload the application or contact the system administrator.<br /><br />',
                mailTo: 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load View (View: ' + CCH.CONFIG.id + ' Error: ' + errorThrown + ')'
            });
        };
        
    if (type) {
        if (type === 'item') {
            splashUpdate('Loading Item ' + itemId);

            ssListener = function () {
                CCH.ui.removeOverlay();
                CCH.slideshow.stop();
                // Pin the single item loaded when it gets loaded
                $(CCH.cards.getCards()[0].pinButton).trigger('click');
                // This is a one-time only listener, so unhook it here
                $(window).off('cch-slideshow-slider-loaded', ssListener);
            };

            $(window).on('cch-slideshow-slider-loaded', ssListener);
            $(window).on('cch-map-bbox-marker-added', removeMarkers);

            // Only add an error handler. The success handler will be the vanilla
            // handler done by CCH.items.load()
            CCH.items.load({
                items: [itemId],
                callbacks: {
                    error: [errorResponseHandler]
                }
            });
        } else if (type === 'view') {
            splashUpdate("Loading View " + CCH.CONFIG.id);

            ssListener = function () {
                CCH.ui.removeOverlay();
                CCH.slideshow.stop();
                $(window).off('cch-slideshow-slider-loaded', ssListener);
            };

            $(window).on('cch-slideshow-slider-loaded', ssListener);
            $(window).on('cch-map-bbox-marker-added', removeMarkers);

            // Begin by trying to load the session from the incoming url
            CCH.session.load({
                sid: CCH.CONFIG.id,
                callbacks: {
                    success: [
                        function (json, textStatus, jqXHR) {
                            // Figure out which ids come with this session
                            var idList = CCH.session.getSession().items.map(function (item) {
                                return item.id;
                            }),
                                //Memoize the incoming bbox
                                bbox = json.bbox;

                            // Load those items
                            CCH.items.load({
                                items: idList,
                                callbacks: {
                                    success: [
                                        function (json, textStatus, jqXHR) {
                                            // We want to zoom to the bounding box of the
                                            // session and not just the pinned cards
                                            var itemsLoadedListener = function () {
                                                CCH.map.getMap().zoomToExtent(new OpenLayers.Bounds(bbox));
                                                $(window).off('cch-map-bbox-marker-added', itemsLoadedListener);
                                            };
                                            $(window).on('cch-slideshow-slider-loaded', itemsLoadedListener);
                                        }
                                    ],
                                    error: [
                                        // The application will fail on the first
                                        // item not found. TODO: Should we not break here
                                        // and keep going?
                                        function (jqXHR, textStatus, errorThrown) {
                                            CCH.ui.displayLoadingError({
                                                errorThrown: errorThrown,
                                                splashMessage: 404 === jqXHR.status ?
                                                        '<b>Item Not Found</b><br /><br />We couldn\'t find the view you are looking for<br /><br />' :
                                                        '<b>There was an error attempting to load the view.</b><br />Either try to reload the application or contact the system administrator.<br /><br />',
                                                mailTo: 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load Item (URL: ' + window.location.toString() + ' Error: ' + errorThrown + ')'
                                            });
                                        }
                                    ]
                                }
                            });
                        }
                    ],
                    error: [errorResponseHandler]
                }
            });
        }
    } else {
        // A user is not coming in through the session or the view, so just load
        // the 10 most popular items and begin the slideshow when completed

        // This should run once when the items have finished loading
        oneTimeItemsLoadResponseHandler = function (evt, args) {
            $(window).off('cch.data.products.loaded', oneTimeItemsLoadResponseHandler);

            var products = args.products || [];

            if (products.length) {
                products.each(function (product) {
                    CCH.ui.addToAccordion({
                        product : product
                    });
                });
            }
        };

        $(window).on('cch.data.products.loaded', oneTimeItemsLoadResponseHandler);

        errorResponseHandler = function (jqXHR, textStatus, errorThrown) {
            CCH.ui.displayLoadingError({
                errorThrown: errorThrown,
                splashMessage: '<b>Oops! Something broke!</b><br /><br />There was an error communicating with the server. The application was halted.<br /><br />',
                mailTo: 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load Any Items (' + errorThrown + ')'
            });
        }

        // "uber" is the top level item containing children which are at the top
        // level. Typically these will be the top level aggregations
        new CCH.Objects.Search().submitItemSearch({
            items: ['uber'],
            displayNotification: false,
            callbacks: {
                success: [
                    // Once the 'uber' item is loaded, look at its children.
                    // The children will be the actual items to be displayed
                    function (data, status, xhr) {
                        if (status === 'success') {
                            CCH.items.load({
                                items: [data.children],
                                displayNotification: false,
                                callbacks: {
                                    success: [
                                        CCH.ui.removeOverlay
                                    ],
                                    error: [
                                        function() {
                                            errorResponseHandler(null, null, 'Search for children did not return a valid response');
                                        }
                                    ]
                                }
                            });
                        } else {
                            
                        }
                    }],
                error: [errorResponseHandler]
            }
        });
    }
});
