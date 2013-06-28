var CCH = {
	config: {
		metadataToken: '',
		bbox: [],
		type: '',
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
							CCH.config.endpoint.wfsFullpath = getFullEndpoint($('#publish-services-wms').val());
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
								'value': name
							});
							var nameSpan = $('<span />').addClass('name-span').html(name);
							var invalidAttribute = combinedAttributes.indexOf(nameTlc) === -1;
							if (invalidAttribute) {
								nameSpan.addClass('muted');
								cb.attr('disabled', 'true');
							} else {
								if (!CCH.config.type) {
									// Using the attribute, match it to a type
									CCH.config.type = deriveTypeFromAttribute(nameTlc);
								}
							}
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

var previewButtonClickHandler = function(evt) {
	var btn = evt.target;
	var attName = $(btn).attr('name');
	var metadataToken = CCH.config.metadataToken;
	var wfs = CCH.config.endpoint.wfsCaps.service.onlineResource;
	var wms = CCH.config.endpoint.wmsCaps.service.href;
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
			typeName: wmsLayers
		},
		name: name,
		type: type,
		attr: attName,
		bbox: bbox
	};
	$.ajax({
		url: contextPath + '/data/item/preview',
		type: 'POST',
		data: JSON.stringify(data),
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		success: function(data, status, xhr) {
			var a = 1;
		},
		error: function(xhr, status, error) {

		}
	});
};
var publishButtonClickHandler = function(evt) {
	var btn = evt.target;
	var attName = $(btn).attr('name');
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
var vulnAttributes = ['waverisk', 'tiderisk', 'sloperisk', 'errrisk', 'slrisk', 'cvirisk', 'rslr', 'mwh', 'tr', 'e_rate', 'peros2', 'peros1', 'pstable', 'pacc1', 'pacc2'];
var stormAttributes = ['pcol1', 'pcol2', 'pcol3', 'pcol4', 'pcol5', 'povw1', 'povw2', 'povw3', 'povw4', 'povw5', 'pind1', 'pind2', 'pind3', 'pind4', 'pind5'];
var combinedAttributes = historicAttributes.concat(vulnAttributes, stormAttributes);