var CCH = {
	config: {
		metadataToken: '',
		metadataUrl: '',
		bbox: [],
		type: '',
		attributes: [],
		endpoint: {
			wfs: '',
			wfsFullpath: '',
			wfsValid: false,
			wfsCaps: null,
			wms: '',
			wmsFullpath: '',
			wmsValid: false,
			servertype: ''
		}
	},
	items: []
};
$(document).ready(function() {

	$('#publish-publish-button').on('click', publishButtonClickHandler);
	$('#publish-services-wfs').on('blur', wfsInputboxBlurHandler);
	$('#publish-services-wms').on('blur', wmsInputBoxBlurHandler);
	new qq.FineUploader({
		element: $('#publish-metadata-upload-button')[0],
		autoUpload: true,
		paramsInBody: false,
		forceMultipart: false,
		request: {
			endpoint: contextPath + '/data/metadata/'
		},
		validation: {
			allowedExtensions: ['xml'],
			sizeLimit: 15728640
		},
		classes: {
			success: 'alert alert-success',
			fail: 'alert alert-error'
		},
		callbacks: {
			onComplete: function(id, fileName, responseJSON) {

				if (responseJSON.success) {
					CCH.config.metadataToken = responseJSON.fid;
					$('#publish-metadata-validate').html('Valid');
				} else {
					CCH.config.metadataToken = '';
					$('#publish-metadata-validate').html('Invalid');
				}
			}
		}
	});
	$('.publish-select-type-type').val($('#publish-select-type-type option:first').val()).trigger('change');
});
var wfsInputboxBlurHandler = function(evt) {
	evt.stopPropagation();
	var value = evt.target.value;
	var endpoint = buildServiceEndpoint(value);
	if (!endpoint || endpoint.toLowerCase() === CCH.config.endpoint.wms) {
		return;
	}
	;
	if (endpoint !== null && endpoint.toLowerCase() !== CCH.config.endpoint.wfs) {
		CCH.config.endpoint.wfs = endpoint;
		CCH.config.type = '';
		getWFSCapabilities({
			endpoint: endpoint,
			callbacks: {
				success: [
					function(caps) {
						var slBox = $('#publish-services-types');
						slBox.off('change', serviceTypesDropdownChangeHandler);
						slBox.empty();
						if (caps && caps.featureTypeList.featureTypes.length) {
							CCH.config.endpoint.wfsFullpath = getFullEndpoint($('#publish-services-wfs').val());
							CCH.config.endpoint.wfsValid = true;
							CCH.config.endpoint.wfsCaps = caps;
							var namespace;
							if (CCH.config.endpoint.servertype === 'geoserver') {
								namespace = caps.featureTypeList.featureTypes[0].featureNS;
							} else {
								namespace = caps.service.name;
							}

							caps.featureTypeList.featureTypes.each(function(ft) {
								slBox.append(
										$('<option />').attr('value', namespace + ':' + ft.name).html(ft.name)
										);
							});
							$('#publish-services-wfs-validate')
									.removeClass('invalid')
									.addClass('valid')
									.html('Valid');
						} else {
							CCH.config.endpoint.wfsValid = false;
							CCH.config.endpoint.wfsCaps = null;
							$('#publish-services-wfs-validate')
									.removeClass('valid')
									.addClass('invalid')
									.html('Invalid');
						}
						slBox.on('change', serviceTypesDropdownChangeHandler);
						slBox.trigger('change');
					}
				]
			}
		});
	} else {
		$('#publish-services-wfs-validate')
				.removeClass('valid')
				.addClass('invalid')
				.html('Invalid');
	}
};
var wmsInputBoxBlurHandler = function(evt) {
	evt.stopPropagation();
	var value = evt.target.value;
	var endpoint = buildServiceEndpoint(value);
	if (!endpoint || endpoint.toLowerCase() === CCH.config.endpoint.wms) {
		return;
	}
	;
	if (endpoint !== null) {
		CCH.config.endpoint.wms = endpoint;
		getWMSCapabilities({
			endpoint: endpoint,
			callbacks: {
				success: [
					function(caps) {
						var slBox = $('#publish-services-layers');
						slBox.off('change', wmsLayersDropdownChangeHandler);
						slBox.empty();
						if (caps && caps.capability.layers.length) {
							CCH.config.endpoint.wmsFullpath = getFullEndpoint($('#publish-services-wms').val());
							CCH.config.endpoint.wmsValid = true;
							CCH.config.endpoint.wmsCaps = caps;
							caps.capability.layers.each(function(l) {
								slBox.append(
										$('<option />').attr('value', l.name).html(l.name)
										);
							});
							$('#publish-services-wms-validate')
									.removeClass('invalid')
									.addClass('valid')
									.html('Valid');
						} else {
							CCH.config.endpoint.wmsValid = false;
							CCH.config.endpoint.wmsCaps = null;
							$('#publish-services-wms-validate')
									.removeClass('valid')
									.addClass('invalid')
									.html('Invalid');
						}
						slBox.on('change', wmsLayersDropdownChangeHandler);
						slBox.trigger('change');
					}
				]
			}
		});
	} else {
		$('#publish-services-wms-validate')
				.removeClass('valid')
				.addClass('invalid')
				.html('Invalid');
	}
};
var buildServiceEndpoint = function(endpoint) {
	var updatedEndpoint = null;
	var urlIndex = 0;
	if (endpoint) {
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
var getWFSCapabilities = function(args) {
	args = args || {};
	var endpoint = args.endpoint;
	var callbacks = args.callbacks || {
		success: [],
		error: []
	};
	$.ajax(endpoint, {
		data: {
			request: 'GetCapabilities',
			service: 'WFS',
			version: '1.0.0'
		},
		success: function(data, textStatus, jqXHR) {
			var getCapsResponse = new OpenLayers.Format.WFSCapabilities.v1_0_0().read(data);
			$(callbacks.success).each(function(index, callback, allCallbacks) {
				callback(getCapsResponse, this);
			});
		},
		error: function(data, textStatus, jqXHR) {
			$(callbacks.error).each(function(index, callback, allCallbacks) {
				callback(getCapsResponse, this);
			});
		}
	});
};
var getWMSCapabilities = function(args) {
	args = args || {};
	var endpoint = args.endpoint;
	var callbacks = args.callbacks || {
		success: [],
		error: []
	};
	$.ajax(endpoint, {
		data: {
			request: 'GetCapabilities',
			service: 'WMS',
			version: '1.1.0'
		},
		success: function(data, textStatus, jqXHR) {
			var getCapsResponse = new OpenLayers.Format.WMSCapabilities.v1_1_0().read(data);
			$(callbacks.success).each(function(index, callback, allCallbacks) {
				callback(getCapsResponse, this);
			});
		},
		error: function(data, textStatus, jqXHR) {
			$(callbacks.error).each(function(index, callback, allCallbacks) {
				callback(getCapsResponse, this);
			});
		}
	});
};
var describeFeatureType = function(args) {
	args = args || {};
	var callbacks = args.callbacks || {
		success: [],
		error: []
	};
	$.ajax(CCH.config.endpoint.wfs, {
		data: {
			request: 'DescribeFeaturetype',
			service: 'WFS',
			version: '1.0.0',
			typename: args.layername || ''
		},
		success: function(data, textStatus, jqXHR) {
			var describeFTResponse = new OpenLayers.Format.WFSDescribeFeatureType().read(data);
			$(callbacks.success).each(function(index, callback, allCallbacks) {
				callback(describeFTResponse, this);
			});
		},
		error: function(data, textStatus, jqXHR) {
			$(callbacks.error).each(function(index, callback, allCallbacks) {
				callback(describeFTResponse, this);
			});
		}
	});
};
var serviceTypesDropdownChangeHandler = function(evt) {
	var val = evt.target.value;
	var namespace = val.split(':')[0];
	var layer = val.split(':')[1];
	describeFeatureType({
		layername: layer,
		callbacks: {
			success: [
				function(featuresDescription) {
					$('#attribute-checkbox-list').empty();
					featuresDescription.featureTypes[0].properties.each(function(prop) {
						var name = prop.name;
						var nameTlc = name.toLowerCase();
						if (nameTlc !== 'objectid' && nameTlc !== 'shape_length' && nameTlc !== 'shape_len') {
							var li = $('<li />').attr('id', 'li-' + name);
							var cb = $('<input />').attr({
								'type': 'checkbox',
								'value': name,
							}).addClass('attr-checkbox');
							var nameSpan = $('<span />').addClass('name-span').html(name);
							if (!CCH.config.type) {
								// Using the attribute, match it to a type
								CCH.config.type = deriveTypeFromAttribute(nameTlc);
							}
//							}
							var previewButton = $('<button />').addClass('publish-preview-button btn disabled').attr('id', 'btn-preview-' + name).attr('name', name).html('Preview');
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
var deriveTypeFromAttribute = function(name) {
	if (historicAttributes.indexOf(name) !== -1) {
		return 'historical';
	} else if (vulnAttributes.indexOf(name) !== -1) {
		return 'vulnerability';
	} else if (stormAttributes.indexOf(name) !== -1) {
		return 'storms';
	} else {
		return '';
	}
};
var wmsLayersDropdownChangeHandler = function(evt) {
	var wmsLayer = CCH.config.endpoint.wmsCaps.capability.layers.find(function(l) {
		return l.name === evt.target.value;
	});
	var bbox = wmsLayer.llbbox;//wmsLayer.bbox['EPSG:4326'].bbox;
	CCH.config.bbox = bbox;
};

var formatEndpoint = function(e) {
		var cutoffIndex = e.indexOf('?');
		if (cutoffIndex !== -1) {
			return e.substring(0, cutoffIndex);
		} else {
			return e;
		}
	}

var previewButtonClickHandler = function(evt) {
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
				function(data, status, xhr) {
					var id = data.id;
					window.open(contextPath + '/ui/item/' + id);
				}
			],
			error: [
				function(xhr, status, error) {
					// TODO- Handle this
				}
			]
		}
	})
};

var publishPreview = function(args) {
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
		success: function(json, textStatus, jqXHR) {
			if (callbacks.success && callbacks.success.length > 0) {
				callbacks.success.each(function(callback) {
					callback.call(null, json, textStatus, jqXHR);
				});
			}
		},
		error: function(xhr, status, error) {
			if (callbacks.error && callbacks.error.length > 0) {
				callbacks.error.each(function(callback) {
					callback.call(null, xhr, status, error);
				});
			}
		}
	});
}

var publishMetadata = function(args) {
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
		success: function(json, textStatus, jqXHR) {
			if (callbacks.success && callbacks.success.length > 0) {
				callbacks.success.each(function(callback) {
					callback.call(null, json, textStatus, jqXHR);
				});
			}
		},
		error: function(xhr, status, error) {
			if (callbacks.error && callbacks.error.length > 0) {
				callbacks.error.each(function(callback) {
					callback.call(null, xhr, status, error);
				});
			}
		}
	});
};

var publishData = function(args) {
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
		success: function(json, textStatus, jqXHR) {
			if (callbacks.success && callbacks.success.length > 0) {
				callbacks.success.each(function(callback) {
					callback.call(null, json, textStatus, jqXHR);
				});
			}
		},
		error: function(xhr, status, error) {
			if (callbacks.error && callbacks.error.length > 0) {
				callbacks.error.each(function(callback) {
					callback.call(null, xhr, status, error);
				});
			}
		}
	});
};

var getItem = function(args) {
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
		success: function(json, textStatus, jqXHR) {
			if (callbacks.success && callbacks.success.length > 0) {
				callbacks.success.each(function(callback) {
					callback.call(null, json, textStatus, jqXHR);
				});
			}
		},
		error: function(xhr, status, error) {
			if (callbacks.error && callbacks.error.length > 0) {
				callbacks.error.each(function(callback) {
					callback.call(null, xhr, status, error);
				});
			}
		}
	});
};

