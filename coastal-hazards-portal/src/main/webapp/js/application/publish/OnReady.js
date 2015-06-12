/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global initializeLogging*/
/*global contextPath*/
/*global vulnAttributes*/
/*global stormAttributes*/
/*global historicAttributes*/
$(document).ready(function () {
	"use strict";

	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
	});

	CCH.LOG = LOG;

	$(document).ajaxStart(function () {
		$('body').css('cursor', 'wait');
	});
	$(document).ajaxStop(function () {
		$('body').css('cursor', 'default');
	});

	// This is a promise set on the check-auth ajax call. Do not continue initializing
	// unless we've successfully verified that the token sent by the client is valid
	var continueLoading = function () {
		CCH.ows = new CCH.Util.OWS().init();

		CCH.ui = new CCH.Objects.Publish.UI();

		CCH.ui.addUserInformationToForm({
			data: CCH.CONFIG.user
		});

		CCH.search = new CCH.Util.Search();

		// First load all of the items in the application.
		// TODO This might prove to be an inefficient way of loading items.
		var searchItemSuccess = function (itemsJSON) {
			CCH.items = itemsJSON.items;
			var rootOutChildren = function (item) {
				if (item.itemType === 'aggregation') {
					if (!CCH.items.find(function (itemsItem) {
						return item.id === itemsItem.id;
					})) {
						CCH.items.push(item);
					}
					if (item.children) {
						item.children.each(function (child) {
							rootOutChildren(child);
						});
					}
				} else {
					if (!CCH.items.find(function (itemsItem) {
						return item.id === itemsItem.id;
					})) {
						CCH.items.push(item);
					}
				}
			},
					$list = $('#publish-button-edit-existing-list'),
					sortedItems,
					sortedListItems;

			CCH.items.each(function (item) {
				rootOutChildren(item);
			});

			sortedItems = CCH.items.sortBy(function (i) {
				return i.summary.full.title;
			}),
					sortedListItems = CCH.ui.templates.item_list({
						items: sortedItems,
						baseUrl: CCH.CONFIG.contextPath
					});

			// Replace current list with new sorted list of items
			$list.empty().append(sortedListItems);

			if (CCH.itemid) {
				CCH.CONFIG.item = CCH.items.find(function (item) {
					return item.id === CCH.itemid;
				});

				// Figure out if a secondary call needs to be made
				// to load this item. 
				if (CCH.CONFIG.item) {
					CCH.ui.addItemToForm({
						data: CCH.CONFIG.item
					});
				} else {
					var secondarySearch = CCH.search.submitItemSearch({
						item: CCH.itemid,
						displayNotification: false
					});
					
					secondarySearch.done(function (itemJSON) {
						CCH.CONFIG.item = itemJSON;
						CCH.ui.addItemToForm({
							data: CCH.CONFIG.item
						});
					});
				}
			}
		};
		
		var searchItem = CCH.search.submitItemSearch({
			subtree: true,
			showDisabled: true
		});
		
		searchItem.done(searchItemSuccess);
		
		return searchItem;
	};
	
	var checkAuth = CCH.Auth.checkAuthStatus();
	
	checkAuth.done(continueLoading);
});

var deriveTypeFromAttribute = function (name) {
	"use strict";
	if (historicAttributes.indexOf(name.toLowerCase()) !== -1) {
		return 'historical';
	} else if (vulnAttributes.indexOf(name.toLowerCase()) !== -1) {
		return 'vulnerability';
	} else if (stormAttributes.indexOf(name.toLowerCase()) !== -1) {
		return 'storms';
	} else {
		return '';
	}
};

var wmsLayersDropdownChangeHandler = function (evt) {
	"use strict";
	var wmsLayer = CCH.config.endpoint.wmsCaps.capability.layers.find(function (l) {
		return l.name === evt.target.value;
	});
	var bbox = wmsLayer.llbbox;
	CCH.config.bbox = bbox;
};

var formatEndpoint = function (e) {
	"use strict";
	var cutoffIndex = e.indexOf('?');
	if (cutoffIndex !== -1) {
		return e.substring(0, cutoffIndex);
	} else {
		return e;
	}
};

var previewButtonClickHandler = function (evt) {
	"use strict";
	var btn = evt.target;
	var attName = $(btn).attr('name');
	var metadataToken = CCH.config.metadataToken;
	var wfs = formatEndpoint($('#publish-services-wfs').val());
	var wms = formatEndpoint($('#publish-services-wms').val());
	var wfsType = $('#publish-services-types').val();
	var wmsLayers = $('#publish-services-layers').val();
	var type = CCH.config.type;
	var bbox = CCH.config.bbox;
	var name = $('#publish-name-input').val();
	var data = {
		metadata: metadataToken,
		wfsService: {
			endpoint: wfs,
			typeName: wfsType
		},
		wmsService: {
			endpoint: wms,
			layers: wmsLayers
		},
		name: name,
		type: type,
		attr: attName,
		bbox: bbox
	};

	publishPreview({
		previewData: data,
		callbacks: {
			success: [
				function (data, status, xhr) {
					var id = data.id;
					window.open(contextPath + '/ui/item/' + id);
				}
			],
			error: [
				function (xhr, status, error) {
					// TODO- Handle this
				}
			]
		}
	});
};

