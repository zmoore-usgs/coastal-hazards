/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global twttr*/
/*global splashUpdate*/
CCH.Objects.UI = function (args) {
    "use strict";
    CCH.LOG.info('UI.js::constructor: UI class is initializing.');

    var me = (this === window) ? {} : this;

    me.APPLICATION_OVERLAY_ID = args.applicationOverlayId || 'application-overlay';
    me.HEADER_ROW_ID = args.headerRowId || 'header-row';
    me.FOOTER_ROW_ID = args.footerRowId || 'footer-row';
    me.MAP_DIV_ID = args.mapdivId || 'map';
    me.SLIDE_CONTAINER_DIV_ID = args.slideContainerDivId || 'slide-container-wrapper';
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
    me.BUCKET_SLIDE_CONTAINER_ID = args.slideBucketContainerId || 'application-slide-bucket-container';
    me.SEARCH_SLIDE_CONTAINER_ID = args.slideSearchContainerId || 'application-slide-search-container';
    
    me.magicResizeNumber = 767;
    me.minimumHeight = args.minimumHeight || 480;
    me.previousWidth = $(window).width();
    me.bucket = new CCH.Objects.Bucket();
    me.combinedSearch = new CCH.Objects.CombinedSearch();
    
    // Triggers:
    // window: 'cch.ui.resized'
    // window: 'cch.ui.redimensioned'
    // window: 'cch.navbar.pinmenu.button.pin.click'
    // window: 'cch.navbar.pinmenu.item.clear.click'
    // window: 'cch.ui.initialized'
    // window: 'cch.ui.overlay.removed'

    // Listeners:
    // me.bucket : 'app-navbar-button-clicked'

    me.itemsSearchedHandler = function (evt, count) {
        // Display a notification with item count
        $.pnotify({
            text: 'Found ' + count + ' item' + (count === 1 ? '.' : 's.'),
            styling: 'bootstrap',
            type: 'info',
            nonblock: true,
            sticker: false,
            icon: 'icon-search'
        });
    };

    me.windowResizeHandler = function () {
        var currWidth = $(window).width(),
            isSmall = me.isSmall(),
            headerRow = $('#' + me.HEADER_ROW_ID),
            footerRow = $('#' + me.FOOTER_ROW_ID),
            map = $('#' + me.MAP_DIV_ID),
            slideDiv = $('#' + me.SLIDE_CONTAINER_DIV_ID),
            descriptionHeight,
            contentRowHeight = $(window).height() - headerRow.outerHeight(true) - footerRow.outerHeight(true);

        contentRowHeight = contentRowHeight < me.minimumHeight ? me.minimumHeight : contentRowHeight;

        if (isSmall) {
            // In a profile view, we care about the height of the description container
            descriptionHeight = Math.round(contentRowHeight * 0.30);
            if (descriptionHeight < 280) {
                descriptionHeight = 280;
            }
            slideDiv.height(descriptionHeight);
            map.height(contentRowHeight - descriptionHeight);
        } else {
            map.height(contentRowHeight);
            slideDiv.height(contentRowHeight);
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

    me.pinmenuItemClickHandler = function () {
        $('#' + me.NAVBAR_PIN_BUTTON_ID).removeClass('slider-card-pinned');
    };

    me.navbarMenuClickHandler = function () {
        // Check to see if any cards are pinned
        var pinnedCardIds = CCH.session.getPinnedItemIds(),
            pinControlIcon = $('#' + me.NAVBAR_PIN_CONTROL_ICON_ID),
            items = null,
            pcIdx,
            id,
            isResultMatched = function (result) {
                return result.id === id;
            };

        if (pinnedCardIds.length) {
            // Toggle how the button looks
            pinControlIcon.toggleClass('muted');
            $('#' + me.NAVBAR_PIN_BUTTON_ID).toggleClass('slider-card-pinned');

            // Check if button is active
            if (!pinControlIcon.hasClass('muted')) {
                // If cards are pinned, show only pinned cards
                // Otherwise, show all cards
                // TODO- This functionality should probably be in Cards
                items = [];
                for (pcIdx = 0; pcIdx < pinnedCardIds.length; pcIdx++) {
                    id = pinnedCardIds[pcIdx];
                    items.push(CCH.session.getSession().items.find(isResultMatched));
                }
                CCH.map.zoomToActiveLayers();
            }
        }

        // pinnedResults may or may not be an empty array. If it is, 
        // the full deck will be seen. Otherwise, if pinnedResults is
        // populated, only pinned cards will be seen
        $(window).trigger('cch.navbar.pinmenu.button.pin.click', {items: items});
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

    me.navbarClearItemClickHandler = function () {
        $(window).trigger('cch.navbar.pinmenu.item.clear.click');
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
    
    
    me.isSmall = function () {
        // Bootstrap decides when to flip the application view based on 
        // a specific width. 767px seems to be the point 
        // https://github.com/twitter/bootstrap/blob/master/less/responsive-767px-max.less
        return me.previousWidth <= me.magicResizeNumber;
    };

    me.displayLoadingError = function (args) {
        var continueLink = $('<a />').attr({
            'href': CCH.CONFIG.contextPath,
            'role': 'button'
        }).addClass('btn btn-large').html('<i class="fa fa-refresh"></i> Click to continue'),
            emailLink = $('<a />').attr({
                'href': args.mailTo,
                'role': 'button'
            }).addClass('btn btn-large').html('<i class="fa fa-envelope"></i> Contact Us');

        splashUpdate(args.splashMessage);

        $('#splash-status-update').append(continueLink);
        $('#splash-status-update').append(emailLink);
        $('#splash-spinner').fadeOut(2000);
    };
    
    me.bucketSlide = new CCH.Objects.BucketSlide({
        containerId : me.BUCKET_SLIDE_CONTAINER_ID,
        mapdivId : me.MAP_DIV_ID,
        isSmall : me.isSmall
    });
    
    me.searchSlide = new CCH.Objects.SearchSlide({
        containerId : me.SEARCH_SLIDE_CONTAINER_ID,
        isSmall : me.isSmall
    });
    
    // Init
    {
        var navbarPinButton = $('#' + me.NAVBAR_PIN_BUTTON_ID),
            navbarClearMenuItem = $('#' + me.NAVBAR_CLEAR_MENU_ITEM_ID),
            shareModal = $('#' + me.SHARE_MODAL_ID),
            ccsaArea = $('#' + me.CCSA_AREA_ID),
            helpModal = $('#' + me.HELP_MODAL_ID),
            bucket = me.bucket;

        // This window name is used for the info window to launch into when 
        // a user chooses to go back to the portal
        window.name = "portal_main_window";

        $(window).on({
            'resize': me.windowResizeHandler,
            'cch.data.items.searched': me.itemsSearchedHandler,
            'cch.navbar.pinmenu.item.clear.click': me.pinmenuItemClickHandler
        });
        $(bucket).on('app-navbar-button-clicked', function () {
            me.bucketSlide.toggle();
        });
        navbarPinButton.on('click', me.navbarMenuClickHandler);
        navbarClearMenuItem.on('click', me.navbarClearItemClickHandler);
        shareModal.on('show', me.sharemodalDisplayHandler);
        helpModal.on('show', me.helpModalDisplayHandler);
        
        // Header fix
        ccsaArea.find('br').first().remove();

        // Check for cookie to tell us if user has disabled the modal window 
        // on start. If not, show it. The user has to opt-in to have it shown 
        // next time
        if (!$.cookie('cch_display_welcome') || $.cookie('cch_display_welcome') === 'true') {
            $.cookie('cch_display_welcome', 'false', {path: '/'});
            me.displayStartupModalWindow();
        }
        
        $(window).trigger('cch.ui.initialized');
    }
    
    CCH.LOG.debug('UI.js::constructor: UI class initialized.');

    return {
        removeOverlay: me.removeOverlay,
        isSmall: me.isSmall,
        displayLoadingError: me.displayLoadingError,
        bucketSlide: me.bucketSlide,
        searchSlide: me.searchSlide,
        bucket: me.bucket
    };
};