/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global splashUpdate*/
/*global CCH*/
CCH.Objects.CombinedSearch = function (args) {
    "use strict";
    splashUpdate("Initializing Search Subsystem...");
    CCH.LOG.info('CCH.Objects.CombinedSearch::constructor: CombinedSearch class is initializing.');

    var me = (this === window) ? {} : this;
    
    args = args || {};
    
    // Application Navbar id/class string constants
    me.CONTAINER_ID = args.containerId || 'app-navbar-search-container';
    me.DD_TOGGLE_ID = args.toggleId || 'app-navbar-search-dropdown-toggle';
    me.DD_TOGGLE_MENU_ITEMS_CLASS = args.toggleMenuItemClass || 'app-navbar-search-dropdown-item';
    me.DD_TOGGLE_TEXT_CONTAINER_ID = args.toggleTextContainerId || 'app-navbar-search-container-select-button-text';
    me.DD_TOGGLE_MENU_ID = args.toggleMenuId || 'app-navbar-search-dropdown-menu';
    me.DD_TOGGLE_MENU_ITEMS_CHOICE_SUBMENU_ID = 'app-navbar-search-dropdown-toggle-choice-items-all';
    me.DD_TOGGLE_MENU_ITEMS_CHOICE_ALL_ID = 'app-navbar-search-dropdown-toggle-choice-item-all';
    me.INPUT_ID = args.inputId || 'app-navbar-search-input';
    me.SUBMIT_BUTTON_ID = args.submitButtonId || 'app-navbar-search-submit-button';
    me.POPOVER_TARGET_ID = me.INPUT_ID;
    me.POPOVER_ID = args.popoverId || 'app-navbar-search-context-popover';

    // Results Popover id/class string constants
    me.GEO_RESULTS_CONTAINER_ID = args.geoResultsContainerId || 'results-popover-geolocation-results-container';
    me.GEO_RESULTS_DESCRIPTION_CONTAINER_ID = args.geoResultsDescriptionContainerId || 'results-popover-geolocation-results-description-container';
    me.GEO_RESULTS_LIST_CONTAINER_ID = args.geoResultsListContainerId || 'results-popover-geolocation-results-list-container';
    me.GEO_RESULTS_LIST_ID = args.geoResultsListId || 'results-popover-geolocation-results-list';

    me.inputControlPopover = $('#' + me.POPOVER_TARGET_ID).popover({
        html : true,
        placement : 'bottom',
        trigger : 'manual',
        content : 'test',
        title : 'test'
    });

    // Ajax spinner 
    me.DD_TOGGLE_SPINNER_IMG_LOCATION = 'images/spinner/ajax-loader.gif';

    // Internally used objects
    me.search = new CCH.Objects.Search({
        geocodeServiceEndpoint: CCH.CONFIG.data.sources.geocoding.endpoint
    });

    me.resizeContainer = function () {
        var parentContainerWidth = $('#' + me.CONTAINER_ID).parent()[0].clientWidth,
            parentContainerVisibleItems = $('#' + me.CONTAINER_ID).parent().children(':not(.hide)'),
            childrenCombinedWidth = parentContainerVisibleItems.toArray().sum(function (el) {
                return $(el).outerWidth(true);
            }),
            currentInputWidth = $('#' + me.INPUT_ID).width(),
            idealInputWidth = parentContainerWidth - (childrenCombinedWidth - currentInputWidth) - 10;

        $('#' + me.INPUT_ID).width(idealInputWidth);
    };

    me.submitButtonClicked = function (evt, args) {
        args = args || {};

        var criteria = $('#' + me.INPUT_ID).val(),
            type = $('#' + me.DD_TOGGLE_TEXT_CONTAINER_ID).html().toLowerCase();

        if (criteria) {
            me.performSearch({
                criteria : criteria,
                type : type
            });
        }
    };

    me.criteriaChanged = function (args) {
        args = args || {};

        var toggleTextContainer = $('#' + me.DD_TOGGLE_TEXT_CONTAINER_ID),
            criteria = args.criteria;

        // Put the text for the selected item in the menu
        toggleTextContainer.html(criteria);
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
            itemsArray = ['storms', 'sea level rise', 'shoreline change'],
            types;

        if (criteria) {
            me.hidePopover();
            me.displaySpinner();

            if (type === 'location') {
                // Search by location
                me.performSpatialSearch({
                    criteria : criteria,
                    scope : me,
                    callbacks : {
                        success : [
                            me.hideSpinner,
                            function (data) {
                                if (data) {
                                    var locations = data.locations,
                                        resultsPopover = me.buildLocationResultsView({
                                            locations : locations
                                        });

                                    me.displayPopover({
                                        locations : locations,
                                        content : resultsPopover,
                                        title : 'Search Results'
                                    });
                                    
                                    $('#' + me.GEO_RESULTS_LIST_ID + ' option').first().trigger('click');
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
            } else if (type === 'all items' || itemsArray.indexOf(type) !== -1) {
                if (type === 'all items') {
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
                            function (data) {
                                var a = 1;
                            }
                        ],
                        error : [
                            function (jqXHR, textStatus, errorThrown) {
                                CCH.LOG.warn('CCH.Objects.CombinedSearch:: Could not complete items search:' + errorThrown);
                            }
                        ]
                    }
                });
            }
        }
    };

    me.buildLocationResultsView = function (args) {
        args = args || {};

        var locations = args.locations,
            location,
            locationsIndex = 0,
            container,
            titleRow,
            titleSpan,
            resultsDescriptionRow,
            resultDescriptionSpan,
            resultsListRow,
            resultsListSpan,
            resulstList,
            listOption;

        container = $('<div />').
            attr({
                id : me.GEO_RESULTS_CONTAINER_ID
            }).addClass('container-fluid');
        titleRow = $('<div />').addClass('row-fluid');
        titleSpan = $('<div />').addClass('span8 offset4').html('Geolocation Results');
        resultsDescriptionRow = $('<div />').addClass('row-fluid');
        resultDescriptionSpan = $('<div />').attr({
            id : me.GEO_RESULTS_DESCRIPTION_CONTAINER_ID
        });
        resultsListRow = $('<div />').addClass('row span12');
        resultsListSpan = $('<div />').attr({
            id : me.GEO_RESULTS_LIST_CONTAINER_ID
        });
        resulstList = $('<select />').attr({
            id :  me.GEO_RESULTS_LIST_ID
        });

        for (locationsIndex; locationsIndex < locations.length; locationsIndex++) {
            location = locations[locationsIndex];
            listOption = $('<option />').attr({
                value : locationsIndex
            }).html(location.name);
            resulstList.append(listOption);
        }

        container.append(titleRow.append(titleSpan), [
            resultsDescriptionRow.append(resultDescriptionSpan),
            resultsDescriptionRow.append(resultDescriptionSpan),
            resultsListRow.append(resultsListSpan.append(resulstList))
        ]);

        container.data({
            locations : locations
        });

        resulstList.find('option').on('click', function (evt) {
            var locationsData = container.data('locations'),
                locationIndex = parseInt(evt.currentTarget.getAttribute('value'), 10),
                chosenLocation,
                name;

            if (!isNaN(locationIndex)) {
                chosenLocation = locationsData[locationIndex];
                name = chosenLocation.name;
                $('#' + me.GEO_RESULTS_DESCRIPTION_CONTAINER_ID).html(name);
            } else {
                $('#' + me.GEO_RESULTS_DESCRIPTION_CONTAINER_ID).html('');
            }

        });

        return container;
    };

    me.buildSearchContextHelpView = function (args) {
        args = args || {};

        var criteria = args.criteria,
            content;

        switch (criteria.toLowerCase()) {
        case 'all':
            content = $('#app-navbar-search-input-context-menu-all');
            break;
        case 'location':
            content = $('#app-navbar-search-input-context-menu-location');
            break;
        case 'items':
            content = $('#app-navbar-search-input-context-menu-items');
            break;
        }

        me.displayPopover({
            content : content,
            title : 'Search ' + criteria,
            id : me.POPOVER_ID
        });
    };

    me.displayPopover = function (args) {
        args = args || {};

        var content = args.content.clone(true, true),
            title = args.title,
            popover = me.inputControlPopover.data('popover');

        content.attr({
            'id': content.attr('id') + new Date().getMilliseconds()
        });

        popover.options.title = title;
        popover.options.content = content;

        popover.show();

        popover.$tip.attr({
            id : me.POPOVER_ID
        });
    };

    me.hidePopover = function () {
        var popover = me.inputControlPopover.data('popover');
        popover.hide();
    };

    /**
     * Displays a spinner in the button used to submit a search,
     * replacing the magnifying glass
     */
    me.displaySpinner = function () {
        var spinnerImage = $('<img />').attr({
                src : me.DD_TOGGLE_SPINNER_IMG_LOCATION,
                alt : '',
                id : 'app-navbar-search-spinner-image'
            });

        $('#' + me.SUBMIT_BUTTON_ID).empty();
        $('#' + me.SUBMIT_BUTTON_ID).append(spinnerImage);
    };

    /**
     * Hides the spinner in the button used to submit a search,
     * restoring the magnifying glass
     */
    me.hideSpinner = function () {
        var magnifyingGlass = $('<i />').addClass('icon-search');
        $('#' + me.SUBMIT_BUTTON_ID).empty();
        $('#' + me.SUBMIT_BUTTON_ID).append(magnifyingGlass);
    };

    // Bind the search submit button
    $('#' + me.SUBMIT_BUTTON_ID).on('click', function (evt) {
        me.submitButtonClicked(evt);
    });

    // Any link that is enabled and clicked, register that as a change
    $('#' + me.DD_TOGGLE_MENU_ID + ' li a[tabindex="-1"]').on('click', function (evt) {
        var target = evt.currentTarget,
            criteria = target.innerHTML,
            parentListEl = target.parentElement,
            allItems = $('.' + me.DD_TOGGLE_MENU_ITEMS_CLASS);

        // First, remove the disabled class from all list elements
        allItems.removeClass('disabled');

        // Add the disabled class to the selected item
        $(parentListEl).addClass('disabled');

        me.criteriaChanged({
            criteria : criteria
        });

        me.resizeContainer();
    });

    // The behavior for the search box should be:
    // - When clicking in the input box, display contextual menu
    // - When clicking in the contextual menu, don't clear the contextual menu
    // - When clicking back in the input box, keep the contextual menu
    // - When clicking anywhere else, clear the contextual menu
    $('body').on('click', function (evt) {
        var target = $(evt.target),
            criteria = document.getElementById(me.DD_TOGGLE_TEXT_CONTAINER_ID).innerHTML.toLowerCase(),
            isClickedPopover = $('#' + me.POPOVER_ID).find(target).length > 0,
            isPopoverVisible = $('#' + me.POPOVER_ID).length > 0,
            isClickedInputBox = $(target).attr('id') === me.POPOVER_TARGET_ID;

        if (!isClickedPopover && isClickedInputBox) {
            if (!isPopoverVisible) {
                me.buildSearchContextHelpView({
                    criteria : criteria
                });
            }
        } else if (!isClickedPopover && !isClickedInputBox) {
            me.hidePopover();
        }
    });

    $(window).on('resize', me.resizeContainer);

    // Clicking enter in the input box should submit the search
    $('#' + me.INPUT_ID).on('keyup', function (evt) {
        var keyCode = evt.keyCode,
            enterKeyCode = 13;

        if (keyCode === enterKeyCode) {
            $('#' + me.SUBMIT_BUTTON_ID).trigger('click');
        }
    });

    // Preload required images
    CCH.LOG.trace('CCH.Objects.CombinedSearch::constructor: Pre-loading images.');
    $.get(me.DD_TOGGLE_SPINNER_IMG_LOCATION);

    CCH.LOG.debug('CCH.Objects.CombinedSearch::constructor: UI class initialized.');
};