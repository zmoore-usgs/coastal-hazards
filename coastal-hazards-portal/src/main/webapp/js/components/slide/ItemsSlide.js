/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global splashUpdate*/

/**
 * Slider widget holding cards
 * 
 * Listens For: 
 * window: 'cch.ui.resized'
 * 
 * @param {type} args
 * @returns {CCH.Objects.ItemsSlide.Anonym$5}
 */
CCH.Objects.ItemsSlide = function (args) {
    "use strict";
    args = args || {};

    if (!args.containerId) {
        throw 'containerId is required when initializing a items slide';
    }
    
    CCH.LOG.info('ItemsSlide.js::constructor: ItemsSlide class is initializing.');
    
    var me = (this === window) ? {} : this;

    me.SLIDE_ITEMS_CONTAINER_ID = args.containerId;
    me.MAP_DIV_ID = args.mapdivId || 'map';
    me.SLIDE_TAB_ID = $('#' + me.SLIDE_ITEMS_CONTAINER_ID + ' .application-slide-tab').attr('id');
    me.SLIDE_CONTENT_ID = $('#' + me.SLIDE_ITEMS_CONTAINER_ID + ' .application-slide-content').attr('id');
    me.CARD_TEMPLATE_ID = 'application-slide-items-container-card-template';
    me.SLIDE_CONTENT_CONTAINER = 'application-slide-items-content-container';
    me.HEADER_ROW_ID = args.headerRowId || 'header-row';
    me.FOOTER_ROW_ID = args.footerRowId || 'footer-row';
    me.isSmall = args.isSmall;
    me.borderWidth = 2;
    me.desktopSpanSize = 3;
    me.animationTime = 500;
    me.placement = 'right';
    me.displayTab = me.isSmall();
    me.startClosed = me.isSmall() ? false : true;
    me.isInitialized = false;
    me.isClosed = me.startClosed;

    me.open = function () {
        var slideContainer = $('#' + me.SLIDE_ITEMS_CONTAINER_ID),
            slideContent = $('#' + me.SLIDE_CONTENT_ID),
            slideTab = $('#' + me.SLIDE_TAB_ID),
            extents = me.getExtents(),
            windowWidth = $(window).outerWidth(),
            toExtent = extents.small;
    
        // When opening this slider, we don't want to show scroll bars showing up 
        // at the bottom of the window due to the width of the slider sliding 
        // into view. When closed, the slider is invisible except for the tab. 
        // When making it visible before sliding open, we need to set the body
        // overflow to hidden and then reset it once the slider is opened. We also 
        // reset the width of the container that was set to be as wide as the 
        // tab only 
        $('body').css({
            overflow : 'hidden'
        });
        slideContainer.css({
            width : windowWidth - toExtent.left
        });
        slideContent.css({
            display : '',
            width : slideContainer.outerWidth() - slideTab.outerWidth() - me.borderWidth
        });
        slideContent.offset({
            left : windowWidth -me.borderWidth
        });
        slideContainer.animate({
            left: toExtent.left
        }, me.animationTime, function () {
            me.isClosed = false;
            $('body').css({
                overflow : ''
            });
        });
    };

    me.close = function () {
        var container = $('#' + me.SLIDE_ITEMS_CONTAINER_ID),
            slideTab = $('#' + me.SLIDE_TAB_ID),
            slideContent = $('#' + me.SLIDE_CONTENT_ID),
            windowWidth = $(window).outerWidth();
    
        // We will be scrolling the entire pane out of the viewport. In order to
        // avoid scrollbars along the bottom of the screen, we temporarily set
        // the overflow to hidden for the body. We will set the display of 
        // the content to none, set the width of the container to just be the tab
        // and reset the overflow
        $('body').css({
            overflow : 'hidden'
        });
        container.animate({
            left: windowWidth - slideTab.outerWidth() - (me.borderWidth * 2)
        }, me.animationTime, function () {
            me.isClosed = true;
            
            slideContent.css({
                display : 'none'
            });
            
            container.css({
                width : slideTab.outerWidth()
            });
            
            $('body').css({
                overflow : ''
            });
        });
    };

    // Toggles the container open/closed. This is only valid for when the 
    // application is in mobile mode. Otherwise, the item slide is a panel in
    // the application and does not toggle open or closed
    me.toggle = function () {
        if (me.isSmall()) {
            if (me.isClosed) {
                me.open();
            } else {
                me.close();
            }
        }
    };

    me.resized = function () {
        var extents = me.getExtents(),
            toExtent = me.isSmall() ? extents.small : extents.large,
            map = $('#' + me.MAP_DIV_ID),
            contentRow = map.parent(),
            isSmall = me.isSmall(),
            slideContainer = $('#' + me.SLIDE_ITEMS_CONTAINER_ID),
            slideTab = $('#' + me.SLIDE_TAB_ID),
            slideContent = $('#' + me.SLIDE_CONTENT_ID),
            windowWidth = $(window).outerWidth(),
            windowHeight = $(window).outerHeight(),
            marginTop = 10,
            borderSize = 4;
    
        // I've got to know what my form factor is. Bootstrap uses a special number,
        // 766px at which to resize and I do some special stuff when bootstrap resizes.
        // - When switching to small, my item slide container goes from being a column
        //   to a free-floating column and needs quite a bit of help in resizing when
        //   that happens
        if (isSmall) {
            // When I am switched to small mode, I want to remove the slideContainer's 
            // span class because it's no longer a span.
            slideContainer.removeClass('col-md-' + me.desktopSpanSize);
            
            // Then there's special sizing depending on if I'm closed or not. 
            if (me.isClosed) {
                // If I'm closed, my container, which holds my tab and content, 
                // should be off screen to the right except for the width of the tab
                // and its border so that just the tab is peeking out of the 
                // right side of the screen
                slideContainer.offset({
                    left: windowWidth  - slideTab.outerWidth() - (me.borderWidth * 2),
                    top: toExtent.top
                });
                // I hide the content dom since it's off screen and I don't want 
                // to show it
                slideContent.css({
                    display : 'none'
                })
            } else {
                // If I'm open...
                slideContainer.
                    offset(toExtent).
                    width(windowWidth - toExtent.left);
                
                slideContent.css({
                    display : '',
                    width : slideContainer.outerWidth() - slideTab.outerWidth() - me.borderWidth
                });
            }
            slideContainer.height(windowHeight - marginTop - borderSize);
            slideTab.offset({
                left: slideContainer.offset().left + borderSize
            });
        } else {
            slideContainer.
                addClass('col-md-' + me.desktopSpanSize).
                css({
                    'height' : contentRow.height(),
                    'position' : '',
                    'top' : '',
                    'left' : '',
                    'width' : ''
                });
            slideContent.css({
                width: '',
                display : ''
            });
        }
    };

    me.getExtents = function () {
        var extents = {
                large: {
                    top: $('#' + me.MAP_DIV_ID).offset().top,
                    left: $('#' + me.MAP_DIV_ID).outerWidth() + $('#' + me.MAP_DIV_ID).offset().left
                },
                small: {
                    top: 10,
                    left: 10
                }
            };

        return extents;
    };

    me.addCard = function (args) {
        args = args || {};

        if (args.card) {
            $('#' + me.SLIDE_CONTENT_CONTAINER).append(args.card);
        }
    };

    me.createCard = function (args) {
        args = args || {};
        var id = args.id || new Date().getMilliseconds(),
            title = args.title || 'Title Not Provided',
            content = args.content || 'Description Not Provided',
            titleContainerClass = 'application-slide-bucket-container-card-title',
            descriptionContainerClass = 'application-slide-bucket-container-card-description',
            newItem = $('#' + me.CARD_TEMPLATE_ID).children().clone(true),
            titleContainer = newItem.find('.' + titleContainerClass),
            titleContainerPNode = newItem.find('.' + titleContainerClass + ' p'),
            descriptionContainer = newItem.find('.' + descriptionContainerClass);

        newItem.attr('id', 'application-slide-bucket-container-card-' + id);
        titleContainer.attr('id', titleContainerClass + '-' + id);
        titleContainerPNode.html(title);
        descriptionContainer.attr('id', descriptionContainerClass + '-' + id).html(content);
        
        return newItem;
    };

    $(window).on('cch.ui.resized', function (args) {
        me.resized(args);
    });

    $('#' + me.SLIDE_TAB_ID).on('click', me.toggle);
    
    CCH.LOG.info('CCH.Objects.ItemsSlide::constructor: ItemsSlide class initialized.');
    return {
        open: me.open,
        close: me.close,
        toggle : me.toggle,
        addCard : me.addCard,
        createCard : me.createCard,
        isClosed : me.isClosed
    };
};