/*jslint browser: true*/
/*global $*/
/*global window*/
/*global OpenLayers*/
/*global CCH*/

/**
 * Represents a product as a card
 * 
 * @param {type} args
 * @returns {CCH.Objects.Card.Anonym$2}
 */
CCH.Objects.Card = function (args) {
    "use strict";
    CCH.LOG.info('Card.js::constructor:Card class is initializing.');

    var me = (this === window) ? {} : this;

    if (!args.product) {
        throw 'A product was not passed into the card constructor';
    }
    me.CARD_TEMPLATE_ID = args.cardTemplateId || 'application-card-template';
    me.AGGREGATION_CONTAINER_CARD = args.aggregationContainerId || 'application-slide-items-aggregation-container-card';
    me.PRODUCT_CONTAINER_CARD = args.productContainerId || 'application-slide-items-product-container-card';
    me.product = args.product;
    me.id = me.product.id;
    me.bbox = me.product.bbox;
    me.type = me.product.type;
    me.itemType = me.product.itemType;
    me.summary = me.product.summary;
    me.name = me.product.name;
    me.attr = me.product.attr;
    me.service = me.product.service;
    me.children = me.product.children || [],
    me.wmsService = me.product.wmsService || {},
    me.wmsEndpoint = me.wmsService.endpoint || '',
    me.wmsLayers = me.wmsService.layers || [],
    me.layer = null;
    me.container = null;
    me.descriptionContainer = null;
    // Is the card hidden by default? We probably want it to be false when creating
    // an accordion bellow but true when creating a card appendage since we will
    // want to have an effect to display it
    me.initHide = args.initHide === false ? false : true;
    me.layer = (function () {
        var layer = new OpenLayers.Layer.WMS(
                me.id,
                me.wmsEndpoint,
                {
                    layers: me.wmsLayers,
                    format: 'image/png',
                    transparent: true,
                    sld: CCH.CONFIG.publicUrl + '/data/sld/' + me.id,
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
    }());
    
    me.show = function (args) {
        args = args || {};
        
        var duration = args.duration || 500,
            effect = args.effect || 'blind',
            easing = args.easing || 'swing',
            complete = args.complete || null,
            queue = args.queue || true;
            
        me.container.show({
            effect : effect,
            easing : easing,
            duration : duration,
            complete : complete,
            queue : queue
        });
    };
    
    me.hide = function() {
        args = args || {};
        
        var duration = args.duration || 500,
            effect = args.effect || 'blind',
            easing = args.easing || 'swing',
            complete = args.complete || null,
            queue = args.queue || true;
            
        me.container.hide({
            effect : effect,
            easing : easing,
            duration : duration,
            complete : complete,
            queue : queue
        });
    };
    
    me.createContainer = function () {
        if (!me.container) {
            var container = $('#' + me.CARD_TEMPLATE_ID).clone(true).children(),
                summary = me.summary,
                fullSummary = summary.full,
                mediumSummary = summary.medium,
                tinySummary = summary.tiny,
                largeTitle = fullSummary.title || '',
                mediumTitle = mediumSummary.title || largeTitle,
                smallTitle = tinySummary.title || mediumTitle,
                largeContent = fullSummary.text || '',
                mediumContent = mediumSummary.text || largeContent,
                smallContent = tinySummary.text || mediumContent,
                largeTitleContainer = container.find('.application-card-title-container-large'),
                mediumTitleContainer = container.find('.application-card-title-container-medium'),
                smallTitleContainer = container.find('.application-card-title-container-small'),
                largeContentContainer = container.find('.application-card-content-container-large'),
                mediumContentContainer = container.find('.application-card-content-container-medium'),
                smallContentContainer = container.find('.application-card-content-container-small'),
                childrenSelectControl = container.find('.application-card-children-selection-control'),
                controlContainer = container.find('.application-card-control-container'),
                spaceAggButton = $('<button />').addClass('btn disabled').html('Space'),
                propertyAggButton = $('<button />').addClass('btn').html('Property'),
                bucketButton = $('<button />').addClass('btn').html('Bucket');
        
            // Create Title
            largeTitleContainer.html(largeTitle);
            mediumTitleContainer.html(mediumTitle);
            smallTitleContainer.html(smallTitle);
            
            // Create Content
            largeContentContainer.html(largeContent);
            mediumContentContainer.html(mediumContent);
            smallContentContainer.html(smallContent);
            
            // This item has either aggregations or leaf nodes as children.
            // This item is not itself a child
            if (me.children.length) {
                childrenSelectControl.
                    append($('<option />').
                    attr('value', '')).
                    addClass('hidden');
                me.children.each(function (child) {
                    var option = $('<option />'),
                        item,
                        processOption = function (item) {
                            var name = item.summary.full.title ||
                                item.summary.medium.title ||
                                item.summary.tiny.title ||
                                child;
                            
                            option.html(name);
                            
                            return option;
                        };
                    
                    option.addClass('application-card-children-selection-control-option');
                    if (typeof child === 'string') {
                        item = CCH.items.getById(child);
                        // The child is a string. This means that we don't know
                        // anything about this child beyond its ID. We still
                        // have to load this object from the back-end. We will
                        // create the option element and fire off a request to
                        // the back end for more information
                        childrenSelectControl.append(option);
                        option.attr('value', child);
                        
                        if (item) {
                            // The item is already loaded in the items object
                            // so we don't have to go out and get it
                            processOption(item);
                        } else {
                            // The item was not already loaded so we will have 
                            // to go out and grab it.
                            CCH.items.load({
                                items: [child],
                                displayNotification: false,
                                callbacks: {
                                    success: [processOption],
                                    error: [
                                        function() {
                                            errorResponseHandler(
                                                null, 
                                                null, 
                                                'Search for children did not return a valid response');
                                        }
                                    ]
                                }
                            });
                        }
                    }
                });
                
                // Add buttons to the bottom
                controlContainer.append(spaceAggButton, propertyAggButton, bucketButton);
                propertyAggButton.on('click', function (evt) {
                    var button = $(evt.target);
                    button.button('toggle');
                    me.container.
                        find('.application-card-children-selection-control').
                        toggleClass('hidden');
                });
                childrenSelectControl.on('change', function (evt) {
                    var control = $(evt.target),
                        selectedOption = control.val(),
                        card;
                        
                    if (selectedOption) {
                        // User selected a product. We will append that to 
                        // this card
                        card = CCH.cards.buildCard({
                            product : selectedOption
                        });
                        me.container.after(card.getContainer());
                        card.show();
                    } else {
                        // User selected blank option. 
                    }
                });
            } else {
                childrenSelectControl.remove();
                controlContainer.append(bucketButton);
            }
            
            // We start with the container hidden and an upstream process will
            // decide when to show it
            if (me.initHide) {
                container.css({
                    display : 'none'
                });
            }
            
            me.container = container;
        }
        return me.container;
    };
    
    CCH.LOG.info('Card.js::constructor:Card class is initialized.');

    return {
        id: me.id,
        product: me.product,
        show : me.show,
        hide : me.hide,
        getBoundingBox: function() {
            return me.bbox;
        },
        getContainer: me.createContainer
    };

};