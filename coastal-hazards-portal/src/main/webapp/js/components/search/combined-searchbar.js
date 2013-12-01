/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global splashUpdate*/
/*global CCH*/

/**
 * A widget that is used as the search mechanism throughout the application
 * 
 * Events Emitted:
 * 'combined-searchbar-search-performed'
 * 'combined-searchbar-search-performing'
 * 
 * Events Listened To:
 * window.resize
 * 
 * @param {type} args
 * @returns {undefined}
 */
CCH.Objects.CombinedSearch = function (args) {
    "use strict";
    splashUpdate("Initializing Search Subsystem...");
    CCH.LOG.info('CCH.Objects.CombinedSearch::constructor: CombinedSearch class is initializing.');

    var me = (this === window) ? {} : this;

    args = args || {};

    // Application Navbar id/class string constants
    me.CONTAINER_ID = args.containerId || 'app-navbar-search-container';
    me.DD_TOGGLE_ID = args.toggleId || 'app-navbar-search-dropdown-toggle';
    me.DD_TOGGLE_BUTTON_SELECTOR = '#' + me.CONTAINER_ID + '> div > div:first-child > button';
    me.DD_TOGGLE_MENU_ITEMS_CLASS = args.toggleMenuItemClass || 'app-navbar-search-dropdown-item';
    me.DD_TOGGLE_TEXT_CONTAINER_ID = args.toggleTextContainerId || 'app-navbar-search-container-select-button-text';
    me.DD_TOGGLE_MENU_ID = args.toggleMenuId || 'app-navbar-search-dropdown-menu';
    me.DD_TOGGLE_MENU_ITEMS_CHOICE_SUBMENU_ID = 'app-navbar-search-dropdown-toggle-choice-items-all';
    me.DD_TOGGLE_MENU_ITEMS_CHOICE_ALL_ID = 'app-navbar-search-dropdown-toggle-choice-item-all';
    me.INPUTBOX_SELECTOR = '#' + me.CONTAINER_ID + ' div > input';
    me.SUBMIT_BUTTON_ID = args.submitButtonId || 'app-navbar-search-submit-button';
    me.DD_TOGGLE_SPINNER_IMG_LOCATION = 'images/spinner/ajax-loader.gif';
    me.selectedOption = 'all';

    // Internally used objects
    me.search = new CCH.Objects.Search({
        geocodeServiceEndpoint: CCH.CONFIG.data.sources.geocoding.endpoint
    });

    me.resizeContainer = function () {
        var container = $('#' + me.CONTAINER_ID),
            parentContainer = container.parents().first(),
            parentContainerWidth = parentContainer.width(),
            // Get all visible, non-modal children of the parent that are also not my container
            parentContainerVisibleItems = parentContainer.find('> :not(:nth-child(3)):not(.hide):not(*[aria-hidden="true"])'),
            // Get the width of child containers
            childrenCombinedWidth = parentContainerVisibleItems.toArray().sum(function (el) {
                return $(el).outerWidth(true);
            }),
            containerMarginRight = 15,
            idealInputWidth = parentContainerWidth - childrenCombinedWidth - containerMarginRight;

        container.css({width : idealInputWidth});
    };

    me.submitButtonClicked = function (evt, args) {
        args = args || {};

        var inputBox = $(me.INPUTBOX_SELECTOR),
            criteria = inputBox.val(),
            type = me.selectedOption;

        if (criteria) {
            me.performSearch({
                criteria : criteria,
                type : type
            });
        }
    };

    me.criteriaChanged = function (args) {
        args = args || {};

        var toggleTextContainer = $(me.DD_TOGGLE_BUTTON_SELECTOR),
            criteria = args.criteria;

        // Put the text for the selected item in the menu
        toggleTextContainer.html(criteria);
        toggleTextContainer.append(
                $('<span />').append(
                $('<i />').addClass('fa fa-caret-down')));
    };

    me.performSpatialSearch = function (args) {
        args = args || {};

        var criteria = args.criteria + String(),
            callbacks = args.callbacks,
            scope = args.scope || me;

        me.search.submitLocationSearch({
            criteria : criteria,
            scope : scope,
            callbacks : callbacks
        });
    };

    me.performItemSearch = function (args) {
        args = args || {};

        var criteria = args.criteria + String(),
            types = args.types,
            callbacks = args.callbacks,
            scope = args.scope || me;

        me.search.submitItemSearch({
            criteria : criteria,
            scope : scope,
            callbacks : callbacks,
            types : types
        });
    };

    me.performSearch = function (args) {
        args = args || {};

        var criteria = args.criteria + String(),
            type = args.type.toLowerCase(),
            allProducts = 'products',
            itemsArray = ['storms', 'vulnerability', 'historical'],
            types = [],
            count = args.count || 20;

        if (criteria) {
            $(me).trigger('combined-searchbar-search-performing', {
                type : type
            });

            me.displaySpinner();
            if (type === 'all') {
                me.performSpatialSearch({
                    criteria : criteria,
                    scope : me,
                    callbacks : {
                        success : [
                            me.hideSpinner,
                            function (data) {
                                if (data) {
                                    CCH.LOG.info('CCH.Objects.CombinedSearch:: Location search has completed successfully');
                                    $(me).trigger('combined-searchbar-search-performed', {
                                        'type' : 'location',
                                        'data' : data
                                    });
                                }
                            }
                        ],
                        error : [
                            me.hideSpinner,
                            function (jqXHR, textStatus, errorThrown) {
                                CCH.LOG.warn('CCH.Objects.CombinedSearch:: Could not complete geo-search:' + errorThrown);
                            }
                        ]
                    }
                });

                me.performItemSearch({
                    scope : me,
                    types : itemsArray,
                    criteria : criteria,
                    count : count,
                    callbacks : {
                        success : [
                            me.hideSpinner,
                            function (data, status) {
                                if (status === 'success') {
                                    CCH.LOG.info('CCH.Objects.CombinedSearch:: Item search has completed successfully');
                                    $(me).trigger('combined-searchbar-search-performed', {
                                        'type' : 'item',
                                        'data' : data
                                    });
                                } else {
                                    CCH.LOG.warn('CCH.Objects.CombinedSearch:: Item search could not complete items search');
                                }
                            }
                        ],
                        error : [
                            me.hideSpinner,
                            function (jqXHR, textStatus, errorThrown) {
                                CCH.LOG.warn('CCH.Objects.CombinedSearch:: Item search could not complete items search:' + errorThrown);
                            }
                        ]
                    }
                });

            } else if (type === 'location') {
                me.performSpatialSearch({
                    criteria : criteria,
                    scope : me,
                    callbacks : {
                        success : [
                            me.hideSpinner,
                            function (data) {
                                if (data) {
                                    CCH.LOG.info('CCH.Objects.CombinedSearch:: Location search has completed successfully');
                                    $(me).trigger('combined-searchbar-search-performed', {
                                        'type' : 'location',
                                        'data' : data
                                    });
                                }
                            }
                        ],
                        error : [
                            me.hideSpinner,
                            function (jqXHR, textStatus, errorThrown) {
                                CCH.LOG.warn('CCH.Objects.CombinedSearch:: Could not complete geo-search:' + errorThrown);
                            }
                        ]
                    }
                });
            } else if (type === allProducts || itemsArray.indexOf(type) !== -1) {
                if (type === allProducts) {
                    types = itemsArray;
                } else {
                    types = [type];
                }

                me.performItemSearch({
                    scope : me,
                    types : types,
                    criteria : criteria,
                    count : args.count || 20,
                    callbacks : {
                        success : [
                            me.hideSpinner,
                            function (data, status) {
                                if (status === 'success') {
                                    CCH.LOG.info('CCH.Objects.CombinedSearch:: Item search has completed successfully');
                                    $(me).trigger('combined-searchbar-search-performed', {
                                        'type' : 'item',
                                        'data' : data
                                    });
                                } else {
                                    CCH.LOG.warn('CCH.Objects.CombinedSearch:: Item search could not complete items search');
                                }
                            }
                        ],
                        error : [
                            me.hideSpinner,
                            function (jqXHR, textStatus, errorThrown) {
                                CCH.LOG.warn('CCH.Objects.CombinedSearch:: Item search could not complete items search:' + errorThrown);
                            }
                        ]
                    }
                });
            }
        }
    };

    /**
     * Displays a spinner in the button used to submit a search,
     * replacing the magnifying glass
     */
    me.displaySpinner = function () {
        var spinnerImage = $('<img />').attr({
                src : me.DD_TOGGLE_SPINNER_IMG_LOCATION,
                alt : 'Spinner Image',
                id : 'app-navbar-search-spinner-image'
            });
        spinnerImage.addClass("img-responsive");
        $('#' + me.SUBMIT_BUTTON_ID).empty();
        $('#' + me.SUBMIT_BUTTON_ID).append(spinnerImage);
    };

    /**
     * Hides the spinner in the button used to submit a search,
     * restoring the magnifying glass
     */
    me.hideSpinner = function () {
        var magnifyingGlass = $('<i />').addClass('fa fa-search');
        $('#' + me.SUBMIT_BUTTON_ID).empty();
        $('#' + me.SUBMIT_BUTTON_ID).append(magnifyingGlass);
    };

    // Bind the search submit button
    $('#' + me.SUBMIT_BUTTON_ID).on('click', function (evt) {
        me.submitButtonClicked(evt);
    });

    // Any link that is clicked, register that as a change
    $('#' + me.CONTAINER_ID + '> div > div > ul li > a').on('click', function (evt) {
        var target = evt.currentTarget,
            criteria = target.title,
            parentListEl = target.parentElement,
            allItems = $('.' + me.DD_TOGGLE_MENU_ITEMS_CLASS),
            // The id has the type as the last word
            type = evt.target.id.split('-').last(),
            isDisabled = $(target).parent().hasClass('disabled');

        if (!isDisabled) {
            // First, remove the disabled class from all list elements
            allItems.removeClass('disabled');

            // Add the disabled class to the selected item
            $(parentListEl).addClass('disabled');

            me.selectedOption = type;

            me.criteriaChanged({
                criteria : criteria
            });

            me.resizeContainer();
        } else {
            evt.stopImmediatePropagation();
        }
    });

    $(window).on('cch.ui.resized', me.resizeContainer);

    // Clicking enter in the input box should submit the search
    $(me.INPUTBOX_SELECTOR).on('keyup', function (evt) {
        var keyCode = evt.keyCode,
            enterKeyCode = 13;

        if (keyCode === enterKeyCode) {
            $('#' + me.SUBMIT_BUTTON_ID).trigger('click');
        }
    });

    // Preload required images
    CCH.LOG.trace('CCH.Objects.CombinedSearch::constructor: Pre-loading images.');
    $.get(me.DD_TOGGLE_SPINNER_IMG_LOCATION);

    CCH.LOG.debug('CCH.Objects.CombinedSearch::constructor: CombinedSearch class initialized.');
};