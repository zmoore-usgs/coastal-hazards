var OWS = function() {
	LOG.info('OWS.js::constructor: OWS class is initializing.');
	var me = (this === window) ? {} : this;

	
	me.servers = {
		'cida-geoserver': {
			endpoints: {
				endpoint: CONFIG.data.sources['cida-geoserver'].endpoint,
				proxy: CONFIG.data.sources['cida-geoserver'].proxy,
				wmsGetCapsUrl: CONFIG.data.sources['cida-geoserver'].proxy + 'ows?service=wms&version=1.3.0&request=GetCapabilities',
				wfsGetCapsUrl: CONFIG.data.sources['cida-geoserver'].proxy + 'ows?service=wfs&version=1.1.0&request=GetCapabilities',
				wfsGetFeatureUrl: CONFIG.data.sources['cida-geoserver'].proxy + 'ows?service=wfs&version=1.0.0&request=GetFeature'
			},
			data: {
				wms: {
					capabilities: {
						xml: '',
						object: {}
					}
				},
				wfs: {
					capabilities: {
						xml: '',
						object: {}
					}
				}
			}
		},
		'stpete-arcserver-vulnerability-se-erosion': {
			endpoints: {
				endpoint: CONFIG.data.sources['stpete-arcserver'].endpoint,
				proxy: CONFIG.data.sources['stpete-arcserver'].proxy,
				wmsGetCapsUrl: CONFIG.data.sources['stpete-arcserver'].proxy + 'Vulnerability/SE_erosion_hazards/MapServer/WMSServer?request=GetCapabilities&version=1.3.0&service=WMS',
				wmsGetImageUrl : CONFIG.data.sources['stpete-arcserver'].proxy + 'Vulnerability/SE_erosion_hazards/MapServer/WMSServer?'
			},
			data: {
				wms: {
					capabilities: {
						xml: '',
						object: {}
					}
				},
				wfs: {
					capabilities: {
						xml: '',
						object: {}
					}
				}
			}
		},
		'stpete-arcserver-vulnerability-se-dune': {
			endpoints: {
				endpoint: CONFIG.data.sources['stpete-arcserver'].endpoint,
				proxy: CONFIG.data.sources['stpete-arcserver'].proxy,
				wmsGetCapsUrl: CONFIG.data.sources['stpete-arcserver'].proxy + 'Vulnerability/SE_dune_vulnerability/MapServer/WMSServer?request=GetCapabilities&service=WMS'
			},
			data: {
				wms: {
					capabilities: {
						xml: '',
						object: {}
					}
				},
				wfs: {
					capabilities: {
						xml: '',
						object: {}
					}
				}
			}
		}
	};
	LOG.debug('OWS.js::constructor: OWS class initialized.');
	return $.extend(me, {
		getWMSCapabilities: function(args) {
			var callbacks = args.callbacks || {};
			var sucessCallbacks = callbacks.success || [];
			var errorCallbacks = callbacks.error || [];
			var server = args.server;
			var namespace = args.namespace || 'ows';
			var url = me.servers[server].endpoints.wmsGetCapsUrl;

			LOG.debug('OWS.js::getWMSCapabilities: A request is being made for WMS GetCapabilities for the namespace: ' + namespace);
			$.ajax(url, {
				context: args,
				success: function(data, textStatus, jqXHR) {
					var response = new OpenLayers.Format.WMSCapabilities.v1_3_0().read(data);

					// Fixes an issue with prefixes not being parsed correctly from response
					response.capability.layers.each(function(n, i) {
						n.prefix = namespace;
					});
					me.servers[server].data.wms.capabilities.object = response;
					me.servers[server].data.wms.capabilities.xml = data;

					sucessCallbacks.each(function(callback) {
						callback({
							wmsCapabilities: response,
							data: data,
							textStatus: textStatus,
							jqXHR: jqXHR,
							context: args
						});
					});
				},
				error: function(data, textStatus, jqXHR) {
					$(errorCallbacks).each(function(index, callback, allCallbacks) {
						callback({
							data: data,
							textStatus: textStatus,
							jqXHR: jqXHR
						});
					});
				}
			});
		},
		getFilteredFeature: function(args) {
			LOG.info('OWS.js::getFilteredFeature');
			LOG.debug('OWS.js::getFilteredFeature: Building request for WFS GetFeature (filtered)');
			var layerName = args.layerName;
			var layerPrefix = layerName.split(':')[0];
			var layerTitle = layerName.split(':')[1];
			var scope = args.scope;
			var propertyArray = args.propertyArray;
			var callbacks = args.callbacks;

			var url = me.geoserverProxyEndpoint + layerPrefix + '/wfs?service=wfs&version=1.1.0&outputFormat=GML2&request=GetFeature&typeName=' + layerName + '&propertyName=';
			url += (propertyArray || []).join(',');

			$.ajax(url, {
				context: scope || this,
				success: function(data, textStatus, jqXHR) {
					LOG.trace('OWS.js::getFilteredFeature: Successfully received WFS GetFeature response.');
					var gmlReader = new OpenLayers.Format.GML.v3();
					var getFeatureResponse = gmlReader.read(data);
					LOG.debug('OWS.js::getFilteredFeature: WFS GetFeature parsed .');
					if (!me.featureTypeDescription[layerPrefix]) {
						me.featureTypeDescription[layerPrefix] = Object.extended();
					}
					me.featureTypeDescription[layerPrefix][layerTitle] = getFeatureResponse;

					LOG.trace('OWS.js::getFilteredFeature: Executing ' + callbacks.success + 'callbacks');
					$(callbacks.success || []).each(function(index, callback, allCallbacks) {
						LOG.trace('OWS.js::getFilteredFeature: Executing callback ' + index);
						callback(getFeatureResponse, this);
					})
				},
				error: function(data, textStatus, jqXHR) {
					$(callbacks.error || []).each(function(index, callback, allCallbacks) {
						callback(data, this);
					})
				}
			})
		}
	});
};