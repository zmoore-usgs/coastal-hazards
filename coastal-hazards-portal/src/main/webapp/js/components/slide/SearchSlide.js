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
    me.CLOSE_BUTTON_SELECTOR = '#' + me.SLIDE_CONTAINER_ID + '> div > div.application-slide-controlset';
    me.APP_CONTAINER_ID = 'content-row';
    me.LOCATION_CARD_TEMPLATE_ID = 'application-slide-search-location-card-template';
    me.LOCATION_SLIDE_SEARCH_CONTAINER_ID = 'application-slide-search-location-results-content-container';
    me.PRODUCT_CARD_TEMPLATE_ID = 'application-slide-search-product-card-template';
    me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID = 'application-slide-search-product-results-content-container';
    me.SLIDE_SEARCH_CONTAINER_PARENT_ID = 'application-slide-search-content-container';
    me.PRODUCT_SLIDE_SEARCH_PAGE_CONTAINER = 'application-slide-search-product-results-paging-container';

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
        $('.' + me.PRODUCT_SLIDE_SEARCH_PAGE_CONTAINER).find('>ul').empty();
    };

    me.open = function () {
        var slideContainer = $('#' + me.SLIDE_CONTAINER_ID),
            extents = me.getExtents(),
            toExtent = me.isSmall() ? extents.small : extents.large;
        if (me.isClosed) {
            slideContainer.removeClass('hidden');

            slideContainer.animate({
                left: toExtent.left
            }, me.animationTime, function () {
                me.isClosed = false;
                me.resize();
            });
        }
    };

    me.close = function (args) {
        if (!me.isClosed) {
            var slideContainer = $('#' + me.SLIDE_CONTAINER_ID);
            slideContainer.animate({
                left: $(window).width()
            }, me.animationTime, function () {
                me.isClosed = true;
                slideContainer.addClass('hidden');
                if (args && args.clearOnClose) {
                    me.clear();
                }
            });
        }
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
    me.resize = function () {
        var extents = me.getExtents(),
            toExtent = me.isSmall() ? extents.small : extents.large,
            $slideContainer = $('#' + me.SLIDE_CONTAINER_ID),
            $slideContent = $('#' + me.SLIDE_CONTENT_ID),
            $appContainerId = $('#' + me.APP_CONTAINER_ID),
            $cardContainer = $('#' + me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID).parent(),
            windowWidth = $(window).outerWidth();

        if (me.isClosed) {
            $slideContainer.addClass('hidden');
        } else {
            $slideContainer.removeClass('hidden');
        }

        if (me.isSmall()) {
            if (me.isClosed) {
                $slideContainer.css({
                    left: windowWidth
                });
            } else {
                $slideContainer.offset(toExtent);
            }
            $slideContainer.width(windowWidth - toExtent.left);
            $slideContent.width($slideContainer.outerWidth() - me.borderWidth);
        } else {
            if (me.isClosed) {
                $slideContainer.css({
                    left: windowWidth,
                    top: toExtent.top
                });
            } else {
                $slideContainer.offset(toExtent);
            }
            $slideContainer.width(windowWidth - toExtent.left);
            $slideContainer.height($appContainerId.outerHeight());
            $slideContent.width($slideContainer.width() - me.borderWidth);
            $cardContainer.height($slideContainer.height() - $cardContainer.siblings().toArray().sum(function(x) { 
                return $(x).outerHeight();
            }));
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
            $slideContainer,
            $pagingContainer,
            $pageButton,
            $pagingButtonGroup,
            $li,
            slidesPerPage = 3,
            itemPageCount,
            type = args.type,
            items = [],
            itemsIdx,
            item,
            locationIdx,
            pIdx;

        if (data) {
            switch (type) {
            case 'location':
                if (locationSize > 0) {
                    var revealCount = locationSize < 5 ? locationSize : 5, 
                        $moreToggle = $('<div />').
                            addClass('application-slide-search-location-card-toggle').
                            html('Show ' + revealCount + ' more'),
                        $card;
                
                    $slideContainer = $('#' + me.LOCATION_SLIDE_SEARCH_CONTAINER_ID);
                
                    for (locationIdx = 0; locationIdx < locationSize; locationIdx++) {
                        // I want to build a card for every search result item
                        $card = me.buildLocationSearchResultItem({
                            location: locations[locationIdx],
                            spatialReference: data.spatialReference
                        });
                        
                        // I want to add t
                        items.push($card);
                        
                        $slideContainer.append($card);
                        
                        if (locationSize > 1) {
                            if (locationIdx === 0) {
                                $slideContainer.append($moreToggle);
                            } else {
                                $card.addClass('hidden');
                            }
                        }
                    }
                    
                    $moreToggle.on('click', function ($evt) {
                        // The user has clicked on "Show More"
                        var $target = $($evt.target),
                            downstreamSiblings = $($evt.target).nextAll(),
                            rIdx = 0,
                            revealCount = 5,
                            showTxt,
                            $sibling;
                            
                            // Stop propagation of the event because the slide
                            // listens to body events and it might catch a click
                            // and toggle the slide.
                            $evt.stopImmediatePropagation();
                            
                            // Check how many siblings I pulled in. If fewer siblings
                            // are available than I default to show, only show
                            // those siblings by reducing the revealCount to 
                            // the sibling count
                            if (downstreamSiblings.length < revealCount) {
                                revealCount = downstreamSiblings.length;
                            }
                        
                            // Show the sublings 
                            for (rIdx; rIdx < revealCount; rIdx++) {
                                $sibling = $(downstreamSiblings[rIdx]);
                                $sibling.removeClass('hidden');
                            }
                            
                            // If there are still more siblings to show, put the
                            // reveal control after the last one I just showed.
                            // Otherwise, just remove the control
                            if (downstreamSiblings.length >= revealCount + 1) {
                                // Build the "show more" text
                                showTxt = downstreamSiblings.length  - revealCount < revealCount ? downstreamSiblings.length - revealCount : revealCount;
                                showTxt = 'Show ' + showTxt + ' more';
                                $target.
                                    html(showTxt).
                                    insertAfter($sibling);
                            } else {
                                $target.remove();
                            }
                    });
                    
                    // If I am closed, open me up. Resizing happens after I 
                    // am open because otherwise some of my elements don't have 
                    // a height. Otherwise, just resize me because I may have had 
                    // items added to me
                    if (me.isClosed) {
                        me.open();
                    } else {
                        me.resize();
                    }
                }
                break;

            case 'item':
                if (productsSize > 0) {
                    $slideContainer = $('#' + me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID);
                    $pagingContainer = $('.' + me.PRODUCT_SLIDE_SEARCH_PAGE_CONTAINER);
                    $pagingButtonGroup = $pagingContainer.find('>ul.pagination');
                    itemPageCount = Math.ceil(productsSize / slidesPerPage);

                    // I want to make a paging system if I have enough items to 
                    // support such a thing
                    if (itemPageCount > 0) {
                        // Add a previous page button
                        $pageButton = $('<a />').
                            attr('href', '#').
                            html('&laquo;');
                        // This will be the first page so I'm going to disable 
                        // the back button
                        $li = $('<li />').
                                addClass('disabled page-move').
                                append($pageButton);
                        $pagingButtonGroup.append($li);
                        for (pIdx = 0; pIdx < itemPageCount; pIdx++) {
                            $pageButton = $('<a />').
                                attr('href', '#').
                                html(pIdx + 1);
                            $li = $('<li />').
                                append($pageButton);

                            if (pIdx === 0) {
                                // If this is the first page, also disable the
                                // page 1 button
                                $li.addClass('disabled');
                            }

                            $pagingButtonGroup.append($li);
                        }

                        // Tack on a "Next Page" button
                        $pageButton = $('<a />').
                            attr('href', '#').
                            html('&raquo;');
                        $li = $('<li />').
                                addClass('page-move').
                                append($pageButton);
                        $pagingButtonGroup.append($li);

                        $('.' + me.PRODUCT_SLIDE_SEARCH_PAGE_CONTAINER).
                            find('>ul>li').
                            on('click', me.pagingButtonClicked);
                    } else {
                        $pagingContainer.remove();
                    }

                    for (itemsIdx = 0; itemsIdx < productsSize; itemsIdx++) {
                        product = products[itemsIdx];
                        item = me.buildProductSearchResultItem({
                            product : product
                        });
                        item.addClass('search-result-item-page-' + Math.ceil((itemsIdx + 1) / slidesPerPage));
                        items.push(item);
                    }

                    if (items.length) {
                        $slideContainer.append(items);
                        if (me.isClosed) {
                            me.open();
                        } else {
                            me.resize();
                        }
                    }
                    
                    $slideContainer.find('>div:not(.search-result-item-page-1)').addClass('hidden');
                }
                break;
            }
        }
    };

    me.getCurrentlyDisabledPageButton = function () {
        var $pagingContainer = $('.' + me.PRODUCT_SLIDE_SEARCH_PAGE_CONTAINER),
            $pagingButtonGroup = $pagingContainer.find('>ul.pagination'),
            numString = $pagingButtonGroup.find('> li.disabled:not(.page-move) > a').html(),
            num = parseInt(numString, 10);

        return num;
    };

    me.displayItemsPage = function (num) {
        var $listItems = $('.' + me.PRODUCT_SLIDE_SEARCH_PAGE_CONTAINER).find('>ul>li'),
            $slideContainer = $('#' + me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID),
            $incomingListItem =  $($listItems.get(num));
        $listItems.removeClass('disabled');

        if (num === 1) {
            $listItems.first().addClass('disabled');
        } else if (num === $listItems.length - 2) {
            $listItems.last().addClass('disabled');
        }

        $incomingListItem.addClass('disabled');
        
        $slideContainer.find('>div.search-result-item-page-' + num).removeClass('hidden');
        $slideContainer.find('>div:not(.search-result-item-page-' + num + ')').addClass('hidden');
        
        // The height and count of my items may have changed to I should be 
        // resized to make sure the paging row stays near the bottom
        me.resize();
    };

    me.pagingButtonClicked = function ($evt) {
        $evt.stopImmediatePropagation();

        var $li = $($evt.target).parent(),
            $link = $li.find('>a'),
            linkString = $link.html(),
            toPage = parseInt(linkString, 10),
            isDisabled = $li.hasClass('disabled'),
            currentPage = me.getCurrentlyDisabledPageButton();

        if (!isDisabled) {
            if (isNaN(toPage)) {
                // User clicked a back or forward button
                // 171 is the back button string char code
                if (171 === $link.html().charCodeAt(0)) {
                    me.displayItemsPage(currentPage - 1);
                } else {
                    me.displayItemsPage(currentPage + 1);
                }
            } else {
                me.displayItemsPage(toPage);
            }
        }
    };

    me.buildProductSearchResultItem = function (args) {
        args = args || {};

        if (args.product) {
            var product = args.product,
                image = args.image,
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
                descriptionContainer = newItem.find('.' + descriptionContainerClass),
                bucketButton = newItem.find('>div:nth-child(2)>div>*:first-child'),
                infoButton = newItem.find('>div:nth-child(2)>div>*:nth-child(3)');

            newItem.attr('id', 'application-slide-search-product-card-' + id);
            imageContainer.attr({
                'id' : imageContainerClass + '-' + id,
                'src' : image
            });
            titleContainer.attr('id', titleContainerClass + '-' + id);
            titleContainerPNode.html(title);
            descriptionContainer.attr('id', descriptionContainerClass + '-' + id).html(description);
            bucketButton.on('click', function (evt) {
                $(window).trigger('bucket-add', {
                    item : product
                });
            });
            infoButton.attr({
                'target' : 'portal_info_window',
                'href' : window.location.origin + CCH.CONFIG.contextPath + '/ui/info/item/' + id
            });
            return newItem;
        }
    };

    me.buildLocationSearchResultItem = function (args) {
        args = args || {};
        var id = args.id || new Date().getMilliseconds(),
            image = args.image,
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

    $(me.CLOSE_BUTTON_SELECTOR).on('click', function (evt) {
        me.toggle();
    });

    $(window).on('cch.ui.resized', function (args) {
        me.resize(args);
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
        displaySearchResults : me.displaySearchResults,
        CLASS_NAME : CCH.Objects.SearchSlide
    };
};