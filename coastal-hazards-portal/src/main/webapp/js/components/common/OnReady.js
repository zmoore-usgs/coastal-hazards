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

    splashUpdate("Initializing Map...");
    CCH.map = new CCH.Objects.Map({
        mapDiv: 'map'
    }).init();

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
        itemId = CCH.CONFIG.params.id,
        removeMarkers = function () {
            CCH.map.clearBoundingBoxMarkers();
            $(window).off('cch-map-bbox-marker-added', removeMarkers);
        },
        errorResponseHandler = function (jqXHR, textStatus, errorThrown) {
            CCH.ui.displayLoadingError({
                errorThrown: errorThrown,
                textStatus: textStatus,
                splashMessage: 404 === jqXHR.status ?
                        '<b>Item Not Found</b><br /><br />The item you are attempting to view no longer exists<br /><br />' :
                        '<b>There was an error attempting to load an item.</b><br />The application may not function correctly.<br />Either try to reload the application or contact the system administrator.<br /><br />',
                mailTo: 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load View (View: ' + CCH.CONFIG.id + ' Error: ' + errorThrown + ')'
            });
        };

    // Most of the application is now initialized, so I'm going to try and load
    // either one item, a view or all top level items. First I check if idType exists
    if (type) {
        // User is coming in with either an item or a view, check which
        if (type === 'view') {
            splashUpdate("Loading View " + CCH.CONFIG.id);
            
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
                                            CCH.LOG.error('OnReady:: Item not loaded - ' + errorThrown);
                                        }
                                    ]
                                }
                            });
                        }
                    ],
                    error: [errorResponseHandler]
                }
            });
        } else if (type === 'item') {
            // User is coming in with an item, so load that item
            splashUpdate('Loading Application');
            CCH.ui.loadInitialItem(itemId);
        }
    } else {
        splashUpdate('Loading Application');
        
        // I don't want to load the uber item, but I do want to find out what's 
        // in it so I can load those items as top-level accordion bellows
        new CCH.Objects.Search().submitItemSearch({
            'item' : 'uber',
            'callbacks' : {
                'success' : [
                    function (data) {
                        CCH.map.zoomToBoundingBox({
                            bbox : data.bbox,
                            fromProjection : new OpenLayers.Projection('EPSG:4326')
                        });
                        data.children.each(function (child) {
                            CCH.ui.loadInitialItem(child);
                        });
                    }
                ],
                'error' : [
                    function (jqXHR, textStatus, errorThrown) {
                        CCH.ui.displayLoadingError({
                            errorThrown: errorThrown,
                            splashMessage: 404 === jqXHR.status ?
                                    '<b>Item Not Found</b><br /><br />There was a problem loading information.<br /><br />' + 
                                    'We could not find information needed to continue loading the Coastal Change Hazards Portal. ' +
                                    'Either try to reload the application or contact the system administrator.<br /><br />' :
                                    'We could not find information needed to continue loading the Coastal Change Hazards Portal. ' +
                                    'Either try to reload the application or contact the system administrator.<br /><br />',
                            mailTo: 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load Item (URL: ' + window.location.toString() + ' Error: ' + errorThrown + ')'
                        });
                    }
                ]
            }
        });
    }
});
