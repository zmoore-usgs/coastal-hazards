/*jslint browser: true */
/*jslint plusplus: true */
/*global $ */
/*global CCH */
/*global twttr */
/*global splashUpdate */
/*global OpenLayers */
/*global ga */

/**
 *  Central control object for the user interface
 * 
 * 
 *  Events Emitted:
 *  window: 'cch.ui.resized'
 *  window: 'cch.ui.redimensioned'
 *  window: 'cch.ui.initialized'
 *  window: 'cch.ui.overlay.removed'

 *  Events Listened To:
 *  this.bucket : 'app-navbar-button-clicked'
 *  this.combinedSearch: 'combined-searchbar-search-performing'
 *  this.combinedSearch : 'combined-searchbar-search-performed'
 *  window : 'button-click-bucket-add'
 *  
 * @param {type} args
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
        };

    // This window name is used for the info window to launch into when 
    // a user chooses to go back to the portal
    window.name = "portal_main_window";

    me.APPLICATION_OVERLAY_ID = args.applicationOverlayId || 'application-overlay';
    me.HEADER_ROW_ID = args.headerRowId || 'header-row';
    me.FOOTER_ROW_ID = args.footerRowId || 'footer-row';
    me.CONTENT_ROW_ID = args.contentRowId || 'content-row';
    me.MAP_DIV_ID = args.mapdivId || 'map';
    me.SLIDE_CONTAINER_DIV_ID = args.slideContainerDivId || 'application-slide-items-content-container';
    me.CCSA_AREA_ID = args.ccsAreaId || 'ccsa-area';
    me.SHARE_MODAL_ID = args.shareModalId || 'shareModal';
    me.SHARE_URL_BUTTON_ID = args.shareUrlButtonId || 'modal-share-summary-url-button';
    me.SHARE_INPUT_ID = args.shareInputId || 'modal-share-summary-url-inputbox';
    me.SHARE_TWITTER_BUTTON_ID = args.shareTwitterBtnId || 'multi-card-twitter-button';
    me.HELP_MODAL_ID = args.helpModalId || 'helpModal';
    me.HELP_MODAL_BODY_ID = args.helpModalBodyId || 'help-modal-body';
    me.ITEMS_SLIDE_CONTAINER_ID = args.slideItemsContainerId || 'application-slide-items-container';
    me.BUCKET_SLIDE_CONTAINER_ID = args.slideBucketContainerId || 'application-slide-bucket-container';
    me.SEARCH_SLIDE_CONTAINER_ID = args.slideSearchContainerId || 'application-slide-search-container';
    me.magicResizeNumber = 992;
    me.minimumHeight = args.minimumHeight || 480;
    me.previousWidth = $(window).width();
    me.isSmall = function () {
        // Bootstrap decides when to flip the application view based on 
        // a specific width. 767px seems to be the point 
        // https://github.com/twitter/bootstrap/blob/master/less/responsive-767px-max.less
        return $(window).width() <= me.magicResizeNumber;
    };
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
        isSmall : me.isSmall
    });
    me.combinedSearch = new CCH.Objects.CombinedSearch();
    me.accordion = new CCH.Objects.Accordion({
        containerId : me.SLIDE_CONTAINER_DIV_ID
    });

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
        var currWidth = $(window).width(),
            isSmall = me.isSmall(),
            headerRow = $('#' + me.HEADER_ROW_ID),
            footerRow = $('#' + me.FOOTER_ROW_ID),
            contentRow = $('#' + me.CONTENT_ROW_ID),
            tHeight,
            headerHeight = headerRow.outerHeight(true),
            footerHeight = footerRow.outerHeight(true),
            map = $('#' + me.MAP_DIV_ID),
            contentRowHeight;

        contentRowHeight = $(window).height() - (headerHeight + footerHeight);

        // This is an issue that happens with IE9. I've still not figured out why
        // but the height numbers seem to switch. It's probably an IE9 event
        // handling timing issue
        if (footerHeight > contentRowHeight) {
            tHeight = contentRowHeight;
            contentRowHeight = footerHeight;
            footerHeight = tHeight;
        }

        contentRowHeight = contentRowHeight < me.minimumHeight ? me.minimumHeight : contentRowHeight;

        if (isSmall) {
            contentRow.height($(window).height());
            map.height($(window).height());
        } else {
            contentRow.height(contentRowHeight - 1);
            map.height(contentRowHeight);
        }

        // Check if the application was resized. If so, re-initialize the slideshow to easily
        // fit into the new layout
        if ((me.previousWidth > me.magicResizeNumber && currWidth <= me.magicResizeNumber) ||
                (me.previousWidth <= me.magicResizeNumber && currWidth > me.magicResizeNumber)) {
            $(window).trigger('cch.ui.redimensioned', isSmall);
        }
        $(window).trigger('cch.ui.resized', isSmall);
        me.previousWidth = currWidth;
    };

    me.sharemodalDisplayHandler = function () {
        $('#' + me.SHARE_URL_BUTTON_ID).addClass('disabled');
        $('#' + me.SHARE_INPUT_ID).val('');
        $('#' + me.SHARE_TWITTER_BUTTON_ID).empty();

        // A user has clicked on the share menu item. A session needs to be 
        // created and a token retrieved...
        CCH.session.writeSession({
            callbacks: {
                success: [
                    function (json) {
                        var sid = json.sid,
                            sessionUrl = CCH.CONFIG.publicUrl + '/ui/view/' + sid;
                        CCH.Util.getMinifiedEndpoint({
                            contextPath: CCH.CONFIG.contextPath,
                            location: sessionUrl,
                            callbacks: {
                                success: [
                                    function (json) {
                                        var url = json.tinyUrl,
                                            shareInput = $('#' + me.SHARE_INPUT_ID);

                                        shareInput.val(url);
                                        $('#' + me.SHARE_URL_BUTTON_ID).attr({
                                            'href': url
                                        }).removeClass('disabled');
                                        shareInput.select();
                                        twttr.widgets.createShareButton(
                                            url,
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

                                        twttr.events.bind('tweet', function () {
                                            alertify.log('Your view has been tweeted. Thank you.');
                                        });
                                    }
                                ],
                                error: [
                                    function (data) {
                                        var url = data.responseJSON.full_url,
                                            shareInput = $('#' + me.SHARE_INPUT_ID);
                                        shareInput.val(url);
                                        $('#' + me.SHARE_URL_BUTTON_ID).attr({
                                            'href': url
                                        }).removeClass('disabled');
                                        shareInput.select();
                                        twttr.widgets.createShareButton(
                                            url,
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

                                        twttr.events.bind('tweet', function () {
                                            alertify.log('Your view has been tweeted. Thank you.');
                                        });
                                    }
                                ]
                            }
                        });
                    }
                ],
                error: [
                    function () {
                        $('#shareModal').modal('hide');
                        alertify.error('We apologize, but we could not create a share url for this session!', 2000);
                    }
                ]
            }
        });
    };

    me.helpModalDisplayHandler = function () {
        $('#' + me.HELP_MODAL_BODY_ID).css('max-height', window.innerHeight - window.innerHeight * 0.2);
    };

    me.displayStartupModalWindow = function () {
        $('#helpModal .modal-footer').prepend(
            $('<div />').attr({
                'id': 'set-modal-display-cookie-container'
            }).addClass('pull-left')
                .append(
                    $('<label />').attr({
                        'for': 'set-modal-display-cookie-cb-label'
                    }).html('Don\'t show this again ').append(
                        $('<input />').attr({
                            'id': 'set-modal-display-cookie-cb',
                            'type': 'checkbox',
                            'checked': 'checked'
                        })
                    )
                )
        );

        var removeCheck = function () {
            $('#set-modal-display-cookie-container').remove();
            $('#helpModal').off('hidden', removeCheck);
        };

        $('#set-modal-display-cookie-cb').on('change', function (evt) {
            if (evt.target.checked) {
                $.cookie('cch_display_welcome', 'false', {path: '/'});
            } else {
                $.cookie('cch_display_welcome', 'true', {path: '/'});
            }
        });

        $('#helpModal').on('hidden', removeCheck);
        $('#helpModal').modal('toggle');
    };

    me.removeOverlay = function () {
        splashUpdate("Starting Application...");

        var applicationOverlay = $('#' + me.APPLICATION_OVERLAY_ID);

        $(window).resize();
        CCH.map.getMap().updateSize();

        // Get rid of the overlay and clean it up out of memory and DOM
        applicationOverlay.fadeOut(2000, function () {
            applicationOverlay.remove();
            $(window).trigger('cch.ui.overlay.removed');
        });
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

            data.children.each(function (child) {
                me.accordion.load({
                    'id' : child,
                    'callbacks' : {
                        success : [
                            function () {
                                me.removeOverlay();
                            }
                        ],
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

    // Do Bindings
    // 
    // Move the help modal container to the content row. It originally is in
    // the header row but because that's not always visible, we need to move
    // it during application initialization.
    $('#' + me.HELP_MODAL_ID).
        appendTo($('#' + me.CONTENT_ROW_ID)).
        on('show', me.helpModalDisplayHandler);
    $('#' + me.SHARE_MODAL_ID).on('show', me.sharemodalDisplayHandler);
    $(window).on({
        'resize': me.windowResizeHandler,
        'cch.data.items.searched': me.itemsSearchedHandler,
        'cch.data.locations.searched': me.locationsSearchedHandler
    });
    $(me.combinedSearch).on({
        'combined-searchbar-search-performed' : function (evt, args) {
            me.searchSlide.displaySearchResults(args);
        },
        'combined-searchbar-search-performing' : function () {
            me.searchSlide.close({
                clearOnClose : true
            });
        }
    });
    $(CCH.map).on('map-click', function () {
        me.searchSlide.close({
            clearOnClose : true
        });
    });

    // Check for cookie to tell us if user has disabled the modal window 
    // on start. If not, show it. The user has to opt-in to have it shown 
    // next time
    if (!$.cookie('cch_display_welcome') || $.cookie('cch_display_welcome') === 'true') {
        $.cookie('cch_display_welcome', 'false', {path: '/'});
        me.displayStartupModalWindow();
    }

    // Populate the UI with incoming data
    // Decide how to load the application. 
    // Depending on the 'idType' string, the application can be loaded either through:
    // 'ITEM' = Load a single item from the database
    // 'VIEW' = Load a session which can have zero, one or more items
    // '' = Load the application normally through the uber item
    var type = (CCH.CONFIG.params.type + String()).toLowerCase(),
        id = CCH.CONFIG.params.id,
        removeMarkers = function () {
            CCH.map.clearBoundingBoxMarkers();
            $(window).off('cch-map-bbox-marker-added', removeMarkers);
        };

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
                        function () {
                            var items = CCH.session.getSession().items,
                                addToBucket = function(item) {
                                    $(window).trigger('bucket-add', {
                                        item : item
                                    });
                                };

                            me.loadTopLevelItem({
                                zoomToBbox : true,
                                callbacks : {
                                    success : [function () {
                                        if (items.length) {
                                            items.each(function (item) {
                                                addToBucket(item);
                                            });
                                        }
                                    }],
                                    error : [errorResponseHandler]
                                }
                            });
                        }
                    ],
                    error: [
                        function () {
                            me.loadTopLevelItem({
                                zoomToBbox : true,
                                callbacks : {
                                    success : [
                                    function () {
                                            alertify.error('The Coastal Change Hazards Portal could not find your session.', 4000);
                                    }],
                                    error : []
                                }
                            });
                        }]
                }
            });
        } else if (type === 'item') {
            // User is coming in with an item, so load that item
            splashUpdate('Loading Application...');
            me.accordion.load({
                id : id,
                'callbacks' : {
                    success : [
                        function (item) {
                            CCH.map.zoomToBoundingBox({
                                bbox : item.bbox,
                                fromProjection : new OpenLayers.Projection('EPSG:4326')
                            });
                            me.removeOverlay();
                        }
                    ],
                    error : [errorResponseHandler]
                }
            });
        }
    } else {
        // The user is initially loading the application. I do not have any items
        // to load, nor do I have any session to load, so just start with the top
        // level item
        splashUpdate('Loading Application...');
        me.loadTopLevelItem({
            zoomToBbox : true
        });
    }

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
        CLASS_NAME : 'CCH.Objects.UI'
    });
};