var publishPreview = function (args) {
	"use strict";
	args = args || {};
	var previewData = args.previewData;
	var callbacks = args.callbacks || {
		success: [],
		error: []
	};

	$.ajax({
		url: contextPath + '/data/item/preview',
		type: 'POST',
		data: JSON.stringify(previewData),
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		success: function (json, textStatus, jqXHR) {
			if (callbacks.success && callbacks.success.length > 0) {
				callbacks.success.each(function (callback) {
					callback.call(null, json, textStatus, jqXHR);
				});
			}
		},
		error: function (xhr, status, error) {
			if (callbacks.error && callbacks.error.length > 0) {
				callbacks.error.each(function (callback) {
					callback.call(null, xhr, status, error);
				});
			}
		}
	});
};

var publishMetadata = function (args) {
	"use strict";
	args = args || {};
	var token = args.token;
	var callbacks = args.callbacks || {
		success: [],
		error: []
	};

	$.ajax({
		url: contextPath + '/publish/metadata/' + token,
		type: 'POST',
		dataType: 'json',
		success: function (json, textStatus, jqXHR) {
			if (callbacks.success && callbacks.success.length > 0) {
				callbacks.success.each(function (callback) {
					callback.call(null, json, textStatus, jqXHR);
				});
			}
		},
		error: function (xhr, status, error) {
			if (callbacks.error && callbacks.error.length > 0) {
				callbacks.error.each(function (callback) {
					callback.call(null, xhr, status, error);
				});
			}
		}
	});
};

var publishData = function (args) {
	"use strict";
	args = args || {};
	var publishData = args.publishData;
	var callbacks = args.callbacks || {
		success: [],
		error: []
	};

	$.ajax({
		url: contextPath + '/data/item/',
		type: 'POST',
		data: JSON.stringify(publishData),
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		success: function (json, textStatus, jqXHR) {
			if (callbacks.success && callbacks.success.length > 0) {
				callbacks.success.each(function (callback) {
					callback.call(null, json, textStatus, jqXHR);
				});
			}
		},
		error: function (xhr, status, error) {
			if (callbacks.error && callbacks.error.length > 0) {
				callbacks.error.each(function (callback) {
					callback.call(null, xhr, status, error);
				});
			}
		}
	});
};

var getItem = function (args) {
	"use strict";
	args = args || {};
	var itemId = args.itemId;
	var callbacks = args.callbacks || {
		success: [],
		error: []
	};

	$.ajax({
		url: contextPath + '/data/item/' + itemId,
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		success: function (json, textStatus, jqXHR) {
			if (callbacks.success && callbacks.success.length > 0) {
				callbacks.success.each(function (callback) {
					callback.call(null, json, textStatus, jqXHR);
				});
			}
		},
		error: function (xhr, status, error) {
			if (callbacks.error && callbacks.error.length > 0) {
				callbacks.error.each(function (callback) {
					callback.call(null, xhr, status, error);
				});
			}
		}
	});
};

var publish = function (args) {
	"use strict";
	args = args || {};
	if (CCH.config.attributes.length) {
		var previewData = {
			metadata: CCH.config.metadataToken,
			wfsService: {
				endpoint: formatEndpoint($('#publish-services-wfs').val()),
				typeName: $('#publish-services-types').val()
			},
			wmsService: {
				endpoint: formatEndpoint($('#publish-services-wms').val()),
				layers: $('#publish-services-layers').val()
			},
			name: $('#publish-name-input').val(),
			type: CCH.config.type,
			attr: CCH.config.attributes.shift(),
			bbox: CCH.config.bbox
		};

		// Publish the preview item
		publishPreview({
			previewData: previewData,
			callbacks: {
				success: [
					function (data, textStatus, jqXHR) {
						var id = data.id;
						// Using the preview item id,  pull the item
						getItem({
							itemId: id,
							callbacks: {
								success: [
									function (data, textStatus, jqXHR) {
										var pData = data;
										pData.metadata = CCH.config.metadataUrl;
										// Publish the item from the preview
										publishData({
											publishData: pData,
											callbacks: {
												success: [
													function (data, textStatus, jqXHR) {
														console.log('PUBLISHED');
														publish();
													}
												],
												error: [
													function (xhr, status, error) {
														console.log('ERR: NOT PUBLISHED: ' + error);
														publish();
													}
												]
											}
										});
									}
								], error: [
									function (xhr, status, error) {
										console.log('ERR: NOT PUBLISHED: ' + error);
										publish();
									}
								]
							}
						});
					}
				],
				error: [
					function (xhr, status, error) {
						console.log('ERR: NOT PUBLISHED: ' + error);
						publish();
					}
				]
			}
		});
	}
};

var bindCheckbox = function (evt) {
	"use strict";
	var cb = evt.target;
	var li = cb.parentNode;
	var buttons = $(li).find('button');
	buttons.toggleClass('disabled');
	var anyEnabledCheckboxes = $(li).find('input');
	if (anyEnabledCheckboxes) {
		$('#publish-publish-button').removeClass('disabled');
	} else {
		$('#publish-publish-button').addClass('disabled');
	}
};