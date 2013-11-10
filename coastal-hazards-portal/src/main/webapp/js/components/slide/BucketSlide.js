/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global splashUpdate*/
CCH.Objects.BucketSlide = function (args) {
    "use strict";
    args = args || {};

    if (!args.containerId) {
        throw 'id is required when initializing a slide';
    }
    var me = (this === window) ? {} : this;

    // Listeners 
    // window: 'cch.ui.resized'

    me.SLIDE_CONTAINER_ID = args.containerId;
    me.MAP_DIV_ID = args.mapdivId || 'map';
    me.SLIDE_TAB_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-tab').attr('id');
    me.SLIDE_CONTENT_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-content').attr('id');

    me.borderWidth = 2;
    me.animationTime = 1500;
    me.placement = 'right';
    me.displayTab = true;
    me.startClosed = false;
    me.isSmall = args.isSmall;
    me.isInitialized = false;
    me.isClosed = me.startClosed;

    me.open = function () {
        var container = $('#' + me.SLIDE_CONTAINER_ID),
            extents = me.getExtents(),
            toExtent = me.isSmall() ? extents.small : extents.large;
        container.animate({
            left: toExtent.left
        }, me.animationTime, function () {
            me.isClosed = false;
        });
    };

    me.close = function () {
        var container = $('#' + me.SLIDE_CONTAINER_ID),
            tab = $('#' + me.SLIDE_TAB_ID),
            dropShadowWidth = 7;
        container.animate({
            left: $(window).width() - tab.outerWidth() + dropShadowWidth
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
            slideContainer = $('#' + me.SLIDE_CONTAINER_ID),
            slideTab = $('#' + me.SLIDE_TAB_ID),
            slideContent = $('#' + me.SLIDE_CONTENT_ID),
            windowWidth = $(window).outerWidth(),
            windowHeight = $(window).outerHeight();
        if (me.isSmall()) {
            slideContainer.offset(toExtent);
            slideContainer.width(windowWidth - toExtent.left);
            slideContainer.height(windowHeight - 10);
            slideContent.width(slideContainer.outerWidth() - slideTab.outerWidth() - me.borderWidth);
            slideTab.offset({
                left : slideContainer.offset().left + 2
            });
        } else {
            slideContainer.offset(toExtent);
            slideContainer.width(windowWidth - toExtent.left);
            slideContainer.height($('#' + me.MAP_DIV_ID).outerHeight());
            slideContent.width(slideContainer.outerWidth() - slideTab.outerWidth() - me.borderWidth);
        }
    };

    me.getExtents = function () {
        var dropShadowExtent = 5,
            extents = {
                large: {
                    top: $('#' + me.MAP_DIV_ID).offset().top,
                    left: $('#' + me.MAP_DIV_ID).outerWidth() + $('#' + me.MAP_DIV_ID).offset().left + dropShadowExtent
                },
                small: {
                    top: 10,
                    left: 10
                }
            };

        return extents;
    };

    $(window).on('cch.ui.resized', function(args) {
        me.resized(args);
    });

    $('#' + me.SLIDE_TAB_ID).on('click', me.toggle);

    return {
        open: me.open,
        close: me.close,
        toggle : me.toggle,
        isClosed : me.isClosed
    };
};