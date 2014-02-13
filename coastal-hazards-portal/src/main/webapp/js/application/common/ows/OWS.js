var CCH = CCH || {};
CCH.Objects.OWS = function() {
    CCH.LOG.info('OWS.js::constructor: OWS class is initializing.');
    var me = (this === window) ? {} : this;
    
    me.featureTypeDescription = {};
    
    CCH.LOG.debug('OWS.js::constructor: OWS class initialized.');
    return $.extend(me, {
        init: function () {
            me.servers = {
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
        importWfsLayer : function (args) {
            args = args || {};
            var callbacks = args.callbacks || {
                success : [],
                error : []
            },
            endpoint = args.endpoint,
            param = args.param,
            referenceUrl =  endpoint +
                '?service=wfs&version=1.0.0&request=GetFeature&typeNames=' +
                param,
            wpsFormat = new OpenLayers.Format.WPSExecute(),
            doc = wpsFormat.write({
                identifier: "gs:Import",
                dataInputs: [{
                        identifier: "features",
                        reference: {
                            mimeType: 'text/xml; subtype=wfs-collection/1.0',
                            href: referenceUrl,
                            method: 'GET'
                        }
                    },
                    {
                        identifier: "workspace",
                        data: {
                            literalData: {
                                value: 'proxied'
                            }
                        }
                    },
                    {
                        identifier: "store",
                        data: {
                            literalData: {
                                value: 'proxied'
                            }
                        }
                    },
					{
                        identifier: "name",
                        data: {
                            literalData: {
                                value: (param.indexOf(':') !== -1 ? param.split(':')[1] : param) + '_' + new Date().getTime()
                            }
                        }
                    },
                    {
                        identifier: "srs",
                        data: {
                            literalData: {
                                value: 'EPSG:3857'
                            }
                        }
                    },
                    {
                        identifier: "srsHandling",
                        data: {
                            literalData: {
                                value: 'REPROJECT_TO_DECLARED'
                            }
                        }
                    }
                ],
                responseForm: {
                    rawDataOutput: {
                        mimeType: "text/xml",
                        identifier: "layerName"
                    }
                }
            });

            OpenLayers.Request.POST({
                url: CCH.CONFIG.contextPath + '/geoserver/wps',
                data:doc,
                success:function(response){
                    var errorText = $(response.responseText).find('ows\\:ExceptionText');
                    if (errorText.length === 0) {
                        callbacks.success.each(function (cb) {
                            cb(response);
                        });
                    } else {
                        callbacks.error.each(function (cb) {
                            cb(errorText.text());
                        });
                    }
                }
            });
        },
        generateThumbnail : function(args) {
            args = args || {};
            var id = args.id,
                callbacks = args.callbacks || {
                    success : [],
                    error : []
                },
                wpsFormat = new OpenLayers.Format.WPSExecute(),
                doc = wpsFormat.write({
                    identifier: "org.n52.wps.server.r.thumbnail.service",
                    dataInputs: [{
                        identifier: "url",
                        data: {
                            literalData: {
                                value: CCH.CONFIG.contextPath + '/data/item/' + id
                            }
                        }
                    }],
                    responseForm: {
                        rawDataOutput: {
                            encoding: "base64",
                            identifier: "output"
                        }
                    }
                });
                
            OpenLayers.Request.POST({
                url: CCH.CONFIG.contextPath + '/52n/WebProcessingService',
                data:doc,
                success:function(response){
                    var trimmedResponse = response.responseText.trim();
                    if (trimmedResponse.indexOf('ExceptionText') !== -1) {
                        var errorText = $(trimmedResponse).find('ows\\:ExceptionText');
                        callbacks.error.each(function (cb) {
                            cb(errorText.text());
                        });
                    } else {
                        callbacks.success.each(function (cb) {
                            cb(trimmedResponse);
                        });
                    }
                }
            });
        },
        describeFeatureType : function(args) {
            args = args || {};
            var callbacks = args.callbacks || {
                success: [],
                error: []
            },
                layername = args.layerName || '';
            $.ajax(CCH.CONFIG.contextPath + CCH.CONFIG.data.sources['cida-geoserver'].proxy + 'ows?', {
                data: {
                    request: 'DescribeFeaturetype',
                    service: 'WFS',
                    version: '1.0.0',
                    typename: layername || ''
                },
                success: function(data, textStatus, jqXHR) {
                    var describeFTResponse = new OpenLayers.Format.WFSDescribeFeatureType().read(data);
					if (Object.keys(describeFTResponse).length > 0) {
						$(callbacks.success).each(function(index, callback, allCallbacks) {
							callback(describeFTResponse);
						});
					} else {
						$(callbacks.error).each(function(index, callback, allCallbacks) {
							callback(data);
						});
					}
                },
                error: function(data, textStatus, jqXHR) {
                    $(callbacks.error).each(function(index, callback, allCallbacks) {
                        callback(data);
                    });
                }
            });
        },
        getWFSCapabilities: function(args) {
            var callbacks = args.callbacks || {},
                sucessCallbacks = callbacks.success || [],
                errorCallbacks = callbacks.error || [],
                server = args.server,
                namespace = args.namespace || 'ows',
                url;
        
            if (server === 'cida-geoserver' && namespace !== 'ows') {
                url = CCH.CONFIG.contextPath + me.servers[server].endpoints.wfsGetCapsUrl;
                url = url.add(namespace + '/', url.indexOf('ows'));
            } else if (server === 'stpete-arcserver') {
                url = CCH.CONFIG.contextPath + me.servers[server].endpoints.proxy + '/services/' + namespace + '/MapServer/WFSServer?service=wfs&version=1.1.0&request=GetCapabilities';
            } else if ( server === 'marine-arcserver') {
                url = CCH.CONFIG.contextPath + me.servers[server].endpoints.proxy + namespace + '/MapServer/WFSServer?service=wfs&version=1.1.0&request=GetCapabilities';
            }
            
            CCH.LOG.debug('OWS.js::getWMSCapabilities: A request is being made for WMS GetCapabilities for the namespace: ' + namespace);
            $.ajax(url, {
                context: args,
                success: function(data, textStatus, jqXHR) {
                    var response = new OpenLayers.Format.WFSCapabilities.v1_1_0().read(data);
                    
                    response.featureTypeList.featureTypes.each(function (ft) {
                        ft.prefix = namespace;
                    });
                    
                    me.servers[server].data.wfs.capabilities.object = response;
                    me.servers[server].data.wfs.capabilities.xml = data;

                    sucessCallbacks.each(function(callback) {
                        callback({
                            wfsCapabilities: response,
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
        getWMSCapabilities: function(args) {
            var callbacks = args.callbacks || {},
                sucessCallbacks = callbacks.success || [],
                errorCallbacks = callbacks.error || [],
                server = args.server,
                namespace = args.namespace || 'ows',
                url = args.url;

            if (!url) {
                if (server === 'cida-geoserver' && namespace !== 'ows') {
                    url = CCH.CONFIG.contextPath + me.servers[server].endpoints.wmsGetCapsUrl;
                    url = url.add(namespace + '/', url.indexOf('ows'));
                } else if (server === 'stpete-arcserver') {
                    url = CCH.CONFIG.contextPath + me.servers[server].endpoints.proxy + '/services/' + namespace + '/MapServer/WMSServer?service=wms&version=1.3.0&request=GetCapabilities';
                } else if ( server === 'marine-arcserver') {
                    url = CCH.CONFIG.contextPath + me.servers[server].endpoints.proxy + namespace + '/MapServer/WMSServer?service=wms&version=1.3.0&request=GetCapabilities';
                }
            }

            CCH.LOG.debug('OWS.js::getWMSCapabilities: A request is being made for WMS GetCapabilities for the namespace: ' + namespace);
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
            CCH.LOG.debug('OWS.js::getFilteredFeature: Building request for WFS GetFeature (filtered)');
            var layerName = args.layerName;
            var layerPrefix = layerName.split(':')[0];
            var layerTitle = layerName.split(':')[1];
            var scope = args.scope;
            var propertyArray = args.propertyArray;
            var callbacks = args.callbacks;
            var proxyEndpoint = CCH.CONFIG.data.sources['cida-geoserver'].proxy;

            var url = CCH.CONFIG.contextPath + proxyEndpoint + layerPrefix + '/wfs?service=wfs&version=1.1.0&outputFormat=GML2&request=GetFeature&typeName=' + layerName + '&propertyName=';
            url += (propertyArray || []).join(',');

            $.ajax(url, {
                context: scope || this,
                success: function(data, textStatus, jqXHR) {
                    CCH.LOG.trace('OWS.js::getFilteredFeature: Successfully received WFS GetFeature response.');
                    var gmlReader = new OpenLayers.Format.GML.v3();
                    var getFeatureResponse = gmlReader.read(data);
                    CCH.LOG.debug('OWS.js::getFilteredFeature: WFS GetFeature parsed .');
                    if (!me.featureTypeDescription[layerPrefix]) {
                        me.featureTypeDescription[layerPrefix] = Object.extended();
                    }
                    me.featureTypeDescription[layerPrefix][layerTitle] = getFeatureResponse;

                    CCH.LOG.trace('OWS.js::getFilteredFeature: Executing ' + callbacks.success + 'callbacks');
                    $(callbacks.success || []).each(function(index, callback, allCallbacks) {
                        CCH.LOG.trace('OWS.js::getFilteredFeature: Executing callback ' + index);
                        callback(getFeatureResponse, this);
                    });
                },
                error: function(data, textStatus, jqXHR) {
                    $(callbacks.error || []).each(function(index, callback, allCallbacks) {
                        callback(data, this);
                    });
                }
            });
        },
        requestSummaryByAttribute : function (args) {
            args = args || {};
            var url = args.url ? args.url : '',
                attribute = args.attribute,
                callbacks = args.callbacks || {
                    success : [],
                    error : []
                },
                wpsFormat = new OpenLayers.Format.WPSExecute(),
                wpsRequest;
                
                wpsRequest = wpsFormat.write({
                    identifier: "org.n52.wps.server.r.item.summary",
                    dataInputs: [{
                        identifier: "input",
                        data: {
                            literalData: {
                                value: url
                            }
                        }
                    },
                    {
                        identifier: "attr",
                        data: {
                            literalData: {
                                value: attribute
                            }
                        }
                    }],
                    responseForm: {
                        rawDataOutput: {
                            identifier: "output"
                        }
                    }
                });
            
            OpenLayers.Request.POST({
                url: CCH.CONFIG.contextPath + '/52n/WebProcessingService',
                data: wpsRequest,
                success:function(response){
                    var responseText = response.responseText;
                    if (responseText.charAt(0) === '{') {
                        callbacks.success.each(function (cb) {
                            cb(JSON.parse(responseText));
                        });
                    } else {
                        callbacks.error.each(function (cb) {
                            cb(responseText);
                        });
                    }
                }
            });
        },
		buildServiceEndpoint: function (endpoint) {
			var updatedEndpoint = null,
				urlIndex = 0;
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
		},
        requestCSWRecords: function (args) {
            args = args || {};
            
            var callbacks = args.callbacks || {
                success : [],
                error : []
            }
            
            $.ajax({
                url : CCH.CONFIG.contextPath + '/csw/csw',
                data : {
                    'request' : 'GetRecords',
                    'service' : 'CSW',
                    'version' : '2.0.2',
                    'namespace' : 'namespace=xmlns(csw=http://www.opengis.net/cat/csw)',
                    'resultType' : 'results',
                    'outputSchema' : 'http://www.opengis.net/cat/csw/2.0.2',
                    'typeNames' : 'csw:Record',
                    'elementSetname' : 'summary',
                    'maxRecords' : args.maxRecords || '10',
                    'constraint_language_version' : '1.1.0',
                    'outputFormat' : 'application/json'
                },
                success : function (response) {
                    callbacks.success.each(function (cb) {
                        cb(response);
                    })
                },
                error : function (response) {
                    callbacks.error.each(function (cb) {
                        cb(response);
                    })
                }
            })
        }
    });
};