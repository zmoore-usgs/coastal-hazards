var config = {
	endpoint: {
		wfs: '',
		wfsValid: false,
		wfsCaps: null,
		wms: '',
		wmsValid: false,
		type: ''
	}
};

$(document).ready(function() {

	$('#publish-publish-button').on('click', bindPublishButton);
	$('#publish-services-wfs').on('blur', bindWFSEntry);
	$('#publish-services-wms').on('blur', bindWMSEntry);

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
					$.ajax({
						endpoint: contextPath + '/data/metadata/validate/' + responseJSON.fid,
						success: function(data, textStatus, jqXHR) {
							entry.metadata = responseJSON.metadata;
							$('#publish-metadata-validate').html('Valid');
						},
						error: function(data, textStatus, jqXHR) {
							entry.metadata = '';
							$('#publish-metadata-validate').html('Invalid');
						}
					});
				} else {
					entry.metadata = '';
					$('#publish-metadata-validate').html('Invalid');
				}
			}
		}
	});

	$('.publish-select-type-type').val($('#publish-select-type-type option:first').val()).trigger('change');
});

var bindWFSEntry = function(evt) {
	evt.stopPropagation();
	var value = evt.target.value;
	var endpoint = buildServiceEndpoint(value);

	if (endpoint.toLowerCase() === config.endpoint.wms) {
		return;
	}
	;

	if (endpoint !== null && endpoint.toLowerCase() !== config.endpoint.wfs) {
		config.endpoint.wfs = endpoint;
		getWFSCapabilities({
			endpoint: endpoint,
			callbacks: {
				success: [
					function(caps) {
						var slBox = $('#publish-services-types');
						slBox.off('change', bindServices);
						slBox.empty();
						if (caps && caps.featureTypeList.featureTypes.length) {
							config.endpoint.wfsValid = true;
							config.endpoint.wfsCaps = caps;

							var namespace;
							if (config.endpoint.type === 'geoserver') {
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
							config.endpoint.wfsValid = false;
							config.endpoint.wfsCaps = null;
							$('#publish-services-wfs-validate')
									.removeClass('valid')
									.addClass('invalid')
									.html('Invalid');
						}
						slBox.on('change', bindServices);
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

var bindWMSEntry = function(evt) {
	evt.stopPropagation();
	var value = evt.target.value;
	var endpoint = buildServiceEndpoint(value);

	if (endpoint.toLowerCase() === config.endpoint.wms) {
		return;
	}
	;

	if (endpoint !== null) {
		config.endpoint.wms = endpoint;
		getWMSCapabilities({
			endpoint: endpoint,
			callbacks: {
				success: [
					function(caps) {
						var slBox = $('#publish-services-layers');
						slBox.off('change', bindServices);
						slBox.empty();
						if (caps && caps.capability.layers.length) {
							config.endpoint.wmsValid = true;
							config.endpoint.wmsCaps = caps;

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
							config.endpoint.wmsValid = false;
							config.endpoint.wmsCaps = null;
							$('#publish-services-wms-validate')
									.removeClass('valid')
									.addClass('invalid')
									.html('Invalid');
						}
						slBox.on('change', bindLayers);
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
			config.endpoint.type = 'arcgis';
		} else if (endpoint.toLowerCase().has('olga.er.usgs.gov')) {
			urlIndex = endpoint.indexOf('services') + 8;
			updatedEndpoint = contextPath + '/stpgis/' + endpoint.substring(urlIndex);
			config.endpoint.type = 'arcgis';
		} else if (endpoint.toLowerCase().has('cida.usgs.gov')) {
			urlIndex = endpoint.indexOf('geoserver') + 10;
			updatedEndpoint = contextPath + '/cidags/' + endpoint.substring(urlIndex);
			config.endpoint.type = 'geoserver';
		}
		var indexOfQueryStart = updatedEndpoint ? updatedEndpoint.indexOf('?') : -1;
		if (indexOfQueryStart !== -1) {
			return updatedEndpoint.substring(0, indexOfQueryStart);
		}
	}
	return updatedEndpoint;
};

var getWFSCapabilities = function(args) {
	args = args || {}
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
	args = args || {}
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

	$.ajax(config.endpoint.wfs, {
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

var bindServices = function(evt) {
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

var bindLayers = function(evt) {
	var val = evt.target.value;
}

var previewButtonClickHandler = function(evt) {
	var btn = evt.target;
	var attName = $(btn).attr('name');
};

var bindPublishButton = function(evt) {
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


var historicAttributes = ['date_', 'lrr', 'wlr', 'sce', 'nsm', 'epr'];
var vulnAttributes = ['waverisk', 'tiderisk', 'sloperisk', 'errrisk', 'slrisk', 'cvirisk'];
var stormAttributes = ['pcol1', 'pcol2', 'pcol3', 'pcol4', 'pcol5', 'povw1', 'povw2', 'povw3', 'povw4', 'povw5', 'pind1', 'pind2', 'pind3', 'pind4', 'pind5'];
var combinedAttributes = historicAttributes.concat(vulnAttributes, stormAttributes);