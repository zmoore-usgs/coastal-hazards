/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global window*/
/*global OpenLayers*/
/*global CCH*/
CCH.Objects.Card = function (args) {
    "use strict";
    CCH.LOG.info('Card.js::constructor:Card class is initializing.');

    var me = (this === window) ? {} : this;

    if (!args.item) {
        throw 'An item was not passed into the card constructor';
    }

    me.item = args.item;
    me.bbox = me.item.bbox;
    me.type = me.item.type;
    me.summary = me.item.summary;
    me.name = me.item.name;
    me.attr = me.item.attr;
    me.service = me.item.service;
    me.htmlEntity = null;
    me.size = args.size;
    me.pinned = false;
    me.pinButton = null;
    me.layer = null;
    me.sizeDescription = CCH.ui.isSmall() ? 'small' : 'large';
    
    me.pinButton = $('<span />')
            .append($('<i />')
                    .addClass('slide-menu-icon icon-pushpin muted pull-left'))
            .on({
            'mouseover': function () {
                $(this).find('i').removeClass('muted');
            },
            'mouseout': function () {
                $(this).find('i').addClass('muted');
            },
            'click': function () {
                $(me).trigger('card-button-pin-clicked', me);
            }
        });
    me.titleRow = $('<div />').addClass('description-title-row row-fluid unselectable').
                append(me.pinButton, $('<a />').addClass('description-title span11').attr({
            'href': CCH.CONFIG.contextPath + '/ui/info/item/' + me.item.id,
            'target': 'portal_view_window'
        }).html(me.summary.medium.title));
    me.descriptionRow = $('<div />').addClass('description-description-row row-fluid').
            append($('<p />').addClass('slide-description').html(me.summary.medium.text));
    me.container = $('<div />').addClass('description-container container-fluid').
            addClass('description-container-' + me.sizeDescription + ' description-container-' + me.type).
            append(me.titleRow, me.descriptionRow);

    me.buildLayer = function () {
        var layer = new OpenLayers.Layer.WMS(
                me.item.id,
                me.item.wmsService.endpoint,
                {
                    layers: me.item.wmsService.layers,
                    format: 'image/png',
                    transparent: true,
                    sld: CCH.CONFIG.publicUrl + '/data/sld/' + me.item.id,
                    styles: 'cch'
                },
                {
                    projection: 'EPSG:3857',
                    isBaseLayer: false,
                    displayInLayerSwitcher: false,
                    isItemLayer: true, // CCH specific setting
                    bbox: me.bbox
                }
            );

        return layer;
    };

    me.pin = function () {
        me.pinButton.addClass('slider-card-pinned');
        me.pinned = true;
        $(me).trigger('card-pinned', me);
    };

    me.unpin = function () {
        me.pinButton.removeClass('slider-card-pinned');
        me.pinned = false;
        $(me).trigger('card-unpinned', me);
    };

    me.layer = me.buildLayer();
    
    CCH.LOG.info('Card.js::constructor:Card class is initialized.');

    return {
        pin: me.pin,
        unpin: me.unpin,
        getItemId: function () {
            return me.item.id;
        },
        getBoundingBox: function() {
            return me.bbox;
        },
        getContainer: function() {
            return me.container;
        }
    };

};