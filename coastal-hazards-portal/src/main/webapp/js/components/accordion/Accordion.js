/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/

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

    me.add = function (args) {
        var bellow = me.addCard(args);
        return bellow;
    };

    /**
     * Uses a card to create a bellow out of
     */
    me.addCard = function (args) {
        args = args || {};

        var card = args.card,
            index = args.index,
            cardContainer = card.getContainer(),
            bellow = me.createBellow({
                container : cardContainer,
                card : card,
                index : index
            });
            

        me.getAccordion().append(bellow);
        
        return bellow;
    };

    me.createBellow = function (args) {
        args = args || {};

        var id = args.card.id,
            cardContainer = args.container,
            titleRow = cardContainer.find('.application-card-title-row'),
            titleLarge = titleRow.find('.application-card-title-container-large').html(),
            titleMedium = titleRow.find('.application-card-title-container-medium').html(),
            titleSmall = titleRow.find('.application-card-title-container-small').html(),
            group = $('<div />').addClass('panel panel-default'),
            heading = $('<div />').addClass('accordion-heading'),
            toggleTarget = $('<a />').addClass('accordion-toggle'),
            accordionBody = $('<div />').addClass('accordion-body collapse'),
            bodyInner = $('<div />').addClass('accordion-inner'),
            accordionBodyId = 'accordion-body-' + id;

        toggleTarget.append(
            $('<span />').addClass('accordion-toggle-title-large').html(titleLarge),
            $('<span />').addClass('accordion-toggle-title-medium').html(titleMedium),
            $('<span />').addClass('accordion-toggle-title-small').html(titleSmall)
        ).attr({
            'data-parent' : '#' + me.CONTAINER_ID,
            'href' : '#' + accordionBodyId,
            'data-toggle' : 'collapse'
        });

        accordionBody.attr('id', accordionBodyId);

        bodyInner.append(cardContainer);

        titleRow.remove();

        group.append(heading, accordionBody);
        heading.append(toggleTarget);
        accordionBody.append(bodyInner);
        
        return group;
    };

    me.getAccordion = function () {
        return $('#' + me.CONTAINER_ID);
    };

    me.getBellows = function () {
        return $('#' + me.CONTAINER_ID + ' .panel');
    };

    $(window).on({
    });

    return $.extend(me, {
        add: me.add,
        stop: function () {
        },
        start: function () {
        },
    });

};