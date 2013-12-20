/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global splashUpdate*/

/**
 * Emits: 
 * window: 'bucket-remove'
 * 
 * Listeners:
 * window: 'cch.ui.resized'
 * 
 * @param {type} args
 * @returns {CCH.Objects.BucketSlide.Anonym$12}
 */
CCH.Objects.BucketSlide = function (args) {
    "use strict";
    CCH.LOG.debug('CCH.Objects.BucketSlide::constructor: BucketSlide class is initializing.');
    args = args || {};

    if (!args.containerId) {
        throw 'containerId is required when initializing a bucket slide';
    }
    var me = (this === window) ? {} : this;

    me.SLIDE_CONTAINER_ID = args.containerId;
    me.MAP_DIV_ID = args.mapdivId || 'map';
    me.SLIDE_CONTENT_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-content').attr('id');
    me.CLOSE_BUTTON_SELECTOR = '#' + me.SLIDE_CONTAINER_ID + '> div > div.application-slide-controlset';
    me.TOP_LEVEL_BUTTON_CONTAINER_SELECTOR = '#' + me.SLIDE_CONTAINER_ID + '> div > div:first-child() > div:first-child() > div:nth-child(2)';
    me.TOP_LEVEL_BUTTON_CLEAR_SELECTOR = me.TOP_LEVEL_BUTTON_CONTAINER_SELECTOR + '> button:nth-child(1)';
    me.TOP_LEVEL_BUTTON_SHARE_SELECTOR = me.TOP_LEVEL_BUTTON_CONTAINER_SELECTOR + '> button:nth-child(2)';
    me.TOP_LEVEL_BUTTON_DOWNLOAD_SELECTOR = me.TOP_LEVEL_BUTTON_CONTAINER_SELECTOR + '> button:nth-child(3)';
    me.CARD_TEMPLATE_ID = 'application-slide-bucket-container-card-template';
    me.SLIDE_CONTENT_CONTAINER = 'application-slide-bucket-content-container';
    me.EMPTY_TEXT_CONTAINER = $('#' + me.SLIDE_CONTAINER_ID).find('> div > div > #application-slide-bucket-content-empty');
    me.borderWidth = 2;
    me.animationTime = 500;
    me.placement = 'right';
    me.isSmall = args.isSmall;
    me.startClosed = true;
    me.isInitialized = false;
    me.isClosed = me.startClosed;
    me.cards = [];

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
            windowWidth = $(window).outerWidth();

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
                slideContainer.css({
                    left: windowWidth
                });
            } else {
                slideContainer.offset(toExtent);
            }
            slideContainer.width(windowWidth - toExtent.left);
            slideContent.width(slideContainer.outerWidth() - me.borderWidth);
        } else {
            if (me.isClosed) {
                slideContainer.css({
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
                    // top is handled by css
                    left: 10
                }
            };

        return extents;
    };

    me.getCard = function (args) {
        args = args || {};

        var id = args.id,
            existingIndex,
            $card;

        if (id) {
            existingIndex = me.getCardIndex(id);

            if (existingIndex !== -1) {
                $card = me.cards[existingIndex];
            }
        }

        return $card;
    };

    me.getCardIndex = function (id) {
        return me.cards.findIndex(function (i) {
            return i.data('id') === id;
        });
    };

    me.add = function (args) {
        args = args || {};
        var item = args.item,
            $card;

        if (item && !me.getCard({ id : item.id })) {
            me.EMPTY_TEXT_CONTAINER.addClass('hidden');
            $(me.TOP_LEVEL_BUTTON_CONTAINER_SELECTOR).removeClass('hidden');
            $card = me.createCard({
                item : item
            });
            me.cards.push($card);
            $('#' + me.SLIDE_CONTENT_CONTAINER).append($card.clone(true));
        }

        return $card;
    };

    /**
     * Removes a card from the slider. Passing in no args will clear everything
     * from the slider
     */
    me.remove = function (args) {
        args = args || {};

        var id = args.id,
            card;

        if (id) {
            card = me.getCard({ id : id });
            me.cards.removeAt(me.getCardIndex(id));
            card.remove();

            if (!me.cards.length) {
                $(me.TOP_LEVEL_BUTTON_CONTAINER_SELECTOR).addClass('hidden');
                me.EMPTY_TEXT_CONTAINER.removeClass('hidden');
            }
        } else {
            // I find the best way of doing this so it affects two parts of the 
            // application is to bubble this event up to the window level and
            // have Bucket class catch it, remove the item from itself and then 
            // the bucket class will actually call this function with a proper
            // id. It's a long way around removing the item but it does hit 
            // multiple components
            me.cards.each(function ($card, index, cards) {
                $(window).trigger('bucket-remove', {
                    id : $card.data('id')
                });
            });
        }

        return card;
    };

    me.rebuild = function (args) {
        var $container = $('#' + me.SLIDE_CONTENT_CONTAINER);
        
        $container.empty();
        me.cards.each(function ($card) {
            $container.append($card.clone(true));
        });
        
        return $container;
    };

    /**
     * Moves a card both in the internal cards array as well as in the view
     */
    me.moveCard = function (args) {
        var id = args.id,
            direction = args.direction,
            cardIndex = me.getCardIndex(id),
            card;

        // Make sure I find the card in my cards array
        if (cardIndex !== -1) {
            card = me.cards[cardIndex];
            // Make sure I'm not trying to move out of bounds
            if ((direction === -1 && cardIndex !== 0) ||
                    (direction === 1 && cardIndex !== me.cards.length - 1)) {
                me.cards.removeAt(cardIndex).splice(cardIndex + direction, 0, card);
            }
        }
        me.rebuild();
        return me.cards;
    };

    me.createCard = function (args) {
        args = args || {};
        var item = args.item,
            id = item.id || new Date().getMilliseconds(),
            title = item.summary.tiny.text || 'Title Not Provided',
            content = item.summary.medium.text || 'Description Not Provided',
            titleContainerClass = 'application-slide-bucket-container-card-title',
            descriptionContainerClass = 'application-slide-bucket-container-card-description',
            card = $('#' + me.CARD_TEMPLATE_ID).children().clone(true),
            titleContainer = card.find('.' + titleContainerClass),
            titleContainerPNode = card.find('.' + titleContainerClass + ' p'),
            descriptionContainer = card.find('.' + descriptionContainerClass),
            removeButton = card.find('>div>div:nth-child(3)>button:nth-child(1)'),
            upButton = card.find('>div>div:nth-child(3)>button:nth-child(2)'),
            downButton = card.find('>div>div:nth-child(3)>button:nth-child(3)'),
            viewButton = card.find('>div:nth-child(2)>div>button:nth-child(1)'),
            shareButton = card.find('>div:nth-child(2)>div>button:nth-child(2)'),
            downloadButton = card.find('>div:nth-child(2)>div>button:nth-child(3)'),
            infoButton = card.find('>div:nth-child(2)>div.btn-group>a'),
            imageContainer = card.find('img'),
            moreInfoBadge = $('<span />').
                    addClass('badge more-info-badge').
                    append($('<a />').
                        html('More Info').
                        attr({
                        'target' : 'portal_info_window',
                        'href' : window.location.origin + CCH.CONFIG.contextPath + '/ui/info/item/' + id
                    }));

        card.attr('id', 'application-slide-bucket-container-card-' + id);
        imageContainer.attr('src', 'http://www.tshirtdesignsnprint.com/img/not-found.png');
        titleContainer.attr('id', titleContainerClass + '-' + id);
        titleContainerPNode.html(title);
        descriptionContainer.
            attr('id', descriptionContainerClass + '-' + id).
            html(content).
            append(moreInfoBadge);
        card.data('id', id);

        removeButton.on('click', function () {
            // I emit this to the top so that bucket can catch it, decrement itself
            // and then pass on the remove back down here to my remove method
            $(window).trigger('bucket-remove', {
                id : id
            });
        });

        downloadButton.on('click', function () {
            window.location = window.location.origin + CCH.CONFIG.contextPath + '/data/download/item/' + id;
        });

        viewButton.on('click', function () {
            item.toMap();
        });

        upButton.on('click', function () {
            me.moveCard({
                id : id,
                direction : -1
            });
        });

        downButton.on('click', function() {
            me.moveCard({
                id : id,
                direction : 1
            });
        });

        infoButton.attr({
            'target' : 'portal_info_window',
            'href' : window.location.origin + CCH.CONFIG.contextPath + '/ui/info/item/' + id
        });

        return card;
    };

    $(window).on('cch.ui.resized', function (args) {
        me.resized(args);
    });

    $(me.CLOSE_BUTTON_SELECTOR).on('click', function (evt) {
        me.toggle();
    });

    $(me.TOP_LEVEL_BUTTON_CLEAR_SELECTOR).on('click', function (evt) {
        me.remove();
    });
    $(me.TOP_LEVEL_BUTTON_SHARE_SELECTOR).on('click', function (evt) {
    });
    $(me.TOP_LEVEL_BUTTON_DOWNLOAD_SELECTOR).on('click', function (evt) {
    });

    CCH.LOG.debug('CCH.Objects.BucketSlide::constructor: BucketSlide class initialized.');
    return {
        open: me.open,
        close: me.close,
        toggle : me.toggle,
        add : me.add,
        remove : me.remove,
        getCard : me.getCard,
        createCard : me.createCard,
        moveCard : me.moveCard,
        isClosed : me.isClosed,
        cards : me.cards,
        CLASS_NAME : 'CCH.Objects.BucketSlide'
    };
};