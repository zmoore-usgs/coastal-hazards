/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
CCH.Objects.CombinedSearch = function (args) {
    "use strict";
    CCH.LOG.info('CCH.Objects.CombinedSearch::constructor: Bucket class is initializing.');

    var me = (this === window) ? {} : this;

    $.extend(me, args);

    // Application Navbar id/class string constants
    me.CONTAINER_ID = 'app-navbar-search-container';
    me.DD_TOGGLE_ID = 'app-navbar-search-dropdown-toggle';
    me.DD_TOGGLE_MENU_ITEMS_CLASS = 'app-navbar-search-dropdown-item';
    me.DD_TOGGLE_TEXT_CONTAINER_ID = 'app-navbar-search-container-select-button-text';
    me.DD_TOGGLE_MENU_ID = 'app-navbar-search-dropdown-menu';
    me.DD_TOGGLE_MENU_ITEMS_CHOICE_SUBMENU_ID = 'app-navbar-search-dropdown-toggle-choice-items-all';
    me.DD_TOGGLE_MENU_ITEMS_CHOICE_ALL_ID = 'app-navbar-search-dropdown-toggle-choice-item-all';
    me.INPUT_ID = 'app-navbar-search-input';
    me.SUBMIT_BUTTON_ID = 'app-navbar-search-submit-button';

    // Results Popover id/class string constants
    me.GEO_RESULTS_CONTAINER_ID = 'results-popover-geolocation-results-container';
    me.GEO_RESULTS_DESCRIPTION_CONTAINER_ID = 'results-popover-geolocation-results-description-container';
    me.GEO_RESULTS_LIST_CONTAINER_ID = 'results-popover-geolocation-results-list-container';
    me.GEO_RESULTS_LIST = 'results-popover-geolocation-results-list';

    // Internally used objects
    me.search = new CCH.Objects.Search({
        geocodeServiceEndpoint: CCH.CONFIG.data.sources.geocoding.endpoint
    });

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

    me.criteriaChanged = function (evt, args) {
        args = args || {};

        var target = evt.currentTarget,
            toggleTextContainer = $('#' + me.DD_TOGGLE_TEXT_CONTAINER_ID),
            clickedLinkText = target.innerHTML,
            parentListEl = target.parentElement,
            allItems = $('.' + me.DD_TOGGLE_MENU_ITEMS_CLASS);

        // First, remove the disabled class from all list elements
        allItems.removeClass('disabled');

        // Add the disabled class to the selected item
        $(parentListEl).addClass('disabled');

        // Put the text for the selected item in the menu
        toggleTextContainer.html(clickedLinkText);
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
            if (type === 'location') {
                // Search by location
                me.performSpatialSearch({
                    criteria : criteria,
                    scope : me,
                    callbacks : {
                        success : [
                            function (data) {
                                if (data) {
                                    var locations = data.locations;
                                    me.displayResultsPopover({
                                        locations : locations
                                    });
                                }
                            }
                        ],
                        error : [
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
            id :  me.GEO_RESULTS_LIST
        });

        listOption = $('<option />').attr({
            value : ''
        }).html('');
        resulstList.append(listOption);

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

    me.displayResultsPopover = function (args) {
        args = args || {};

        var locationContainer = me.buildLocationResultsView({
            locations : args.locations
        }),
            resultsPopover = $('#' + me.INPUT_ID).popover({
                html : true,
                placement : 'bottom',
                title : 'Search Results',
                content : locationContainer
            });

        resultsPopover.popover('show');
    };

    $('#' + me.SUBMIT_BUTTON_ID).on('click', function (evt) {
        me.submitButtonClicked(evt);
    });

    // Any link that is enabled and clicked, register that as a change
    $('#' + me.DD_TOGGLE_MENU_ID + ' li a[tabindex="-1"]').on('click', function (evt) {
        me.criteriaChanged(evt);
    });

    // This is a fix for how bootstrap deals with submenu list-item and anchor 
    // defsault behavior.
    // For the submenu, don't do anything. Default behavior is to accept the click 
    // but this is bad on touch devices since disabled links need to be 
    // clicked in order to expand a submenu
    $('#' + me.DD_TOGGLE_MENU_ID + ' li[class~="dropdown-submenu"]').on('click', function (evt) {
        // Check to see if we are propagating at the moment. If so, that means 
        // that we are not the target of what was clicked and we should not stop
        // further propagation. Otherwise, what was clicked was a toggle node 
        // for the submenu and it should just open the submenu and that's all, so
        // stop propagation
        if (evt.currentTarget === evt.target.parentElement) {
             evt.stopImmediatePropagation();
        }
    });

    CCH.LOG.debug('CCH.Objects.Bucket::constructor: UI class initialized.');
};