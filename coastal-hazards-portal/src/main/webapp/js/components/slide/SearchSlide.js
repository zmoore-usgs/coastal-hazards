/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global splashUpdate*/
CCH.Objects.SearchSlide = function (args) {
    "use strict";
    args = args || {};

    if (!args.containerId) {
        throw 'containerId is required when initializing a search slide';
    }
    var me = (this === window) ? {} : this;

    // Listeners 
    // window: 'cch.ui.resized'

    me.SLIDE_CONTAINER_ID = args.containerId;
    me.SLIDE_TAB_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-tab').attr('id');
    me.SLIDE_CONTENT_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-content').attr('id');
    me.APP_CONTAINER_ID = 'content-row';
    
    me.borderWidth = 2;
    me.animationTime = 500;
    me.placement = 'right';
    me.displayTab = true;
    me.isSmall = args.isSmall;
    me.startClosed = true;
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
            appContainerId = $('#' + me.APP_CONTAINER_ID),
            windowWidth = $(window).outerWidth(),
            windowHeight = $(window).outerHeight()

        if (me.isSmall()) {
            if (me.isClosed) {
                slideContainer.offset({
                    left: windowWidth - slideTab.outerWidth(),
                    top: toExtent.top
                });
            } else {
                slideContainer.offset(toExtent);
            }
            slideContainer.width(windowWidth - toExtent.left);
            slideContainer.height(windowHeight - 10);
            slideContent.width(slideContainer.outerWidth() - slideTab.outerWidth() - me.borderWidth);
            slideTab.offset({
                left: slideContainer.offset().left + 2
            });
        } else {
            if (me.isClosed) {
                slideContainer.offset({
                    left: windowWidth,
                    top: toExtent.top
                });
            } else {
                slideContainer.offset(toExtent);
            }
            slideContainer.width(windowWidth - toExtent.left);
            slideContainer.height(appContainerId.outerHeight());
            slideContent.width(slideContainer.outerWidth() - slideTab.outerWidth() - me.borderWidth);
        }
    };

    me.getExtents = function () {
        var appContainerId = $('#' + me.APP_CONTAINER_ID),
            extents = {
                large: {
                    top: appContainerId.offset().top,
                    left: appContainerId.offset().left + 10
                },
                small: {
                    top: appContainerId.offset().top,
                    left: appContainerId.offset().left
                }
            };

        return extents;
    };

    $(window).on('cch.ui.resized', function (args) {
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