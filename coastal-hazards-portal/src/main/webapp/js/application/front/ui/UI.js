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
CCH.Objects.UI = function (args) {
    "use strict";
    CCH.LOG.info('UI.js::constructor: UI class is initializing.');

    var me = (this === window) ? {} : this,
        errorResponseHandler = function (jqXHR, textStatus, errorThrown) {
            CCH.ui.displayLoadingError({
                errorThrown: errorThrown,
                status : jqXHR.status,
                textStatus : textStatus
            });
        },
        type = (CCH.CONFIG.params.type + String()).toLowerCase(),
        id = CCH.CONFIG.params.id,
        removeMarkers = function () {
            CCH.map.clearBoundingBoxMarkers();
            $(window).off('cch-map-bbox-marker-added', removeMarkers);
        },
        addItemsToBucketOnLoad = function (items) {
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
                            id : loadedItemId
                        });

                    // The following is done to add the items to the bucket and 
                    // bucket slider in a specific order
                    itemById.addAtIndex = addIndex;
                    me.bucket.add({
                        item : itemById,
                        visibility : sessionItem.visibility
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
        },
        cookieItems = $.cookie('cch').items || [];

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
    me.bucketSlide = new CCH.Objects.BucketSlide({
        containerId : me.BUCKET_SLIDE_CONTAINER_ID,
        mapdivId : me.MAP_DIV_ID,
        isSmall : me.isSmall
    });
    me.bucket = new CCH.Objects.Bucket({
        slide : me.bucketSlide
    });
    me.itemsSlide = new CCH.Objects.ItemsSlide({
        containerId : me.ITEMS_SLIDE_CONTAINER_ID,
        mapdivId : me.MAP_DIV_ID,
        headerRowId : me.HEADER_ROW_ID,
        footerRowId : me.FOOTER_ROW_ID,
        isSmall : me.isSmall,
        bucket : me.bucket
    });
    me.searchSlide = new CCH.Objects.SearchSlide({
        containerId : me.SEARCH_SLIDE_CONTAINER_ID,
        isSmall : me.isSmall,
        bucket : me.bucket
    });
    me.accordion = new CCH.Objects.Accordion({
        containerId : me.SLIDE_CONTAINER_DIV_ID
    });
    me.combinedSearch = new CCH.Objects.CombinedSearch();

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

        contentRowHeight = $('body').height() - (headerHeight + footerHeight);

        // This is an issue that happens with IE9. I've still not figured out why
        // but the height numbers seem to switch. It's probably an IE9 event
        // handling timing issue
        if (footerHeight > contentRowHeight) {
            tHeight = contentRowHeight;
            contentRowHeight = footerHeight;
            footerHeight = tHeight;
        }

        // Set the correct height for the content row
        contentRowHeight = contentRowHeight < me.minimumHeight ? me.minimumHeight : contentRowHeight;

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
        CCH.Util.getMinifiedEndpoint({
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
                callbacks : {
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
            CCH.map.getMap().updateSize();

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

    me.loadTopLevelItem = function (args) {
        args = args || {};

        var zoomToBbox = args.zoomToBbox === true ? true : false,
            callbacks = args.callbacks || {
                success : [],
                error : []
            };

        callbacks.success.unshift(function (data) {
            if (zoomToBbox) {
                CCH.map.zoomToBoundingBox({
                    bbox : data.bbox,
                    fromProjection : new OpenLayers.Projection('EPSG:4326')
                });
            }

            $(window).on('cch.item.loaded', function (evt) {
                var allLoaded = true,
                    item;
                data.children.each(function (id) {
                    item = CCH.items.getById({id : id});
                    if (!item || !item.loaded) {
                        allLoaded = false;
                    }
                });
                
                if (allLoaded) {
                    $(window).trigger('cch.item.loaded.all');
                    me.removeOverlay();
                }
            });

            data.children.each(function (child, index) {
                me.accordion.load({
                    'id' : child,
                    'index' : index,
                    'callbacks' : {
                        success : [],
                        error : [errorResponseHandler]
                    }
                });
            });
        });

        callbacks.error.unshift(errorResponseHandler);

        new CCH.Objects.Search().submitItemSearch({
            'item' : 'uber',
            'callbacks' : {
                'success' : callbacks.success,
                'error' : callbacks.error
            }
        });
    };

    me.loadItems = function () {
        $(window).resize();

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

                                addItemsToBucketOnLoad(items);

                                me.loadTopLevelItem({
                                    zoomToBbox : false
                                });

                                CCH.map.zoomToBoundingBox({
                                    'bbox' : session.bbox,
                                    'fromProjection' : new OpenLayers.Projection('EPSG:4326')
                                });
                            }
                        ],
                        error: [
                            function () {
                                // The session couldn't be loaded for whatever reason
                                // so just load the top level item and move forward
                                me.loadTopLevelItem({
                                    zoomToBbox : true,
                                    callbacks : {
                                        success : [
                                            function () {
                                                alertify.error('The Coastal Change Hazards Portal could not find your session.', 4000);
                                            }
                                        ],
                                        error : []
                                    }
                                });
                            }]
                    }
                });
            } else if (type === 'item') {
                // User is coming in with an item, so load that item
                splashUpdate('Loading Application...');

                $(window).on('cch.item.loaded.all', function (evt, args) {
                    if (evt.namespace === 'all.item.loaded') {
                        // I want to zoom to the bounding box of the item
                        CCH.map.zoomToBoundingBox({
                            bbox : CCH.items.getById({ id : id }).bbox,
                            fromProjection : new OpenLayers.Projection('EPSG:4326')
                        });

                        // And I want to open the accordion to that item
                        $(window).trigger('cch.slide.search.button.click.explore', {
                            id : id
                        });
                    }
                });

                addItemsToBucketOnLoad(cookieItems);

                me.loadTopLevelItem({
                    zoomToBbox : false
                });
            }
        } else {
            // The user is initially loading the application. I do not have any items
            // to load, nor do I have any session to load, so just start with the top
            // level item
            splashUpdate('Loading Application...');

            addItemsToBucketOnLoad(cookieItems);

            me.loadTopLevelItem({
                zoomToBbox : true
            });
        }
    };

    // Do Bindings
    $(window).on({
        'resize': me.windowResizeHandler,
        'cch.data.items.searched': me.itemsSearchedHandler,
        'cch.data.locations.searched': me.locationsSearchedHandler,
        'slide.bucket.button.click.share' : me.sharemodalDisplayHandler,
        'cch.app.initialized' : me.loadItems,
        'cch.slide.bucket.closing' : function () {
            CCH.map.hideAllLayers();
            me.accordion.showCurrent();
        }
    });

    $(me.combinedSearch).on({
        'combined-searchbar-search-performed' : function (evt, args) {
            var dispResults = function () {
                $(window).off('cch.slide.search.closed', dispResults);
                me.searchSlide.displaySearchResults(args);
            };

            if (!me.searchSlide.isClosed && !me.searchSlide.isClosing) {
                $(window).on('cch.slide.search.closed', dispResults);
                me.searchSlide.close({
                    clearOnClose : false
                });
            } else {
                dispResults();
            }
        }
    });

    // Set up the popovers for the navigation bucket and help containers
    me.$NAVBAR_BUCKET_CONTAINER.popover({
        delay : {
            show : 800,
            hide : 0
        }
    }).on('shown.bs.popover', function (evt) {
        setTimeout(function () {
            $(evt.target).popover('hide');
        }, CCH.CONFIG.ui['tooltip-prevalence']);
    });
    me.$NAVBAR_HELP_CONTAINER.popover({
        delay : {
            show : 800,
            hide : 0
        }
    }).on('shown.bs.popover', function (evt) {
        setTimeout(function () {
            $(evt.target).popover('hide');
        }, CCH.CONFIG.ui['tooltip-prevalence']);
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
        share : me.share,
        CLASS_NAME : 'CCH.Objects.UI'
    });
};