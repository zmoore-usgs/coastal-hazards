/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global twttr*/
/*global splashUpdate*/

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

    var me = (this === window) ? {} : this;

    me.APPLICATION_OVERLAY_ID = args.applicationOverlayId || 'application-overlay';
    me.HEADER_ROW_ID = args.headerRowId || 'header-row';
    me.FOOTER_ROW_ID = args.footerRowId || 'footer-row';
    me.CONTENT_ROW_ID = args.contentRowId || 'content-row';
    me.MAP_DIV_ID = args.mapdivId || 'map';
    me.SLIDE_CONTAINER_DIV_ID = args.slideContainerDivId || 'application-slide-items-content-container';
    me.NAVBAR_PIN_BUTTON_ID = args.navbarPinButtonId || 'app-navbar-pin-control-button';
    me.NAVBAR_PIN_CONTROL_ICON_ID = args.navbarDropdownIconId || 'app-navbar-pin-control-icon';
    me.NAVBAR_CLEAR_MENU_ITEM_ID = args.navbarClearMenuItemId || 'app-navbar-pin-control-clear';
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
    me.itemsSlide = new CCH.Objects.ItemsSlide({
        containerId : me.ITEMS_SLIDE_CONTAINER_ID,
        mapdivId : me.MAP_DIV_ID,
        headerRowId : me.HEADER_ROW_ID,
        footerRowId : me.FOOTER_ROW_ID,
        isSmall : me.isSmall
    });
    me.bucketSlide = new CCH.Objects.BucketSlide({
        containerId : me.BUCKET_SLIDE_CONTAINER_ID,
        mapdivId : me.MAP_DIV_ID,
        isSmall : me.isSmall
    });
    me.searchSlide = new CCH.Objects.SearchSlide({
        containerId : me.SEARCH_SLIDE_CONTAINER_ID,
        isSmall : me.isSmall
    });
    me.bucket = new CCH.Objects.Bucket({
        slide : me.bucketSlide
    });
    me.combinedSearch = new CCH.Objects.CombinedSearch();
    me.accordion = new CCH.Objects.Accordion({
        containerId : me.SLIDE_CONTAINER_DIV_ID
    });

    me.itemsSearchedHandler = function (evt, data) {
        // Display a notification with item count
        if (data.items) {
            var count = data.items.length;
            $.pnotify({
                text: 'Found ' + count + ' item' + (count === 1 ? '.' : 's.'),
                styling: 'bootstrap',
                type: 'info',
                nonblock: true,
                sticker: false,
                icon: 'icon-search',
                closer: true,
                delay: 3000
            });
        }
    };
    
        me.locationsSearchedHandler = function (evt, data) {
        // Display a notification with item count
        if (data.items) {
            var count = data.items.length;
            $.pnotify({
                text: 'Found ' + count + ' locations' + (count === 1 ? '.' : 's.'),
                styling: 'bootstrap',
                type: 'info',
                nonblock: true,
                sticker: false,
                icon: 'icon-search',
                closer: true,
                delay: 3000
            });
        }
    };

    me.windowResizeHandler = function () {
        var currWidth = $(window).width(),
            isSmall = me.isSmall(),
            headerRow = $('#' + me.HEADER_ROW_ID),
            footerRow = $('#' + me.FOOTER_ROW_ID),
            contentRow = $('#' + me.CONTENT_ROW_ID),
            map = $('#' + me.MAP_DIV_ID),
            contentRowHeight = $(window).height() - headerRow.outerHeight(true) - footerRow.outerHeight(true);

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
                                            $.pnotify({
                                                text: 'Your view has been tweeted. Thank you.',
                                                styling: 'bootstrap',
                                                type: 'info',
                                                nonblock: true,
                                                sticker: false,
                                                icon: 'icon-twitter'
                                            });
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
                                            $.pnotify({
                                                text: 'Your view has been tweeted. Thank you.',
                                                styling: 'bootstrap',
                                                type: 'info',
                                                nonblock: true,
                                                sticker: false,
                                                icon: 'icon-twitter'
                                            });
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
                        $.pnotify({
                            text: 'We apologize, but we could not create a share url for this session!',
                            styling: 'bootstrap',
                            type: 'error',
                            nonblock: true,
                            sticker: false,
                            icon: 'icon-warning-sign'
                        });
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
    
    me.addToAccordion = function (args) {
        args = args || {};
        
        var card = args.card,
            item = args.item,
            bellow;
        
        // If we are passed a product, that means we were not passed a card
        if (item) {
            card = CCH.cards.buildCard({
                item : item,
                initHide : false
            });
        }
        
        // By now, we should have a card
        if (card) {
            bellow = me.accordion.add({
                card : card
            });
            bellow.on('bellow-display-toggle', function (evt, args) {
                CCH.LOG.debug('CCH.Objects.UI:: Item ' + args.id + ' was ' + (args.display ? 'shown' : 'hidden'));
                var id = args.id,
                    display = args.display,
                    item = args.card.item,
                    type = item.itemType,
                    childItem;
                    
                // Check if I am opening a bellow 
                if (display) {
                    // A bellow was opened, so I need to show some layers
                    
                    // I want to zoom to a bounding box 
                    CCH.map.zoomToBoundingBox({
                        bbox : item.bbox,
                        fromProjection : new OpenLayers.Projection('EPSG:4326')
                     });
                     
                    // Check to see if this is an aggregation. If it is, I need
                    // to pull the layers from all of its children
                    if (type === 'aggregation') {
                        // This aggregation should have children, so for each 
                        // child, I want to grab the child's layer and display it
                        // on the map
                        item.children.each(function (childItemId) {
                            childItem = CCH.items.getById({ id : childItemId });
                            CCH.map.displayData({
                                item : childItem
                            })
                        });
                    } else {
                        // What do I do if it's not an aggregation? Will an item
                        // in a bellow ever not be an aggregation?
                    }
                }
                
            });
        }
    };

    me.displayLoadingError = function (args) {
        var continueLink = $('<a />').attr({
            'href': CCH.CONFIG.contextPath,
            'role': 'button'
        }).addClass('btn btn-lg').html('<i class="fa fa-refresh"></i> Click to continue'),
            emailLink = $('<a />').attr({
                'href': args.mailTo,
                'role': 'button'
            }).addClass('btn btn-lg').html('<i class="fa fa-envelope"></i> Contact Us');

        splashUpdate(args.splashMessage);

        $('#splash-status-update').append(continueLink);
        $('#splash-status-update').append(emailLink);
        $('#splash-spinner').fadeOut(2000);
    };

    me.init = (function () {
        var navbarPinButton = $('#' + me.NAVBAR_PIN_BUTTON_ID),
            navbarClearMenuItem = $('#' + me.NAVBAR_CLEAR_MENU_ITEM_ID),
            shareModal = $('#' + me.SHARE_MODAL_ID),
            helpModal = $('#' + me.HELP_MODAL_ID),
            contentRow = $('#' + me.CONTENT_ROW_ID);

        // This window name is used for the info window to launch into when 
        // a user chooses to go back to the portal
        window.name = "portal_main_window";

        // Move the help modal container to the content row. It originally is in
        // the header row but because that's not always visible, we need to move
        // it during application initialization.
        helpModal.appendTo(contentRow);

        navbarPinButton.on('click', me.navbarMenuClickHandler);
        navbarClearMenuItem.on('click', me.navbarClearItemClickHandler);
        shareModal.on('show', me.sharemodalDisplayHandler);
        helpModal.on('show', me.helpModalDisplayHandler);
        $(window).on({
            'resize': me.windowResizeHandler,
            'cch.data.items.searched': me.itemsSearchedHandler,
            'cch.data.locations.searched': me.locationsSearchedHandler,
            'bucket-add': function(evt, args) {
                
            },
            'bucket-remove': function(evt, args) {
                
            }
        });

        $(me.combinedSearch).on('combined-searchbar-search-performed', function (evt, args) {
            me.searchSlide.displaySearchResults(args);
        });
        $(me.combinedSearch).on('combined-searchbar-search-performing', function () {
            me.searchSlide.close();
            me.searchSlide.clear();
        });

        // Check for cookie to tell us if user has disabled the modal window 
        // on start. If not, show it. The user has to opt-in to have it shown 
        // next time
        if (!$.cookie('cch_display_welcome') || $.cookie('cch_display_welcome') === 'true') {
            $.cookie('cch_display_welcome', 'false', {path: '/'});
            me.displayStartupModalWindow();
        }

        $(window).trigger('cch.ui.initialized');

        CCH.LOG.debug('UI.js::constructor: UI class initialized.');
    }());

    return {
        removeOverlay: me.removeOverlay,
        isSmall: me.isSmall,
        displayLoadingError: me.displayLoadingError,
        itemsSlide: me.itemsSlide,
        bucketSlide: me.bucketSlide,
        searchSlide: me.searchSlide,
        bucket: me.bucket,
        addToAccordion : me.addToAccordion,
        CLASS_NAME : CCH.Objects.UI
    };
};