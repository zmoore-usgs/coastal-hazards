/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global splashUpdate*/
CCH.Objects.BucketSlide = function (args) {
    "use strict";
    args = args || {};

    if (!args.containerId) {
        throw 'containerId is required when initializing a bucket slide';
    }
    var me = (this === window) ? {} : this;

    // Listeners 
    // window: 'cch.ui.resized'

    me.SLIDE_CONTAINER_ID = args.containerId;
    me.MAP_DIV_ID = args.mapdivId || 'map';
    me.SLIDE_CONTENT_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-content').attr('id');
    me.CARD_TEMPLATE_ID = 'application-slide-bucket-container-card-template';
    me.SLIDE_CONTENT_CONTAINER = 'application-slide-bucket-content-container';

    me.borderWidth = 2;
    me.animationTime = 500;
    me.placement = 'right';
    me.isSmall = args.isSmall;
    me.startClosed = true;
    me.isInitialized = false;
    me.isClosed = me.startClosed;

    me.open = function () {
        var slideContainer = $('#' + me.SLIDE_CONTAINER_ID),
            extents = me.getExtents(),
            toExtent = me.isSmall() ? extents.small : extents.large;
        $('body').css({
            overflow : 'hidden'
        });
        slideContainer.css({
            display: ''
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
        var slideContainer = $('#' + me.SLIDE_CONTAINER_ID);
        
        $('body').css({
            overflow : 'hidden'
        });
        
        slideContainer.animate({
            left: $(window).width()
        }, me.animationTime, function () {
            me.isClosed = true;
            
            slideContainer.css({
                display: 'none'
            });
            
            $('body').css({
               overflow : 'hidden'
           });
        
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
            slideContent = $('#' + me.SLIDE_CONTENT_ID),
            windowWidth = $(window).outerWidth(),
            windowHeight = $(window).outerHeight();

        if (me.isClosed) {
            slideContainer.css({
                display : 'none'
            });
        } else {
            slideContainer.css({
                'display' : ''
            });
        }

        if (me.isSmall()) {
            if (me.isClosed) {
                slideContainer.offset({
                    left: windowWidth,
                    top: toExtent.top
                });
            } else {
                slideContainer.offset(toExtent);
            }
            slideContainer.width(windowWidth - toExtent.left);
            slideContainer.height(windowHeight - 10);
            slideContent.width(slideContainer.outerWidth() - me.borderWidth);
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
            slideContainer.height($('#' + me.MAP_DIV_ID).outerHeight());
            slideContent.width(slideContainer.outerWidth() - me.borderWidth);
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

    CCH.LOG.debug('CCH.Objects.BucketSlide::constructor: BucketSlide class initialized.');
    return {
        open: me.open,
        close: me.close,
        toggle : me.toggle,
        addCard : me.addCard,
        createCard : me.createCard,
        isClosed : me.isClosed
    };
};