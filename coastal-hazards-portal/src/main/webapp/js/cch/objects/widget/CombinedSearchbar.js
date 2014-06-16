/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global splashUpdate*/
/*global CCH*/

window.CCH = CCH || {};
CCH.Objects = CCH.Objects || {};
CCH.Objects.Widget = CCH.Objects.Widget || {};

/**
 * A widget that is used as the search mechanism throughout the application
 * 
 * @param {type} args
 * @returns {undefined}
 */
CCH.Objects.Widget.CombinedSearch = function (args) {
	"use strict";
	splashUpdate("Initializing Search Subsystem...");
	CCH.LOG.trace('CCH.Objects.Widget.CombinedSearch::constructor: CombinedSearch class is initializing.');

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
	me.isSmall;
	me.includeBboxInSearch = false;

	// Internally used objects
	me.search = new CCH.Util.Search({
		geocodeServiceEndpoint: CCH.CONFIG.data.sources.geocoding.endpoint
	});

	me.resizeContainer = function (evt) {
		var $container = $('#' + me.CONTAINER_ID),
			$parentContainer = $container.parent(),
			parentContainerWidth = $parentContainer.width(),
			$navSearchbarLocator = $('#' + me.CONTAINER_ID).find('> div'),
			$dropDown = $navSearchbarLocator.find('> div:first-child > button'),
			$searchBar = $navSearchbarLocator.find('> input'),
			$submitButton = $navSearchbarLocator.find('div:last-child > button'),
			$parentContainerVisibleItems,
			childrenCombinedWidth,
			containerMarginRight,
			idealInputWidth,
			isSmall = CCH.ui.isSmall();

		if (isSmall) {
			idealInputWidth = '100%';
			$dropDown.height(30);
			$searchBar.height(30);
			$submitButton.height(30);
		} else {
			// Get all visible, non-modal children of the parent that are also not my container
			$parentContainerVisibleItems = $parentContainer.find('> :not(:nth-child(3)):not(.hide):not(*[aria-hidden="true"])'),
				// Get the width of child containers
				childrenCombinedWidth = $parentContainerVisibleItems.toArray().sum(function (el) {
				return $(el).outerWidth(true);
			}),
				containerMarginRight = 15, // TODO- This is problematic between IE9 and others
				idealInputWidth = parentContainerWidth - childrenCombinedWidth - containerMarginRight;
			$dropDown.height(20);
			$searchBar.height(20);
			$submitButton.height(20);
		}

		$container.css({width: idealInputWidth});
	};

	me.setCriteria = function (args) {
		me.criteriaChanged({
			criteria: args.criteria
		});
		me.resizeContainer();
	};

	me.getCriteria = function (args) {
		return me.selectedOption;
	};

	me.submitButtonClicked = function () {
		var inputBox = $(me.INPUTBOX_SELECTOR),
			criteria = inputBox.val(),
			type = me.selectedOption;

		if (criteria) {
			me.performSearch({
				criteria: criteria,
				type: type
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
			$('<i />').addClass('fa fa-caret-down')
			)
			);
	};

	me.performSpatialSearch = function (args) {
		args = args || {};

		var criteria = args.criteria + String(),
			callbacks = args.callbacks,
			scope = args.scope || me;

		me.search.submitLocationSearch({
			criteria: criteria,
			scope: scope,
			callbacks: callbacks,
			displayNotification: true
		});
	};

	me.performItemSearch = function (args) {
		args = args || {};

		var criteria = args.criteria + String(),
			types = args.types,
			callbacks = args.callbacks,
			bbox = null,
			scope = args.scope || me;

		if (me.includeBboxInSearch) {
			bbox = CCH.map.getMap().
				getExtent().
				transform(
					CCH.map.getMap().displayProjection,
					CCH.CONFIG.map.modelProjection).
				toArray().
				join(',');
		}

		me.search.submitItemSearch({
			criteria: criteria,
			scope: scope,
			bbox: bbox,
			callbacks: callbacks,
			types: types
		});
	};

	me.performSearch = function (args) {
		args = args || {};

		var criteria = args.criteria + String(),
			type = args.type.toLowerCase(),
			spatialAndItemType = 'all',
			allSpatialType = 'location',
			allProductsType = 'products',
			// extreme storms, shoreline change, sea level rise
			itemsArray = ['storms', 'historical', 'vulnerability'],
			types = [],
			count = args.count || 20;

		ga('send', 'event', {
			'eventCategory': 'search',
			'eventAction': type,
			'eventLabel': criteria
		});

		if (criteria) {
			$(me).trigger('combined-searchbar-search-performing', {
				type: type
			});
			$('#app-navbar-search-input').trigger('blur');
			me.displaySpinner();
			if (type === spatialAndItemType) {
				me.performSpatialSearch({
					criteria: criteria,
					scope: me,
					callbacks: {
						success: [
							me.hideSpinner,
							function (data) {
								if (data) {
									CCH.LOG.info('CCH.Objects.Widget.CombinedSearch:: Location search has completed successfully');
									$(me).trigger('combined-searchbar-search-performed', {
										'type': 'location',
										'data': data,
										'criteria': me.getCriteria()
									});
								}
							}
						],
						error: [
							me.hideSpinner,
							function (jqXHR, textStatus, errorThrown) {
								CCH.LOG.warn('CCH.Objects.Widget.CombinedSearch:: Could not complete geo-search:' + errorThrown);
								$(me).trigger('combined-searchbar-search-performed', {
									'type': 'location',
									'data': {
										'locations': []
									},
									'criteria': me.getCriteria()
								});
								ga('send', 'exception', {
									'exDescription': 'GeoSearchFailed',
									'exFatal': false
								});
							}
						]
					}
				});

				me.performItemSearch({
					scope: me,
					types: itemsArray,
					criteria: criteria,
					count: count,
					callbacks: {
						success: [
							me.hideSpinner,
							function (data, status) {
								if (status === 'success') {
									CCH.LOG.info('CCH.Objects.Widget.CombinedSearch:: Item search has completed successfully');
									$(me).trigger('combined-searchbar-search-performed', {
										'type': 'item',
										'data': data,
										'criteria': me.getCriteria()
									});
								} else {
									CCH.LOG.warn('CCH.Objects.Widget.CombinedSearch:: Item search could not complete items search');
								}
							}
						],
						error: [
							me.hideSpinner,
							function (jqXHR, textStatus, errorThrown) {
								CCH.LOG.warn('CCH.Objects.Widget.CombinedSearch:: Item search could not complete items search:' + errorThrown);
								$(me).trigger('combined-searchbar-search-performed', {
									'type': 'item',
									'data': {
										'products': []
									},
									'criteria': me.getCriteria()
								});
								ga('send', 'exception', {
									'exDescription': 'ItemSearchFailed',
									'exFatal': false
								});
							}
						]
					}
				});

			} else if (type === allSpatialType) {
				me.performSpatialSearch({
					criteria: criteria,
					scope: me,
					callbacks: {
						success: [
							me.hideSpinner,
							function (data) {
								if (data) {
									CCH.LOG.info('CCH.Objects.Widget.CombinedSearch:: Location search has completed successfully');
									$(me).trigger('combined-searchbar-search-performed', {
										'type': 'location',
										'data': data,
										'criteria': me.getCriteria()
									});
								}
							}
						],
						error: [
							me.hideSpinner,
							function (jqXHR, textStatus, errorThrown) {
								CCH.LOG.warn('CCH.Objects.Widget.CombinedSearch:: Could not complete geo-search:' + errorThrown);
								ga('send', 'exception', {
									'exDescription': 'CombinedSearchFailed',
									'exFatal': false
								});
							}
							
						]
					}
				});
			} else if (type === allProductsType || itemsArray.indexOf(type) !== -1) {
				if (type === allProductsType) {
					types = itemsArray;
				} else {
					types = [type];
				}

				me.performItemSearch({
					scope: me,
					types: types,
					criteria: criteria,
					count: args.count || 20,
					callbacks: {
						success: [
							me.hideSpinner,
							function (data, status) {
								if (status === 'success') {
									CCH.LOG.info('CCH.Objects.Widget.CombinedSearch:: Item search has completed successfully');
									$(me).trigger('combined-searchbar-search-performed', {
										'type': 'item',
										'data': data,
										'criteria': me.getCriteria()
									});
								} else {
									CCH.LOG.warn('CCH.Objects.Widget.CombinedSearch:: Item search could not complete items search');
								}
							}
						],
						error: [
							me.hideSpinner,
							function (jqXHR, textStatus, errorThrown) {
								CCH.LOG.warn('CCH.Objects.Widget.CombinedSearch:: Item search could not complete items search:' + errorThrown);
								ga('send', 'exception', {
									'exDescription': 'ItemSearchFailed',
									'exFatal': false
								});
							}
						]
					}
				});
			}
		} else {
			CCH.LOG.debug('CCH.Objects.Widget.CombinedSearch:: Missing criteria');
		}
	};

	/**
	 * Displays a spinner in the button used to submit a search,
	 * replacing the magnifying glass
	 */
	me.displaySpinner = function () {
		var spinnerImage = $('<img />').attr({
			src: me.DD_TOGGLE_SPINNER_IMG_LOCATION,
			alt: 'Spinner Image',
			id: 'app-navbar-search-spinner-image'
		});
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
		evt.stopImmediatePropagation();
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
				criteria: criteria
			});

			setTimeout(function () {
				me.resizeContainer();
			}, 200);
		} else {
			evt.stopImmediatePropagation();
		}
	});

	$(window).on({
		'cch.ui.resized': me.resizeContainer,
		'slide-search-button-click': function (evt, args) {
			// When a user searches for "all" and has mixed content come back,
			// the user is presented with the choice to "Show All x Locations". 
			// When this happens, I want to change the criteria button on the left
			// of the combined search bar to "Location" as though the user has 
			// searched for locations
			if (args.button === 'show-all-location') {
				var allItems = $('.' + me.DD_TOGGLE_MENU_ITEMS_CLASS);
				allItems.removeClass('disabled');
				allItems.find('>a:contains("Location")').parent().addClass('disabled');
				me.setCriteria({
					criteria: 'Location'
				});
				me.selectedOption = 'location';
			}
		},
		'slide-search-opened': function (evt) {
			$(me.INPUTBOX_SELECTOR)[0].blur();
		},
		'cch.slide.search.filter.toggle': function (evt, args) {
			me.includeBboxInSearch = args.active;
			me.submitButtonClicked();
		}
	});

	// Clicking enter in the input box should submit the search
	$(me.INPUTBOX_SELECTOR).on('keyup', function (evt) {
		var keyCode = evt.keyCode,
			enterKeyCode = 13;

		if (keyCode === enterKeyCode) {
			$('#' + me.SUBMIT_BUTTON_ID).trigger('click');
		}
	});

	// Preload required images
	CCH.LOG.trace('CCH.Objects.Widget.CombinedSearch::constructor: Pre-loading images.');
	$.get(me.DD_TOGGLE_SPINNER_IMG_LOCATION);

	CCH.LOG.trace('CCH.Objects.Widget.CombinedSearch::constructor: CombinedSearch class initialized.');
};