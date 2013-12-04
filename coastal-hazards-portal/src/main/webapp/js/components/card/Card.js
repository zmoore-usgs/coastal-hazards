/*jslint browser: true*/
/*global $*/
/*global window*/
/*global OpenLayers*/
/*global CCH*/

/**
 * Represents a product as a card
 * 
 * Emits: 
 * window: "item-button-click-bucket-add"
 * window: "item-button-click-bucket-remove"
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
    me.SELECTION_CONTROL_CLASS = 'application-card-children-selection-control';
    me.BUCKET_BUTTON_SELECTOR = '>div:nth-child(2)>div:nth-child(2)>div>span>button:nth-child(3)';
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
    me.wmsService = me.product.wmsService || {};
    me.wmsEndpoint = me.wmsService.endpoint || '';
    me.wmsLayers = me.wmsService.layers || [];
    me.layer = null;
    me.container = null;
    me.descriptionContainer = null;
    // Is the card hidden by default? We probably want it to be false when creating
    // an accordion bellow but true when creating a card appendage since we will
    // want to have an effect to display it
    me.initHide = args.initHide === false ? false : true;
    // If this card has no parent, it is a top level card - probably an
    // accordion bellow
    me.parent = args.parent;
    me.child = args.child;
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
            effect = args.effect || 'slide',
            easing = args.easing || 'swing',
            complete = args.complete || null;

        me.container.show({
            effect : effect,
            easing : easing,
            duration : duration,
            complete : complete,
            direction : 'up'
        });
    };

    me.hide = function (args) {
        args = args || {};
        
        var duration = args.duration || 500,
            effect = args.effect || 'slide',
            easing = args.easing || 'swing',
            complete = args.complete || null;
    
        me.container.hide({
            effect : effect,
            easing : easing,
            duration : duration,
            complete : complete,
            direction : 'up'
        });
    };
    
    me.close = function () {
        // I'd like to send this close command all the way down the chain to my
        // children so they close from the bottom up
        if (me.child) {
            me.child.close();
        }
            // If I have a parent, I am not an accordion item, so I will let my 
            // parent close me
            if (me.parent) {
                // I have a parent, so I am not an accordion item. 
                me.parent.closeChild();
            } else {
                // My parent is an accordion bellow, so we just need to cllck on
                // it to close me
                me.container.parent().parent().parent().find('.panel-heading a').trigger('click');
            }
    };
    
    me.closeChild = function () {
        var control = me.container.find('.' + me.SELECTION_CONTROL_CLASS);
            me.child.removeSelf();
            control.val('');
    };
    
    me.removeSelf = function () {
        if (me.child) {
            me.child.removeSelf();
        }
        me.hide({
            complete : function () {
                me.container.remove();
            }
        });
    };

    me.bindSelectControl = function(control) {
        if (!control) {
            throw "control not passed to CCH.Objects.Card.bindSelectControl()";
        }
        
        control.on('change', function(evt) {
            // My dropdown list has changed
            var control = $(evt.target),
                    selectedOption = control.val(),
                    card,
                    createCard = function() {
                        // User selected a product. I will append that card to 
                        // myself
                        card = CCH.cards.buildCard({
                            product: selectedOption,
                            parent: me
                        });

                        // This is now my child card 
                        me.child = card;

                        // Append this new card to myself
                        me.container.after(card.getContainer());

                        // Show this new card to the user
                        card.show();
                    };

            if (selectedOption) {
                // Do I have a child? If I do, hide it and get rid of it.
                // The user wants a new card
                if (me.child) {
                    // I am going to hide my child first, then remove it
                    me.child.hide({
                        complete: function() {
                            // Remove my child after it's hidden
                            me.child.removeSelf();
                            // Now that my child is gone, I'm going to 
                            // replace it with a new card
                            createCard();
                        }
                    });
                } else {
                    // I have no children so I am free to go ahead and 
                    // just create a new child card
                    createCard();
                }
            } else {
                // User selected blank option which means user wants my 
                // gone so I will go ahead and remove it
                me.child.removeSelf();
            }
        });
        
        return control;
    };
    
    me.bindBucketControl = function (control) {
        if (!control) {
            throw "control not passed to CCH.Objects.Card.bindBucketControl()";
        }
        
        control.on('click', function (evt) {
            var button = $(evt.target);
            button.button('toggle');
            
            if (button.hasClass('active')) {
                // User pressed bucket button in and wants to add me to a bucket
                $(window).trigger('bucket-add', {
                    item : me.product
                });
            } else {
                // User toggled the bucket button off - I should be removed from 
                // bucket
                $(window).trigger('bucket-remove', {
                    item : me.product
                });
            }
        });
    };
    
    me.bindPropertyAggButton = function (control) {
        control.on('click', function (evt) {
            var button = $(evt.target),
                control = me.container.find('.' + me.SELECTION_CONTROL_CLASS);

            button.button('toggle');
            control.toggleClass('hidden');

            // If my dropdown listbox is hidden, I am going to hide my 
            // child
            if (control.hasClass('hidden') && me.child) {
                me.child.removeSelf();
                control.val('');
            };
        });
    };
    
    me.bindMinMaxButtons = function (control) {
        control.on('click', function (evt) {
            // A user has clicked on my min/max button. 
            // FInd out which one by querying an ancestor that has the 
            // closed/open class on it
            var isOpen = me.container.hasClass('open');

            if (isOpen) {
                me.close();
            } else {
                me.open();
            }
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
                mediumTitleContainer = container.find('.application-card-title-container-medium'),
                mediumContentContainer = container.find('.application-card-content-container-medium'),
                childrenSelectControl = container.find('.' + me.SELECTION_CONTROL_CLASS),
                minMaxButtons = container.find('.application-card-collapse-icon-container'),
                controlContainer = container.find('.application-card-control-container'),
                spaceAggButton = $('<button />').addClass('btn btn-default disabled').html('Space'),
                propertyAggButton = $('<button />').addClass('btn btn-default').html('Property'),
                bucketButton = $('<button />').addClass('btn btn-default').html('Bucket'),
                infoButton = $('<a />').
                    addClass('btn btn-default').
                    html('Info').
                    attr({
                        'role': 'button',
                        'target' : 'portal_info_window',
                        'href' : window.location.origin + CCH.CONFIG.contextPath + '/ui/info/item/' + me.id
                    });

            // My container starts out open so I immediately add that class to it
            container.addClass('open');

            // Create Title
            mediumTitleContainer.html(mediumTitle);

            // Create Content
            mediumContentContainer.html(mediumContent);

            // I have either aggregations or leaf nodes as children.
            // I am not myself a child.
            if (me.children.length) {
                childrenSelectControl.append($('<option />').
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
                                item: child,
                                displayNotification: false,
                                callbacks: {
                                    success: [processOption],
                                    error: [
                                        function (jqXHR, textStatus, errorThrown) {
                                            CCH.ui.displayLoadingError({
                                                errorThrown: errorThrown,
                                                splashMessage: '<b>Oops! Something broke!</b><br /><br />There was an error communicating with the server. The application was halted.<br /><br />',
                                                mailTo: 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load Any Items (' + errorThrown + ')'
                                            });
                                        }
                                    ]
                                }
                            });
                        }
                    }
                });

                // Add buttons to the bottom
                controlContainer.append(spaceAggButton, propertyAggButton, bucketButton);
                me.bindPropertyAggButton(propertyAggButton);
                me.bindSelectControl(childrenSelectControl);
            } else {
                childrenSelectControl.remove();
                controlContainer.append(bucketButton, infoButton);
            }

            me.bindBucketControl(bucketButton);
            me.bindMinMaxButtons(minMaxButtons);

            // I start with my container hidden and an upstream process will
            // decide when to show me
            if (me.initHide) {
                container.css({
                    display : 'none'
                });
            }
            
            me.container = container;
        }
        return me.container;
    };
    
    $(window).on({
        'bucket-add': function (evt, args) {},
        'bucket-remove': function (evt, args) {
            args = args || {};
            var id = args.id,
                bucketButton = me.container.find(me.BUCKET_BUTTON_SELECTOR);
        
            if (id && me.id === id && bucketButton.hasClass('active')) {
                bucketButton.button('toggle');
            }
        }
    });

    CCH.LOG.info('Card.js::constructor:Card class is initialized.');

    return {
        id: me.id,
        product: me.product,
        show : me.show,
        hide : me.hide,
        close : me.close,
        child : me.child,
        closeChild : me.closeChild,
        removeSelf : me.removeSelf,
        getBoundingBox: function () {
            return me.bbox;
        },
        getContainer: me.createContainer
    };

};