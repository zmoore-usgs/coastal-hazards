/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global ga*/

CCH.Objects.Accordion = function (args) {
    "use strict";

    CCH.LOG.info('Accordion.js::constructor:Accordion class is initializing.');
    var me = (this === window) ? {} : this,
        container;

    args = args || {};

    me.CONTAINER_ID = args.containerId || 'application-slide-items-content-container';
    me.isStopped = true;

    container = $('#' + me.CONTAINER_ID);

    // Make sure that our container is of the accordion type
    if (!container.hasClass('panel-group')) {
        container.addClass('panel-group');
    }

    me.load = function (args) {
        args = args || {};

        var callbacks = args.callbacks || {},
            id = args.id,
            index = args.index,
            item = new CCH.Objects.Item({ id : id });

        callbacks = args.callbacks || {
            success : [],
            error : []
        };

        callbacks.success.unshift(function (data, status) {
            if (status === 'success') {
                me.addCard({
                    item : CCH.items.getById({ id : data.id }),
                    index : index
                });
            }
        });

        item.load({
            callbacks : {
                success : callbacks.success,
                error : callbacks.error
            }
        });
    };

    /**
     * Uses a card to create a bellow out of
     */
    me.addCard = function (args) {
        args = args || {};

        var card = args.card,
            item = args.item,
            index = args.index,
            cardContainer,
            accordion = me.getAccordion(),
            bellow;

        // If we are passed a product, that means we were not passed a card
        if (item) {
            card = new CCH.Objects.Card({
                item : item,
                initHide : false
            });
        }

        cardContainer = card.getContainer();

        bellow = me.createBellow({
            container : cardContainer,
            card : card
        });

        // I want to insert the card into the accordion at a specified index if 
        // one was specified. This fixes a race condition in the pulling of the 
        // data for these cards 
        if (index === undefined || accordion.children().length === 0) {
            accordion.append(bellow);
        } else {
            if (index === 0) {
                accordion.prepend(bellow);
            } else {
                bellow.insertAfter(accordion.children().get(index - 1));
            }
        }

        return bellow;
    };

    me.createBellow = function (args) {
        args = args || {};

        var card = args.card,
            id = card.id,
            cardContainer = args.container,
            titleRow = cardContainer.find('.application-card-title-row'),
            titleMedium = titleRow.find('.application-card-title-container-medium').html(),
            group = $('<div />').addClass('panel panel-default'),
            heading = $('<div />').addClass('panel-heading'),
            titleContainer = $('<span />').addClass('panel-title'),
            toggleTarget = $('<a />').addClass('accordion-toggle'),
            accordionBody = $('<div />').addClass('panel-collapse collapse'),
            bodyInner = $('<div />').addClass('panel-body'),
            accordionBodyId = 'accordion-body-' + id,
            headingClickHandler = function (evt) {
                // Because clicking the link inside the header also triggers the 
                // click handler of the header, this will loop forever. Must unbind,
                // click, rebind
                evt.stopImmediatePropagation();
                $(evt.currentTarget).off('click', headingClickHandler);
                $(evt.currentTarget).find('a').trigger('click');
                $(evt.currentTarget).on('click', headingClickHandler);
            };

        toggleTarget.append(
            $('<span />').addClass('accordion-toggle-title-medium').html(titleMedium)
        ).attr({
            'data-parent' : '#' + me.CONTAINER_ID,
            'href' : '#' + accordionBodyId,
            'data-toggle' : 'collapse'
        });

        accordionBody.attr('id', accordionBodyId);
        accordionBody.data({
            'id' : id,
            'card' : card
        });

        bodyInner.append(cardContainer);

        titleRow.remove();

        group.append(heading, accordionBody);
        group.data('id', id);
        titleContainer.append(toggleTarget);
        heading.append(titleContainer);
        accordionBody.append(bodyInner);

        heading.on('click', headingClickHandler);

        accordionBody.on({
            'show.bs.collapse' : function () {
                card.show({
                    duration : 0
                });
            },
            'shown.bs.collapse' : function () {
                var $this = $(this),
                    abId = $this.data('id');

                ga('send', 'event', {
                    'eventCategory': 'accordion',
                    'eventAction': 'show',
                    'eventLabel': abId
                });
            },
            'hide.bs.collapse' : function () {},
            'hidden.bs.collapse' : function () {
                var $this = $(this),
                    abId = $this.data('id');

                ga('send', 'event', {
                    'eventCategory': 'accordion',   // Required.
                    'eventAction': 'hide',      // Required.
                    'eventLabel': abId
                });

                card.hide();
            }
        });

        return group;
    };

    me.getAccordion = function () {
        return $('#' + me.CONTAINER_ID);
    };

    me.getBellows = function () {
        return $('#' + me.CONTAINER_ID + ' .panel');
    };

    $(window).on('cch.slide.search.button.click.explore', function (evt, args) {
        // When a user clicks explore, I want to be able to search through every
        // item currently in the accordion slider starting with top level items
        // through their children. If found through the initial search, I want to 
        // be able to expand the accordion to that item as though the user has 
        // clicked in the item.  If the item isn't found, I want to load the item
        // and add it to the accordion.
        var id = args.id,
            idIdx = 0,
            ids = me.getBellows().map(function(ind, b) {
                return $(b).data().id;
            }),
            $bellow,
            $bellowTitle,
            $bellowBody,
            path = [],
            openPath;

        // Go down the top level items until we have a hit for an id
        if (ids.length > 0) {
            for (idIdx; idIdx < ids.length && path.length === 0; idIdx++) {
                path = CCH.items.getById({
                    id : ids[idIdx]
                }).pathToItem(id, path);
            }
        }

        // If I found the item in one of the bellows, open up the bellows and 
        // possibly child items down to where that item is found. If not, load
        // the item from the back-end and put it on the accordion
        if (path.length > 0) {
            $bellow = $(me.getBellows()[idIdx - 1]);
            $bellowTitle = $bellow.find('.accordion-toggle');
            $bellowBody = $bellow.find('.panel-collapse');

            openPath = function () {
                $bellowBody.off('shown.bs.collapse', openPath);

                if (path.length > 0) {
                    $bellowBody.data().card.showPath(path);
                }
            };

            // I remove the first index here because the first item is the bellow.
            // There's a check that's done in the 'pathToItem()' function that does
            // a similar check for id equality but I just short cut it here
            path = path.removeAt(0);
            
            // The action begins by opening a bellow. I check here to see if the 
            // bellow I want to open is already open. If not, bind openPath() to
            // the opened action. Otherwise, just call openPath() directly
            if ($bellowBody.hasClass('collapse')) {
                $bellowBody.on('shown.bs.collapse', openPath);
                $bellowTitle.trigger('click');
            } else {
                openPath();
            }
        } else {
            // I have to load the item since it doesn't yet live in the top level.
            // Once I load it, add it to the accordion
            me.load({
                'id' : path[0]
            });
        }

    });

    return $.extend(me, {
        add: me.addCard,
        load : me.load,
        CLASS_NAME : 'CCH.Objects.Accordion'
    });

};