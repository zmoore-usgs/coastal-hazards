window.CCH = CCH || {};
CCH.Util = CCH.Util || {};
CCH.Util.OWS = function () {
	CCH.LOG.trace('OWS.js::constructor: OWS class is initializing.');
	var me = (this === window) ? {} : this;

	me.featureTypeDescription = {};

	CCH.LOG.trace('OWS.js::constructor: OWS class initialized.');
	return $.extend(me, {
		init: function () {
			me.servers = {
				'dsas-geoserver': {
					endpoints: {
						endpoint: CCH.CONFIG.data.sources['dsas-geoserver'].endpoint,
						proxy: CCH.CONFIG.data.sources['dsas-geoserver'].proxy,
						wmsGetCapsUrl: CCH.CONFIG.data.sources['dsas-geoserver'].proxy + 'ows?service=wms&version=1.3.0&request=GetCapabilities',
						wfsGetCapsUrl: CCH.CONFIG.data.sources['dsas-geoserver'].proxy + 'ows?service=wfs&version=1.1.0&request=GetCapabilities',
						wfsGetFeatureUrl: CCH.CONFIG.data.sources['dsas-geoserver'].proxy + 'ows?service=wfs&version=1.0.0&request=GetFeature'
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
				'cida-geoserver': {
					endpoints: {
						endpoint: CCH.CONFIG.data.sources['cida-geoserver'].endpoint,
						proxy: CCH.CONFIG.data.sources['cida-geoserver'].proxy,
						wmsGetCapsUrl: CCH.CONFIG.data.sources['cida-geoserver'].proxy + 'ows?service=wms&version=1.3.0&request=GetCapabilities',
						wfsGetCapsUrl: CCH.CONFIG.data.sources['cida-geoserver'].proxy + 'ows?service=wfs&version=1.1.0&request=GetCapabilities',
						wfsGetFeatureUrl: CCH.CONFIG.data.sources['cida-geoserver'].proxy + 'ows?service=wfs&version=1.0.0&request=GetFeature'
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
				'stpete-arcserver': {
					endpoints: {
						endpoint: CCH.CONFIG.data.sources['stpete-arcserver'].endpoint,
						proxy: CCH.CONFIG.data.sources['stpete-arcserver'].proxy
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
				'marine-arcserver': {
					endpoints: {
						endpoint: CCH.CONFIG.data.sources['marine-arcserver'].endpoint,
						proxy: CCH.CONFIG.data.sources['marine-arcserver'].proxy
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
			return me;
		},
		/**
		 * Executes a Geoserver WPS process that uppercases all of the attributes in the layer
		 * 
		 * @param {Object} args 
		 * @returns {undefined}
		 */
		normalizeGeoserverLayerAttributes: function (args) {
			args = args || {};
			var callbacks = args.callbacks || {
				success: [],
				error: []
			},
			workspacePrefixedLayerName = args.workspacePrefixedLayerName,
				wpsFormat = new OpenLayers.Format.WPSExecute(),
				doc = wpsFormat.write({
					identifier: 'gs:NormalizeLayerColumnNames',
					dataInputs: [{
							identifier: 'workspacePrefixedLayerName',
							data: {
								literalData: {
									value: workspacePrefixedLayerName
								}
							}
						}],
					responseForm: {
						rawDataOutput: {
							mimeType: "text/xml",
							identifier: "columnMapping"
						}
					}
				});

			me.postWPS({
				doc: doc,
				callbacks: callbacks,
				url: CCH.CONFIG.contextPath + '/geoserver/wps'
			});
		},
		postWPS: function (args) {
			args = args || {};

			var doc = args.doc,
				url = args.url,
				callbacks = args.callbacks || {
					success: [],
					error: []
				};

			OpenLayers.Request.POST({
				url: url,
				data: doc,
				success: function (response) {
					var trimmedResponse = response.responseText.trim();
					if (trimmedResponse.indexOf('ExceptionText') !== -1) {
						var errorText = $(trimmedResponse).find('ows\\:ExceptionText');
						callbacks.error.forEach(function (cb) {
							cb(errorText.text());
						});
					} else {
						callbacks.success.forEach(function (cb) {
							cb(response);
						});
					}
				}
			});
		},
		describeFeatureType: function (args) {
			args = args || {};
			var callbacks = args.callbacks || {
				success: [],
				error: []
			},
			layername = args.layerName || '',
				sourceServer = args.sourceServer || 'cida-geoserver';
			$.ajax(CCH.CONFIG.contextPath + CCH.CONFIG.data.sources[sourceServer].proxy + 'ows?', {
				data: {
					request: 'DescribeFeaturetype',
					service: 'WFS',
					version: '1.0.0',
					typename: layername || ''
				},
				success: function (data, textStatus, jqXHR) {
					var describeFTResponse = new OpenLayers.Format.WFSDescribeFeatureType().read(data);
					if (Object.keys(describeFTResponse).length > 0) {
						$(callbacks.success).each(function (index, callback, allCallbacks) {
							callback(describeFTResponse);
						});
					} else {
						$(callbacks.error).each(function (index, callback, allCallbacks) {
							callback(data);
						});
					}
				},
				error: function (data, textStatus, jqXHR) {
					$(callbacks.error).each(function (index, callback, allCallbacks) {
						callback(data);
					});
				}
			});
		},
		getWFSCapabilities: function (args) {
			var callbacks = args.callbacks || {},
				sucessCallbacks = callbacks.success || [],
				errorCallbacks = callbacks.error || [],
				server = args.server,
				namespace = args.namespace || 'ows',
				url;

			if ((server === 'dsas-geoserver' || server === 'cida-geoserver') && namespace !== 'ows') {
				url = CCH.CONFIG.contextPath + me.servers[server].endpoints.wfsGetCapsUrl;
				url = url.substr(0, url.indexOf('ows')) + namespace + '/' + url.substr(url.indexOf('ows'));
			} else if (server === 'stpete-arcserver') {
				url = CCH.CONFIG.contextPath + me.servers[server].endpoints.proxy + '/services/' + namespace + '/MapServer/WFSServer?service=wfs&version=1.1.0&request=GetCapabilities';
			} else if (server === 'marine-arcserver') {
				url = CCH.CONFIG.contextPath + me.servers[server].endpoints.proxy + namespace + '/MapServer/WFSServer?service=wfs&version=1.1.0&request=GetCapabilities';
			}

			CCH.LOG.debug('OWS.js::getWMSCapabilities: A request is being made for WMS GetCapabilities for the namespace: ' + namespace);
			$.ajax(url, {
				context: args,
				success: function (data, textStatus, jqXHR) {
					var response = new OpenLayers.Format.WFSCapabilities.v1_1_0().read(data);

					response.featureTypeList.featureTypes.forEach(function (ft) {
						ft.prefix = namespace;
					});

					me.servers[server].data.wfs.capabilities.object = response;
					me.servers[server].data.wfs.capabilities.xml = data;

					sucessCallbacks.forEach(function (callback) {
						callback({
							wfsCapabilities: response,
							data: data,
							textStatus: textStatus,
							jqXHR: jqXHR,
							context: args
						});
					});
				},
				error: function (data, textStatus, jqXHR) {
					$(errorCallbacks).each(function (index, callback, allCallbacks) {
						callback({
							data: data,
							textStatus: textStatus,
							jqXHR: jqXHR
						});
					});
				}
			});
		},
		getWMSCapabilities: function (args) {
			var callbacks = args.callbacks || {},
				sucessCallbacks = callbacks.success || [],
				errorCallbacks = callbacks.error || [],
				server = args.server,
				namespace = args.namespace || 'ows',
				url = args.url;

			if (!url) {
				if ((server === 'dsas-geoserver' || server === 'cida-geoserver') && namespace !== 'ows') {
					url = CCH.CONFIG.contextPath + me.servers[server].endpoints.wmsGetCapsUrl;
					url = url.substr(0, url.indexOf('ows')) + namespace + '/' + url.substr(url.indexOf('ows'));
				} else if (server === 'stpete-arcserver') {
					url = CCH.CONFIG.contextPath + me.servers[server].endpoints.proxy + '/services/' + namespace + '/MapServer/WMSServer?service=wms&version=1.3.0&request=GetCapabilities';
				} else if (server === 'marine-arcserver') {
					url = CCH.CONFIG.contextPath + me.servers[server].endpoints.proxy + namespace + '/MapServer/WMSServer?service=wms&version=1.3.0&request=GetCapabilities';
				}
			}

			CCH.LOG.debug('OWS.js::getWMSCapabilities: A request is being made for WMS GetCapabilities for the namespace: ' + namespace);
			$.ajax(url, {
				context: args,
				success: function (data, textStatus, jqXHR) {
					var response = new OpenLayers.Format.WMSCapabilities.v1_3_0().read(data);

					// Fixes an issue with prefixes not being parsed correctly from response
					response.capability.layers.forEach(function (n, i) {
						n.prefix = namespace;
					});
					me.servers[server].data.wms.capabilities.object = response;
					me.servers[server].data.wms.capabilities.xml = data;

					sucessCallbacks.forEach(function (callback) {
						callback({
							wmsCapabilities: response,
							data: data,
							textStatus: textStatus,
							jqXHR: jqXHR,
							context: args
						});
					});
				},
				error: function (data, textStatus, jqXHR) {
					$(errorCallbacks).each(function (index, callback, allCallbacks) {
						callback({
							data: data,
							textStatus: textStatus,
							jqXHR: jqXHR
						});
					});
				}
			});
		},
		getFilteredFeature: function (args) {
			CCH.LOG.debug('OWS.js::getFilteredFeature: Building request for WFS GetFeature (filtered)');
			var layerName = args.layerName;
			var layerPrefix = layerName.split(':')[0];
			var layerTitle = layerName.split(':')[1];
			var scope = args.scope;
			var propertyArray = args.propertyArray;
			var callbacks = args.callbacks;
			var proxyServer = args.proxyServer || 'cida-geoserver';
			var proxyEndpoint = CCH.CONFIG.data.sources[proxyServer].proxy;

			var url = CCH.CONFIG.contextPath + proxyEndpoint + layerPrefix + '/wfs?service=wfs&version=1.1.0&outputFormat=GML2&request=GetFeature&typeName=' + layerName + '&propertyName=';
			url += (propertyArray || []).join(',');

			return $.ajax(url, {
				context: scope || this,
				success: function (data, textStatus, jqXHR) {
					CCH.LOG.trace('OWS.js::getFilteredFeature: Successfully received WFS GetFeature response.');
					var gmlReader = new OpenLayers.Format.GML.v3();
					var getFeatureResponse = gmlReader.read(data);
					var successCallbacks = callbacks.success || [];

					CCH.LOG.debug('OWS.js::getFilteredFeature: WFS GetFeature parsed .');
					if (!me.featureTypeDescription[layerPrefix]) {
						me.featureTypeDescription[layerPrefix] = {};
					}
					me.featureTypeDescription[layerPrefix][layerTitle] = getFeatureResponse;

					CCH.LOG.trace('OWS.js::getFilteredFeature: Executing ' + callbacks.success + 'callbacks');
					for (var scbIdx = 0; scbIdx < successCallbacks.length; scbIdx++) {
						CCH.LOG.trace('OWS.js::getFilteredFeature: Executing callback ' + scbIdx);
						successCallbacks[scbIdx].call(this, getFeatureResponse);
					}
				},
				error: function (data, textStatus, jqXHR) {
					$(callbacks.error || []).each(function (index, callback, allCallbacks) {
						callback(data, this);
					});
				}
			});
		}
	});
};