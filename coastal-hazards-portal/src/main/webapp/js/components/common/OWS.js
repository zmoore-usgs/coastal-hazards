var CCH = CCH || {};
CCH.Objects.OWS = function() {
    CCH.LOG.info('OWS.js::constructor: OWS class is initializing.');
    var me = (this === window) ? {} : this;


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
                'stpete-arcserver-vulnerability-se-erosion': {
                    endpoints: {
                        endpoint: CCH.CONFIG.data.sources['stpete-arcserver'].endpoint,
                        proxy: CCH.CONFIG.data.sources['stpete-arcserver'].proxy,
                        wmsGetCapsUrl: CCH.CONFIG.data.sources['stpete-arcserver'].proxy + 'Vulnerability/SE_erosion_hazards/MapServer/WMSServer?request=GetCapabilities&version=1.3.0&service=WMS',
                        wmsGetImageUrl: CCH.CONFIG.data.sources['stpete-arcserver'].proxy + 'Vulnerability/SE_erosion_hazards/MapServer/WMSServer?'
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
                        endpoint: CCH.CONFIG.data.sources['stpete-arcserver'].endpoint,
                        proxy: CCH.CONFIG.data.sources['stpete-arcserver'].proxy,
                        wmsGetCapsUrl: CCH.CONFIG.data.sources['stpete-arcserver'].proxy + 'Vulnerability/SE_dune_vulnerability/MapServer/WMSServer?request=GetCapabilities&service=WMS'
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
        getWMSCapabilities: function(args) {
            var callbacks = args.callbacks || {};
            var sucessCallbacks = callbacks.success || [];
            var errorCallbacks = callbacks.error || [];
            var server = args.server;
            var namespace = args.namespace || 'ows';
            var url = me.servers[server].endpoints.wmsGetCapsUrl;

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
            CCH.LOG.info('OWS.js::getFilteredFeature');
            CCH.LOG.debug('OWS.js::getFilteredFeature: Building request for WFS GetFeature (filtered)');
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
        }
    });
};