var publish = function(args) {
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
					function(data, textStatus, jqXHR) {
						var id = data.id;
						// Using the preview item id,  pull the item
						getItem({
							itemId: id,
							callbacks: {
								success: [
									function(data, textStatus, jqXHR) {
										var pData = data;
										pData.metadata = CCH.config.metadataUrl;
										// Publish the item from the preview
										publishData({
											publishData: pData,
											callbacks: {
												success: [
													function(data, textStatus, jqXHR) {
														// Using the published item, update the popularity
														CCH.Util.updateItemPopularity({
															item: data.id,
															type: 'publish',
															contextPath: contextPath
														});
														CCH.Util.updateItemPopularity({
															item: data.id,
															type: 'insert',
															contextPath: contextPath
														});
														console.log('PUBLISHED');
														publish();
													}
												],
												error: [
													function(xhr, status, error) {
														console.log('ERR: NOT PUBLISHED: ' + error);
														publish();
													}
												]
											}
										});
									}
								], error: [
									function(xhr, status, error) {
										console.log('ERR: NOT PUBLISHED: ' + error);
										publish();
									}
								]
							}
						});
					}
				],
				error: [
					function(xhr, status, error) {
						console.log('ERR: NOT PUBLISHED: ' + error);
						publish();
					}
				]
			}
		});
	}
};

