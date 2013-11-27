/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global splashUpdate*/

/**
 * A slide widget that shows up when items are searched for
 * 
 * Events Emitted:
 * 
 * Events Listened To: 
 * body: 'click'
 * window: 'cch.ui.resized'
 * 
 * @param {type} args
 * @returns {CCH.Objects.SearchSlide.Anonym$8}
 */
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
    me.SLIDE_CONTENT_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-content').attr('id');
    me.APP_CONTAINER_ID = 'content-row';
    me.LOCATION_CARD_TEMPLATE_ID = 'application-slide-search-location-card-template';
    me.LOCATION_SLIDE_SEARCH_CONTAINER_ID = 'application-slide-search-location-results-content-container';
    me.PRODUCT_CARD_TEMPLATE_ID = 'application-slide-search-product-card-template';
    me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID = 'application-slide-search-product-results-content-container';
    me.SLIDE_SEARCH_CONTAINER_PARENT_ID = 'application-slide-search-content-container';

    me.smallOffset = 10;
    me.borderWidth = 2;
    me.animationTime = 500;
    me.placement = 'right';
    me.isSmall = args.isSmall;
    me.startClosed = true;
    me.isInitialized = false;
    me.isClosed = me.startClosed;

    me.clear = function () {
        $('#' + me.LOCATION_SLIDE_SEARCH_CONTAINER_ID).empty();
        $('#' + me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID).empty();
    };

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
            appContainerId = $('#' + me.APP_CONTAINER_ID),
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
            slideContainer.height(appContainerId.outerHeight());
            slideContent.width(slideContainer.outerWidth() - me.borderWidth);
        }
    };

    me.getExtents = function () {
        var appContainerId = $('#' + me.APP_CONTAINER_ID),
            extents = {
                large: {
                    top: appContainerId.offset().top,
                    left: appContainerId.offset().left + 150
                },
                small: {
                    // top is handled by css file
                    left: appContainerId.offset().left + me.smallOffset
                }
            };

        return extents;
    };

    me.displaySearchResults = function (args) {
        args = args || {};

        var data = args.data || {},
            locations = data.locations || [],
            products = data.items || [],
            product,
            locationSize = locations.length,
            productsSize = products.length,
            type = args.type,
            items = [],
            itemsIdx,
            locationIdx;

        if (data) {
            switch (type) {
            case 'location':
                if (locationSize > 0) {
                    for (locationIdx = 0; locationIdx < locationSize; locationIdx++) {
                        items.push(me.buildLocationSearchResultItem({
                            location: locations[locationIdx],
                            spatialReference: data.spatialReference
                        }));
                    }
                    if (items.length) {
                        $('#' + me.LOCATION_SLIDE_SEARCH_CONTAINER_ID).append(items);
                        if (me.isClosed) {
                            me.open();
                        }
                    }
                }
                break;

            case 'item':
                if (productsSize > 0) {
                    for (itemsIdx = 0; itemsIdx < productsSize; itemsIdx++) {
                        product = products[itemsIdx];
                        items.push(me.buildProductSearchResultItem({
                            product : product
                        }));
                    }
                    if (items.length) {
                        $('#' + me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID).append(items);
                        if (me.isClosed) {
                            me.open();
                        }
                    }
                }
                break;
            }
        }
    };

    me.buildProductSearchResultItem = function (args) {
        args = args || {};

        if (args.product) {
            var product = args.product,
                image = args.image || 'https://2.gravatar.com/avatar/15fcf61ab6fb824d11f355d7a99a1bbf?d=https%3A%2F%2Fidenticons.github.com%2Fd55c695700043438ce4162cbe589e072.png',
                attr = product.attr,
                type = product.type,
                productType = product.itemType,
                bbox = product.bbox,
                id = product.id,
                summary = product.summary.medium,
                title = summary.title,
                description = summary.text,
                wfsEndpoint = product.wfsService,
                wmsEndpoint = product.wmsService,
                newItem = $('#' + me.PRODUCT_CARD_TEMPLATE_ID).children().clone(true),
                imageContainerClass = 'application-slide-search-product-card-image',
                titleContainerClass = 'application-slide-search-product-card-title',
                descriptionContainerClass = 'application-slide-search-product-card-description',
                imageContainer = newItem.find('.' + imageContainerClass),
                titleContainer = newItem.find('.' + titleContainerClass),
                titleContainerPNode = newItem.find('.' + titleContainerClass + ' p'),
                descriptionContainer = newItem.find('.' + descriptionContainerClass);

            newItem.attr('id', 'application-slide-search-product-card-' + id);
            imageContainer.attr({
                'id' : imageContainerClass + '-' + id,
                'src' : image
            });
            titleContainer.attr('id', titleContainerClass + '-' + id);
            titleContainerPNode.html(title);
            descriptionContainer.attr('id', descriptionContainerClass + '-' + id).html(description);
            
            return newItem;
        }
    };

    me.buildLocationSearchResultItem = function (args) {
        args = args || {};
        var id = args.id || new Date().getMilliseconds(),
            image = args.image || 'https://2.gravatar.com/avatar/15fcf61ab6fb824d11f355d7a99a1bbf?d=https%3A%2F%2Fidenticons.github.com%2Fd55c695700043438ce4162cbe589e072.png',
            location = args.location,
            attributes = location.feature.attributes,
            name = location.name,
            spatialReference = args.spatialReference,
            newItem = $('#' + me.LOCATION_CARD_TEMPLATE_ID).children().clone(true),
            imageContainerClass = 'application-slide-search-location-card-image',
            titleContainerClass = 'application-slide-search-location-card-title',
            descriptionContainerClass = 'application-slide-search-location-card-description',
            tableClass = 'application-slide-search-location-card-table',
            imageContainer = newItem.find('.' + imageContainerClass),
            titleContainer = newItem.find('.' + titleContainerClass),
            titleContainerPNode = newItem.find('.' + titleContainerClass + ' p'),
            descriptionContainer = newItem.find('.' + descriptionContainerClass),
            table = newItem.find('.' + tableClass),
            type = attributes.Type,
            region = attributes.Region,
            subregion = attributes.Subregion,
            newRow,
            buildRow = function (col1data, col2data) {
                return $('<tr />').append(
                    $('<td />').html(col1data),
                    $('<td />').html(col2data)
                );
            };

        newItem.attr('id', 'application-slide-search-location-card-' + id);
        imageContainer.attr({
            'id' : imageContainerClass + '-' + id,
            'src' : image
        });
        titleContainer.attr('id', titleContainerClass + '-' + id);
        titleContainerPNode.html(name);
        descriptionContainer.attr('id', descriptionContainerClass + '-' + id).html('');

        if (type) {
            newRow = buildRow('Type', type);
            table.append(newRow);
        }
        if (region) {
            newRow = buildRow('Region', region);
            table.append(newRow);
        }
        if (subregion) {
            newRow = buildRow('Subregion', subregion);
            table.append(newRow);
        }

        return newItem;
    };

    $(window).on('cch.ui.resized', function (args) {
        me.resized(args);
    });

    $('body').on('click', function (evt) {
        if (!me.isClosed) {
            var target = $(evt.target),
                targetId = target.attr('id') || '',
                parentContainer = $('#' + me.SLIDE_SEARCH_CONTAINER_PARENT_ID),
                clickOutsideContainer = parentContainer.attr('id') !== targetId
                    && parentContainer.find(evt.target).length === 0;

            if (clickOutsideContainer) {
                // The click came from outside the container
                me.toggle();
            }
        }
    });

    return {
        open: me.open,
        close: me.close,
        toggle : me.toggle,
        clear : me.clear,
        isClosed : me.isClosed,
        displaySearchResults : me.displaySearchResults
    };
};