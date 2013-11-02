/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
CCH.Objects.CombinedSearch = function (args) {
    "use strict";
    CCH.LOG.info('CCH.Objects.CombinedSearch::constructor: Bucket class is initializing.');

    var me = (this === window) ? {} : this;

    $.extend(me, args);

    // Application Navbar
    me.CONTAINER_ID = 'app-navbar-search-container';
    me.DD_TOGGLE_ID = 'app-navbar-search-dropdown-toggle';
    me.DD_TOGGLE_MENU_ITEMS_CLASS = 'app-navbar-search-dropdown-item';
    me.DD_TOGGLE_TEXT_CONTAINER_ID = 'app-navbar-search-container-select-button-text';
    me.DD_TOGGLE_MENU_ID = 'app-navbar-search-dropdown-menu';
    me.INPUT_ID = 'app-navbar-search-input';
    me.SUBMIT_BUTTON_ID = 'app-navbar-search-submit-button';

    // Results Popover
    me.GEO_RESULTS_CONTAINER_ID = 'results-popover-geolocation-results-container';
    me.GEO_RESULTS_DESCRIPTION_CONTAINER_ID = 'results-popover-geolocation-results-description-container';
    me.GEO_RESULTS_LIST_CONTAINER_ID = 'results-popover-geolocation-results-list-container';
    me.GEO_RESULTS_LIST = 'results-popover-geolocation-results-list';

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
            clickedLinkText = target.text,
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

    me.performSearch = function (args) {
        args = args || {};

        var criteria = args.criteria + String(),
            type = args.type.toLowerCase();

        if (type === 'location') {
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
                name,
                addr;
            
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
        resultsPopover;

        resultsPopover = $('#' + me.INPUT_ID).popover({
            html : true,
            placement : 'bottom',
            title : 'Search Results',
            content : locationContainer
        });

        resultsPopover.popover('show');
        
        
    };

    $('#' + me.SUBMIT_BUTTON_ID).on('click', function (evt) {
        me.submitButtonClicked.apply(me, [evt]);
    });

    $('#' + me.DD_TOGGLE_MENU_ID + ' li a').on('click', function (evt) {
        me.criteriaChanged.apply(me, [evt]);
    });

    CCH.LOG.debug('CCH.Objects.Bucket::constructor: UI class initialized.');
};