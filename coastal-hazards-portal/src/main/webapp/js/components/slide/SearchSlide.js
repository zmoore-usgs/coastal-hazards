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
    me.$APPLICATION_CONTAINER = $('#application-container');
    me.SLIDE_CONTAINER_ID = args.containerId;
    me.SLIDE_CONTENT_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-content').attr('id');
    me.CLOSE_BUTTON_SELECTOR = '#' + me.SLIDE_CONTAINER_ID + '> div > div.application-slide-controlset';
    me.CONTENT_ROW_ID = 'content-row';
    me.LOCATION_CARD_TEMPLATE_ID = 'application-slide-search-location-card-template';
    me.LOCATION_SLIDE_SEARCH_CONTAINER_ID = 'application-slide-search-location-results-content-container';
    me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID = 'application-slide-search-product-results-content-container';
    me.PRODUCT_CARD_TEMPLATE_ID = 'application-slide-search-product-card-template';
    me.SLIDE_SEARCH_CONTAINER_PARENT_ID = 'application-slide-search-content-container';
    me.PRODUCT_SLIDE_SEARCH_PAGE_CONTAINER = 'application-slide-search-product-results-paging-container';
    me.bucket = args.bucket;
    
    me.SMALL_OFFSET = 10;
    me.PAGE_ITEM_COUNT = 5;
    me.BORDER_WIDTH = 2;
    me.ANIMATION_TIME = 500;
    me.PLACEMENT = 'right';
    me.isSmall = args.isSmall;
    me.START_CLOSED = true;
    me.isInitialized = false;
    me.isClosed = me.START_CLOSED;

    me.clear = function () {
        var $locationSlide = $('#' + me.LOCATION_SLIDE_SEARCH_CONTAINER_ID),
            $productSlide = $('#' + me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID);

        [$locationSlide, $productSlide].each(function ($slide) {
            $slide.find('>div:nth-child(1)').empty()
            $slide.find('>div:nth-child(2)').empty();
            $slide.find('>div:nth-child(3)>ul').empty();
        });
    };

    me.open = function () {
        var slideContainer = $('#' + me.SLIDE_CONTAINER_ID),
            extents = me.getExtents(),
            toExtent = me.isSmall() ? extents.small : extents.large;
        if (me.isClosed) {
            slideContainer.removeClass('hidden');

            slideContainer.animate({
                left: toExtent.left
            }, me.ANIMATION_TIME, function () {
                $(window).trigger('slide-search-opened');
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
            }, me.ANIMATION_TIME, function () {
                $(window).trigger('slide-search-closed');
                me.isClosed = true;
                slideContainer.addClass('hidden');
                if (args && args.clearOnClose) {
                    me.clear();
                }
            });
        }
    };

    me.toggle = function (args) {
        if (me.isClosed) {
            me.open(args);
        } else {
            me.close(args);
        }
    };

    // These functions should be implemented in the function that builds these
    // objects
    me.resize = function () {
        var extents = me.getExtents(),
            toExtent = me.isSmall() ? extents.small : extents.large,
            $slideContainer = $('#' + me.SLIDE_CONTAINER_ID),
            $slideContent = $('#' + me.SLIDE_CONTENT_ID),
            $appContainer = $('#' + me.CONTENT_ROW_ID),
            $cardContainer = $('#' + me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID).parent(),
            windowWidth = $(window).outerWidth(),
            windowHeight = $(window).outerHeight(),
            rightWindowBorderOffset = windowWidth - toExtent.left,
            slideContentWidth = $slideContainer.outerWidth() - me.BORDER_WIDTH;

        if (me.isClosed) {
            $slideContainer.css({
                display : 'none'
            });
        } else {
            $slideContainer.css({
                'display' : ''
            });
        }

        if (me.isSmall()) {
            if (me.isClosed) {
                $slideContainer.css({
                    top : toExtent.top,
                    left: windowWidth
                });
            } else {
                $slideContainer.css({
                    top : toExtent.top,
                    left: toExtent.left
                });
            }
            $slideContainer.height(windowHeight - toExtent.top - 1);
            $slideContainer.width(windowWidth - toExtent.left);
            $slideContent.height($slideContainer.height() - 5);
//            $slideContent.css('width', '');
//            $slideContent.css('height', '');
//            $cardContainer.css('height', '');
        } else {
            if (me.isClosed) {
                $slideContainer.css({
                    left: windowWidth,
                    top: toExtent.top
                });
            } else {
                $slideContainer.offset(toExtent);
            }
            $slideContainer.width(rightWindowBorderOffset);
            $slideContainer.height($appContainer.outerHeight());
            $slideContent.css('width', slideContentWidth + 'px');
            $slideContent.css('height', $slideContainer.height() + 'px');
//            $cardContainer.css($slideContainer.height() - $cardContainer.siblings().toArray().sum(function (x) {
//                return $(x).outerHeight();
//            }) + 'px');
        }
    };

    me.getExtents = function () {
         var $slideContainer = $('#application-slide-items-content-container'),
            $firstAggregationBellow = $slideContainer.find('>div:nth-child(2)'),
            $contentRow = $('#' + me.CONTENT_ROW_ID),
            extents = {
                large: {
                    top: $contentRow.offset().top,
                    left: $contentRow.outerWidth() / 2
                },
                small: {
                    top: $firstAggregationBellow.offset().top - 1,
                    left: $slideContainer.offset().left
                }
            };

        return extents;
    };

    me.displaySearchResults = function (args) {
        args = args || {};

        var data = args.data || {},
            locations = data.locations || [],
            products = data.items || [],
            criteria = args.criteria,
            product,
            locationSize = locations.length || 0,
            productsSize = products.length || 0,
            $slideContainer,
            $pagingContainer,
            $locationContentContainer = $('#' + me.LOCATION_SLIDE_SEARCH_CONTAINER_ID),
            $productContentContainer = $('#' + me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID),
            $contentContainer,
            $card,
            $showAllButton,
            $resultsFoundsContainer,
            slidesPerPage = args.slidesPerPage || me.PAGE_ITEM_COUNT,
            pageCount,
            type = args.type,
            itemsIdx,
            cards = [],
            locationIdx;

        if (data) {
            // The data type can either be location or item
            switch (type) {
            case 'location':
                // I want to show locations if we have locations to show
                if (locationSize > 0) {
                    $showAllButton = $('<div />').
                            addClass('application-slide-search-location-card-toggle').
                            append($('<span />').addClass('badge').html('Show All ' + locationSize + ' Locations'));
                    $contentContainer = $locationContentContainer;
                    $resultsFoundsContainer = $contentContainer.find('> div:nth-child(1)');
                    $slideContainer = $contentContainer.find('> div:nth-child(2)');
                    $pagingContainer = $contentContainer.find('> div:nth-child(3)');
                    pageCount = Math.ceil(locationSize / slidesPerPage);

                    $resultsFoundsContainer.html(locationSize + ' Location' + (locationSize > 1 ? 's' : '') + ' Found');

                    // Start with a clean slate 
                    $slideContainer.empty();
                    $pagingContainer.find('>ul').empty();

                    // I want to build a card for every search result item
                    for (locationIdx = 0; locationIdx < locationSize; locationIdx++) {
                        $card = me.buildLocationSearchResultItem({
                            location: locations[locationIdx],
                            spatialReference: data.spatialReference
                        });

                        $card.addClass('search-result-item-page-' + Math.ceil((locationIdx + 1) / slidesPerPage));

                        // I want to add the card to the items and append it to 
                        // the slide container
                        cards.push($card);
                    }

                    $slideContainer.append(cards);

                    // If I have more than one page worth of stuff, I want to create a
                    // paging system to deal with that
                    me.createPaging({
                        container : $contentContainer,
                        pageCount : pageCount
                    });

                    if (criteria.indexOf('location') === -1) {
                        $pagingContainer.addClass('hidden');
                    }

                    // I only want to show the first location. If I have more 
                    // than one, I want to leave a toggle at the bottom that 
                    // will display all the items
                    if ($slideContainer.find('>div').length > 1 && criteria.indexOf('location') === -1) {
                        $slideContainer.find('>div:first-child()').nextAll().addClass('hidden');
                        $slideContainer.append($showAllButton);

                        // When the user clicks on my toggle, I want to display all
                        // of the locations, change the search criteria to 'Locations'
                        // and have paging for locations (if need be)
                        $showAllButton.on('click', function ($evt) {
                            // Stop propagation of the event because the slide
                            // listens to body events and it might catch a click
                            // and toggle the slide.
                            $evt.stopImmediatePropagation();

                            // I want to emit this event because it's listened to
                            // by the combined search bar 
                            $(window).trigger('slide-search-button-click', {
                                button : 'show-all-location'
                            });

                            // Check to see if I am paging by finding if I have a 
                            // page 2 button
                            if ($pagingContainer.find('>ul.pagination>li>a:contains("2")').length > 0) {
                                // If I'm paging, just show the first page
                                $pagingContainer.removeClass('hidden');
                                me.displayPage({
                                    num : 1,
                                    container : $contentContainer
                                });
                            } else {
                                // I'm not paging so hide the toggle button
                                $slideContainer.find('>div:last-child').remove();
                                // Show all the cards
                                $slideContainer.find('>div').removeClass('hidden');
                            }

                            // Remove all of the product cards and product paging
                            $productContentContainer.find('>div:first-child()').empty();
                            $productContentContainer.find('>div:nth-child(2)').empty();
                            $productContentContainer.find('>div>ul').empty();
                        });
                    }
                }
                break;

            case 'item':
                if (productsSize > 0) {
                    $contentContainer = $productContentContainer;
                    $resultsFoundsContainer = $contentContainer.find('> div:nth-child(1)');
                    $slideContainer = $contentContainer.find('>div:nth-child(2)');
                    $pagingContainer = $contentContainer.find('>div:nth-child(3)');
                    pageCount = Math.ceil(productsSize / slidesPerPage);
                    
                    $resultsFoundsContainer.html(productsSize + ' Result' + (productsSize > 1 ? 's' : '') + ' Found');
                    
                        // Start with a clean slate 
                    $slideContainer.empty();
                    $pagingContainer.find('>ul').empty();

                    for (itemsIdx = 0; itemsIdx < productsSize; itemsIdx++) {
                        product = products[itemsIdx];
                        $card = me.buildProductSearchResultItem({
                            product : product
                        });
                        $card.addClass('search-result-item-page-' + Math.ceil((itemsIdx + 1) / slidesPerPage));
                        cards.push($card);
                    }

                    $slideContainer.append(cards);

                    $slideContainer.find('>div:not(.search-result-item-page-1)').addClass('hidden');

                    me.createPaging({
                        container : $contentContainer,
                        pageCount : pageCount
                    });
                }
                break;
            }

            if (pageCount <= 1) {
                // I have no need of paging, so just hide the 
                // paging container row
                $pagingContainer.addClass('hidden');
            }

            // Check if I have more than one product or location to display
            if (locationSize + productsSize > 0) {
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
        }
    };

    me.createPaging = function (args) {
        var $productContentContainer = args.container,
            $pagingContainer = $productContentContainer.find('>div:nth-child(3)'),
            $pagingButtonGroup = $pagingContainer.find('>ul.pagination'),
            $pageButton,
            $li,
            pIdx,
            pageCount = args.pageCount;
         // Start out by removing all buttons from the paging bar
        $pagingButtonGroup.empty();

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
        for (pIdx = 0; pIdx < pageCount; pIdx++) {
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

        // Bind the click event for each of these buttons
        $pagingContainer.
            find('>ul>li').
            on('click', me.pageButtonClickHandler);

        // The paging container row might be hidden, so remove
        // the hidden class to display the container
        $pagingContainer.removeClass('hidden');
    };

    me.getCurrentlyDisabledPageButton = function () {
        var $pagingContainer = $('.' + me.PRODUCT_SLIDE_SEARCH_PAGE_CONTAINER),
            $pagingButtonGroup = $pagingContainer.find('>ul.pagination'),
            numString = $pagingButtonGroup.find('> li.disabled:not(.page-move) > a').html(),
            num = parseInt(numString, 10);

        return num;
    };

    me.pageButtonClickHandler = function ($evt) {
        // If this bubbles up, it may close the slider due to an on-click binding
        // in the UI class
        $evt.stopImmediatePropagation();

        var $li = $($evt.target).parent(),
            $link = $li.find('>a'),
            linkString = $link.html(),
            toPage = parseInt(linkString, 10),
            isDisabled = $li.hasClass('disabled'),
            currentPage = me.getCurrentlyDisabledPageButton(),
            $productContainer = $('#' + me.PRODUCT_SLIDE_SEARCH_CONTAINER_ID),
            $locationContainer = $('#' + me.LOCATION_SLIDE_SEARCH_CONTAINER_ID),
            $container;

        // Find out if I am a button in the product paging set or in the location
        // paging set
        if ($li.parent().parent().attr('id').indexOf('product') !== -1) {
            // I am a product
            $container = $productContainer;
        } else {
            // I am a location
            $container = $locationContainer;
        }

        if (!isDisabled) {
            if (isNaN(toPage)) {
                // User clicked a back or forward button
                // 171 is the back button string char code
                if (171 === $link.html().charCodeAt(0)) {
                    me.displayPage({
                        container : $container,
                        num : currentPage - 1
                    });
                } else {
                    me.displayPage({
                        container : $container,
                        num : currentPage + 1
                    });
                }
            } else {
                me.displayPage({
                    container : $container,
                    num : toPage
                });
            }
        }
    };

    me.displayPage = function (args) {
        var num = args.num,
            $productContentContainer = args.container,
            $slideContainer = $productContentContainer.find('>div:nth-child(2)'),
            $pagingContainer = $productContentContainer.find('>div:nth-child(3)'),
            $listItems = $pagingContainer.find('>ul>li'),
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

        // The height and count of my items may have changed so I should be 
        // resized to make sure the paging row stays near the bottom
        me.resize();
    };
    me.buildProductSearchResultItem = function (args) {
        args = args || {};

        if (args.product) {
            var product = args.product,
                image = args.image,
                id = product.id,
                summary = product.summary.medium,
                title = summary.title,
                description = summary.text,
                $newItem = $('#' + me.PRODUCT_CARD_TEMPLATE_ID).children().clone(true),
                imageContainerClass = 'application-slide-search-product-card-image',
                titleContainerClass = 'application-slide-search-product-card-title',
                descriptionContainerClass = 'application-slide-search-product-card-description',
                $imageContainer = $newItem.find('.' + imageContainerClass),
                $titleContainer = $newItem.find('.' + titleContainerClass),
                $descriptionContainer = $newItem.find('.' + descriptionContainerClass),
                $bucketButton = $newItem.find('>span.badge'),
                $exploreControl = $('<span />').
                        addClass('badge').
                        append($('<i />').addClass('fa fa-arrow-circle-o-right'), ' Explore'),
                bucketAdd = function (evt) {
                    $(window).trigger('bucket-add', {
                        item : product
                    });
                    
                };

            $newItem.attr('id', 'application-slide-search-product-card-' + id);
            $imageContainer.attr({
                'id' : imageContainerClass + '-' + id,
                'src' : image
            });
            $titleContainer.attr('id', titleContainerClass + '-' + id);
            $titleContainer.append(title, '&nbsp;', $exploreControl);
            $descriptionContainer.attr('id', descriptionContainerClass + '-' + id).html(description);
            
            if (me.bucket.getItemById(id) === undefined) {
                $bucketButton.on('click', bucketAdd);
            } else {
                $bucketButton.addClass('disabled');
            }
            
            $(window).on({
                'bucket-removed' : function (evt, args) {
                    if (args.id === id && $bucketButton.hasClass('disabled')) {
                        $bucketButton.removeClass('disabled');
                        $bucketButton.on('click', bucketAdd);
                    } 
                },
                'bucket-added' : function (evt, args) {
                    if (args.id === id && !$bucketButton.hasClass('disabled')) {
                        $bucketButton.addClass('disabled');
                        $bucketButton.off();
                    }
                }
            });
            
            return $newItem;
        }
    };

    me.buildLocationSearchResultItem = function (args) {
        args = args || {};
        var id = args.id || new Date().getMilliseconds(),
            location = args.location,
            extent = location.extent,
            name = location.name,
            newItem = $('#' + me.LOCATION_CARD_TEMPLATE_ID).children().clone(true),
            titleContainerClass = 'application-slide-search-location-card-title',
            $titleContainer = newItem.find('.' + titleContainerClass),
            $zoomToBadge = $('<span />').
                addClass('badge').
                append($('<i />').addClass('fa fa-search-plus'), ' Zoom To');
        
        newItem.attr('id', 'application-slide-search-location-card-' + id);
        $titleContainer.attr('id', titleContainerClass + '-' + id);
        $titleContainer.append(name, '&nbsp;', $zoomToBadge);
        
        $zoomToBadge.on('click', function (evt) {
            CCH.map.zoomToBoundingBox({
                bbox : [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
            });
        });

        return newItem;
    };

    $(me.CLOSE_BUTTON_SELECTOR).on('click', function () {
        me.toggle({
            clearOnClose : true
        });
    });

    $(window).on({
        'cch.ui.resized': function (args) {
            me.resize(args);
        },
        'cch.slide.items.close' : me.close
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
                me.toggle({
                    clearOnClose : true
                });
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
        CLASS_NAME : 'CCH.Objects.SearchSlide'
    };
};