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
    me.SLIDE_TAB_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-tab').attr('id');
    me.SLIDE_CONTENT_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-content').attr('id');
    me.CARD_TEMPLATE_ID = 'application-slide-bucket-container-card-template';
    me.SLIDE_CONTENT_CONTAINER = 'application-slide-bucket-content-container';

    me.borderWidth = 2;
    me.animationTime = 500;
    me.placement = 'right';
    me.displayTab = true;
    me.isSmall = args.isSmall;
    me.startClosed = !me.isSmall();
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
            slideContainer = $('#' + me.SLIDE_CONTAINER_ID),
            slideTab = $('#' + me.SLIDE_TAB_ID),
            slideContent = $('#' + me.SLIDE_CONTENT_ID),
            windowWidth = $(window).outerWidth(),
            windowHeight = $(window).outerHeight();

        if (me.isSmall()) {
            if (me.isClosed) {
                slideContainer.offset({
                    left: windowWidth  - slideTab.outerWidth(),
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
            slideContainer.height($('#' + me.MAP_DIV_ID).outerHeight());
            slideContent.width(slideContainer.outerWidth() - slideTab.outerWidth() - me.borderWidth);
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
            image = args.image || 'https://2.gravatar.com/avatar/15fcf61ab6fb824d11f355d7a99a1bbf?d=https%3A%2F%2Fidenticons.github.com%2Fd55c695700043438ce4162cbe589e072.png',
            title = args.title || 'Title Not Provided',
            content = args.content || 'Description Not Provided',
            imageContainerClass = 'application-slide-bucket-container-card-image',
            titleContainerClass = 'application-slide-bucket-container-card-title',
            descriptionContainerClass = 'application-slide-bucket-container-card-description',
            newCard = $('#' + me.CARD_TEMPLATE_ID).children().clone(true),
            imageContainer = newCard.find('.' + imageContainerClass),
            titleContainer = newCard.find('.' + titleContainerClass),
            titleContainerPNode = newCard.find('.' + titleContainerClass + ' p'),
            descriptionContainer = newCard.find('.' + descriptionContainerClass);

        newCard.attr('id', 'application-slide-bucket-container-card-' + id);
        imageContainer.attr({
            'id' : imageContainerClass + '-' + id,
            'src' : image
        });
        titleContainer.attr('id', titleContainerClass + '-' + id);
        titleContainerPNode.html(title);
        descriptionContainer.attr('id', descriptionContainerClass + '-' + id).html(content);
        
        return newCard;
    };

    $(window).on('cch.ui.resized', function (args) {
        me.resized(args);
    });

    $('#' + me.SLIDE_TAB_ID).on('click', me.toggle);

    return {
        open: me.open,
        close: me.close,
        toggle : me.toggle,
        addCard : me.addCard,
        createCard : me.createCard,
        isClosed : me.isClosed
    };
};