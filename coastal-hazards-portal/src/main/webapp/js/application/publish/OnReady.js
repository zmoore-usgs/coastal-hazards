/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global initializeLogging*/
/*global qq*/
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
	
	CCH.Auth.checkAuthStatus();

	$(document).ajaxStart(function () {
		$('body').css('cursor', 'wait');
	});
	$(document).ajaxStop(function () {
		$('body').css('cursor', 'default');
	});

	CCH.ows = new CCH.Util.OWS().init();

	CCH.ui = new CCH.Objects.Publish.UI();

	CCH.ui.addUserInformationToForm({
		data: CCH.CONFIG.user
	});

	CCH.search = new CCH.Util.Search();

	// First load all of the items in the application.
	// TODO This might prove to be an inefficient way of loading items.
	CCH.search.submitItemSearch({
		subtree: true,
		showDisabled: true,
		callbacks: {
			success: [
				function (itemsJSON) {
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
						$option,
						$list = $('#publish-button-edit-existing-list'),
						sortedItems;

					CCH.items.each(function (item) {
						rootOutChildren(item);
					});

					CCH.items.each(function (item) {
						$option = $('<li />').
							append(
								$('<a />').
								attr({
									'href': CCH.CONFIG.contextPath + '/publish/item/' + item.id
								}).
								html(item.summary.full.title));
						$list.append($option);
					});
					sortedItems = $list.find('li').toArray().sortBy(function (li) {
						return $(li).find('a').html();
					});
					$list.empty().append(sortedItems);
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
							CCH.search.submitItemSearch({
								item: CCH.itemid,
								displayNotification: false,
								callbacks: {
									success: [
										function (itemJSON) {
											CCH.CONFIG.item = itemJSON;
											CCH.ui.addItemToForm({
												data: CCH.CONFIG.item
											});
										}
									],
									error: [
										function () {
											// TODO- Not sure how to handle this error just yet
										}
									]
								}
							});
						}
					}
				}
			],
			error: [
				function (err) {
					// TODO- Not sure how to handle this error just yet
				}
			]
		}
	});
});

var buildServiceEndpoint = function (endpoint) {
	var updatedEndpoint = null;
	var urlIndex = 0;
	if (endpoint && endpoint.toLowerCase().indexOf('http') !== -1) {
		if (endpoint.toLowerCase().has('coastalmap.marine.usgs.gov')) {
			urlIndex = endpoint.indexOf('cmgp/') + 5;
			updatedEndpoint = contextPath + '/marine/' + endpoint.substring(urlIndex);
			CCH.config.endpoint.servertype = 'arcgis';
		} else if (endpoint.toLowerCase().has('olga.er.usgs.gov')) {
			urlIndex = endpoint.indexOf('services') + 8;
			updatedEndpoint = contextPath + '/stpgis/' + endpoint.substring(urlIndex);
			CCH.config.endpoint.servertype = 'arcgis';
		} else if (endpoint.toLowerCase().has('cida.usgs.gov')) {
			urlIndex = endpoint.indexOf('geoserver') + 10;
			updatedEndpoint = contextPath + '/cidags/' + endpoint.substring(urlIndex);
			CCH.config.endpoint.servertype = 'geoserver';
		}
		var indexOfQueryStart = updatedEndpoint ? updatedEndpoint.indexOf('?') : -1;
		if (indexOfQueryStart !== -1) {
			return updatedEndpoint.substring(0, indexOfQueryStart);
		}
	}
	return updatedEndpoint;
};

var serviceTypesDropdownChangeHandler = function (evt) {
	var val = evt.target.value;
	var namespace = val.split(':')[0];
	var layer = val.split(':')[1];
	describeFeatureType({
		layername: layer,
		callbacks: {
			success: [
				function (featuresDescription) {
					$('#attribute-checkbox-list').empty();
					featuresDescription.featureTypes[0].properties.each(function (prop) {
						var name = prop.name;
						var nameTlc = name.toLowerCase();
						if (nameTlc !== 'objectid' && nameTlc !== 'shape_length' && nameTlc !== 'shape_len') {
							var li = $('<li />').attr('id', 'li-' + name);
							var cb = $('<input />').attr({
								'type': 'checkbox',
								'value': name
							}).addClass('attr-checkbox');
							var nameSpan = $('<span />').addClass('name-span').html(name);
							if (!CCH.config.type) {
								// Using the attribute, match it to a type
								CCH.config.type = deriveTypeFromAttribute(nameTlc);
							}
							var previewButton = $('<button />').addClass('publish-preview-button btn btn-default disabled').attr('id', 'btn-preview-' + name).attr('name', name).html('Preview');
							var controls = $('<span />').addClass('publish-container-actions').append(previewButton);
							li.append(cb, nameSpan, controls);
							$('#attribute-checkbox-list').append(li);
							cb.on('change', bindCheckbox);
							previewButton.on('click', previewButtonClickHandler);
						}
					});
				}
			]
		}
	});
};

var deriveTypeFromAttribute = function (name) {
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
	var wmsLayer = CCH.config.endpoint.wmsCaps.capability.layers.find(function (l) {
		return l.name === evt.target.value;
	});
	var bbox = wmsLayer.llbbox;
	CCH.config.bbox = bbox;
};

var formatEndpoint = function (e) {
	var cutoffIndex = e.indexOf('?');
	if (cutoffIndex !== -1) {
		return e.substring(0, cutoffIndex);
	} else {
		return e;
	}
};

var previewButtonClickHandler = function (evt) {
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

var publishButtonClickHandler = function () {
	CCH.config.attributes = $(".attr-checkbox:checked").map(function (ind, cb) {
		return cb.value;
	}).toArray();

	if (CCH.config.attributes.length) {
		publishMetadata({
			token: CCH.config.metadataToken,
			callbacks: {
				success: [
					function (data, status, xhr) {
						CCH.config.metadataUrl = data.metadata;
						publish();
					}
				],
				error: [
					function (xhr, status, error) {
						console.log('Could not parse metadata: ' + error);
					}
				]
			}
		});
	}
};

var bindCheckbox = function (evt) {
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

var getFullEndpoint = function (val) {
	var queryBegin = val.indexOf('?');
	var fullPath;

	if (queryBegin === -1) {
		fullPath = val;
	} else {
		fullPath = val.substring(0, queryBegin);
	}

	return fullPath;
};