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
        var container = $('#' + me.SLIDE_ITEMS_CONTAINER_ID),
            extents = me.getExtents(),
            toExtent = me.isSmall() ? extents.small : extents.large;
        container.animate({
            left: toExtent.left
        }, me.animationTime, function () {
            me.isClosed = false;
        });
    };

    me.close = function () {
        var container = $('#' + me.SLIDE_ITEMS_CONTAINER_ID),
            tab = $('#' + me.SLIDE_TAB_ID);
        container.animate({
            left: $(window).width() - tab.outerWidth()
        }, me.animationTime, function () {
            me.isClosed = true;
        });
    };

    me.toggle = function () {
        if (me.isClosed) {
            me.open();
        } else {
            me.close();
        }
    };

    // These functions should be implemented in the function that builds these
    // objects
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

        if (isSmall) {
            slideContainer.removeClass('span' + me.desktopSpanSize);
            if (me.isClosed) {
                slideContainer.offset({
                    left: windowWidth  - slideTab.outerWidth(),
                    top: toExtent.top
                });
            } else {
                slideContainer.offset(toExtent);
            }
            slideContainer.height(windowHeight - marginTop - borderSize);
            slideContent.width(slideContainer.outerWidth() - slideTab.outerWidth() - me.borderWidth);
            slideTab.offset({
                left: slideContainer.offset().left + borderSize
            });
        } else {
            slideContainer.addClass('span' + me.desktopSpanSize);
            slideContainer.height(contentRow.height());
            // reset styles from being set small. Revert back to stylesheet style
            slideContainer.css({
                'top' : '',
                'left' : ''
            });
            slideContent.css({
                width: ''
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