var publishButtonClickHandler = function() {
	CCH.config.attributes = $(".attr-checkbox:checked").map(function(ind, cb) {
		return cb.value;
	}).toArray();

	if (CCH.config.attributes.length) {
		publishMetadata({
			token: CCH.config.metadataToken,
			callbacks: {
				success: [
					function(data, status, xhr) {
						CCH.config.metadataUrl = data.metadata;
						publish();
					}
				],
				error: [
					function(xhr, status, error) {
						console.log('Could not parse metadata: ' + error);
					}
				]
			}
		});
	}
};

var bindCheckbox = function(evt) {
	var cb = evt.target;
	var value = cb.value;
	var checked = cb.checked;
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

var getFullEndpoint = function(val) {
	var queryBegin = val.indexOf('?');
	var fullPath;

	if (queryBegin === -1) {
		fullPath = val;
	} else {
		fullPath = val.substring(0, queryBegin);
	}

	return fullPath;
};

var historicAttributes = ['date_', 'lrr', 'wlr', 'sce', 'nsm', 'epr'];
var vulnAttributes = ['waverisk', 'tiderisk', 'sloperisk', 'errrisk', 'slrisk', 'geom', 'cvirisk', 'rslr', 'mwh', 'tr', 'e_rate', 'peros2', 'peros1', 'pstable', 'pacc1', 'pacc2'];
var stormAttributes = ['pcol','pcol1','pcol2','pcol3','pcol4','pcol5',
        'povw','povw1','povw2','povw3','povw4','povw5',
        'pind','pind1','pind2','pind3','pind4','pind5',
        'dhigh','dlow','dhirms','dlorms',
        'surge','surge1','surge2','surge3','surge4','surge5',
        'setup','setup1','setup2','setup3','setup4','setup5',
        'runup','runup1','runup2','runup3','runup4','runup5',
        'mean','mean1','mean2','mean3','mean4','mean5',
        'extreme','extreme1','extreme2','extreme3','extreme4','extreme5',
        'tide'];
var combinedAttributes = historicAttributes.concat(vulnAttributes, stormAttributes);