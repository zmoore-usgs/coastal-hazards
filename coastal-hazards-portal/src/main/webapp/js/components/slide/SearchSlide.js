/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global splashUpdate*/
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
    me.SLIDE_SEARCH_CONTAINER_ID = 'application-slide-search-location-results-content-container';
    me.SLIDE_SEARCH_CONTAINER_PARENT_ID = 'application-slide-search-content-container';

    me.borderWidth = 2;
    me.animationTime = 500;
    me.placement = 'right';
    me.isSmall = args.isSmall;
    me.startClosed = true;
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
            dropShadowWidth = 7;
        container.animate({
            left: $(window).width() + dropShadowWidth
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
            slideContent = $('#' + me.SLIDE_CONTENT_ID),
            appContainerId = $('#' + me.APP_CONTAINER_ID),
            windowWidth = $(window).outerWidth(),
            windowHeight = $(window).outerHeight();

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
                    top: appContainerId.offset().top,
                    left: appContainerId.offset().left
                }
            };

        return extents;
    };

    me.displaySearchResults = function (args) {
        args = args || {};

        var data = args.data || {},
            locations = args.data.locations || [],
            locationSize = locations.length,
            type = args.type,
            items = [],
            locationIdx;

        switch (type) {
        case 'location':
            if (locationSize > 0) {
                for (locationIdx = 0; locationIdx < locationSize; locationIdx++) {
                    items.push(me.buildLocationSearchResultItem({
                        location: locations[locationIdx],
                        spatialReference: data.spatialReference
                    }));
                }
            }
            break;
        }

        if (items.length) {
            $('#' + me.SLIDE_SEARCH_CONTAINER_ID).append(items);
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

        newItem.attr('id', 'application-slide-bucket-container-card-' + id);
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
        isClosed : me.isClosed,
        displaySearchResults : me.displaySearchResults
    };
};