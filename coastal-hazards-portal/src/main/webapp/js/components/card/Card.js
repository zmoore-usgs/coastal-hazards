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
    me.CARD_TEMPLATE_ID = args.cardTemplateId || 'application-slide-items-container-card-template';
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
    me.children = me.product.children || [];
    me.layer = null;
    me.container = null;
    me.descriptionContainer = null;
    me.layer = (function () {
        var layer = new OpenLayers.Layer.WMS(
                me.product.id,
                me.product.wmsService.endpoint,
                {
                    layers: me.product.wmsService.layers,
                    format: 'image/png',
                    transparent: true,
                    sld: CCH.CONFIG.publicUrl + '/data/sld/' + me.product.id,
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
    // 0 = open, 1 = closed
    me.state = 0;
    
    me.aggregationClickHandler = function (evt) {
        if (me.state === 0) {
            me.open();
        } else {
            me.close();
        }
    };
    
    me.createContainer = function () {
        var templateParent = $('#' + me.CARD_TEMPLATE_ID).clone(true),
            summary = me.summary,
            fullSummary = summary.full,
            mediumSummary = summary.medium,
            container,
            titleContainer,
            contentContainer,
            largeTitle = fullSummary.title,
            mediumTitle = mediumSummary.title,
            largeContent = fullSummary.text,
            mediumContent = mediumSummary.text,
            largeTitleContainer,
            mediumTitleContainer,
            largeContentContainer,
            mediumContentContainer;
        
        if (me.children.length > 0) {
            // If I am an aggregation, I expect to be an accordion item with an
            // accordion
            container = templateParent.find('.' + me.AGGREGATION_CONTAINER_CARD);
            titleContainer = container.find('.card-title-container');
            contentContainer = container.find('.card-content-container');
            largeTitleContainer = titleContainer.find('.card-title-container-large');
            mediumTitleContainer = titleContainer.find('.card-title-container-medium');
            largeContentContainer = contentContainer.find('.card-content-container-large');
            mediumContentContainer = contentContainer.find('.card-content-container-medium');
            
            largeTitleContainer.html(largeTitle);
            mediumTitleContainer.html(mediumTitle);
            largeContentContainer.html(largeContent);
            mediumContentContainer.html(mediumContent);
            
            container.attr({
                id : 'accordion-group' + me.id
            });
            
            titleContainer.attr({
                href : '#accordion-body-' + me.id
            });
            
            contentContainer.attr({
               id : 'accordion-body-' + me.id 
            });
            
        } else {
            // If I am a regular card, I expect to not have an inner accordion
            container = templateParent.find('.' + me.PRODUCT_CONTAINER_CARD);
            titleContainer = container.find('.card-title-container');
            contentContainer = container.find('.card-content-container');
            largeTitleContainer = titleContainer.find('.card-title-container-large');
            mediumTitleContainer = titleContainer.find('.card-title-container-medium');
            largeContentContainer = contentContainer.find('.card-content-container-large');
            mediumContentContainer = contentContainer.find('.card-content-container-medium');
            
            
            largeTitleContainer.html(largeTitle);
            mediumTitleContainer.html(mediumTitle);
            largeContentContainer.html(largeContent);
            mediumContentContainer.html(mediumContent);
            
            container.attr({
                id : 'accordion-group' + me.id
            });
            
            titleContainer.attr({
                href : '#accordion-body-' + me.id
            });
            
            contentContainer.attr({
               id : 'accordion-body-' + me.id 
            });
            
        }
        
        container.on('click', me.aggregationClickHandler);
        
        return container;
    };
    
    me.createDescriptionContainer = function () {
        
    };
    
    CCH.LOG.info('Card.js::constructor:Card class is initialized.');

    return {
        getItemId: function () {
            return me.item.id;
        },
        getBoundingBox: function() {
            return me.bbox;
        },
        getContainer: function() {
            if (me.container === null) {
                me.container = me.createContainer();
            }
            return me.container;
        }
    };

};