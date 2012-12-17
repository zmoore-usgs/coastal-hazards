var Geoserver = function(endpoint) {
    var me = (this === window) ? {} : this;
    
    me.importEndpoint = 'service/import'
    me.geoserverEndpoint = endpoint ? endpoint : CONFIG.geoServerEndpoint;
    me.wfsGetCapsUrl = 'geoserver/ows?service=wfs&version=1.1.0&request=GetCapabilities'
    me.wfsGetFeature = 'geoserver/ows?service=wfs&version=1.1.0&request=GetFeature'
    me.wfsDescribeFeatureType = 'geoserver/ows?service=wfs&version=2.0.0&request=DescribeFeatureType'
    me.wfsCapabilities = null;
    me.wfsCapabilitiesXML = null;
    me.wmsGetCapsUrl = 'geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities'
    me.wmsCapabilities = null;
    me.wmsCapabilitiesXML = null;
    me.featureTypes = Object.extended();
    
    return $.extend(me, {
        /**
         * Imports file into GeoServer from the upload area
         */
        importFile : function(args) {
            $.ajax(me.importEndpoint,
            {
                context : args,
                data : {
                    'file-token': args.token,
                    'feature-name' : args.importName,
                    'workspace' : args.workspace
                },
                success : function(data, textStatus, jqXHR) {
                    $(args.callbacks).each(function(index, callback, allCallbacks) {
                        callback(data, this);
                    })
                }
            });
        },
        getWMSCapabilities : function(args) {
            $.ajax(me.wmsGetCapsUrl, {
                context: args,
                success : function(data, textStatus, jqXHR) {
                    var getCapsResponse = new OpenLayers.Format.WMSCapabilities.v1_3_0().read(data); 
                    me.wmsCapabilities = getCapsResponse;
                    me.wmsCapabilitiesXML = data;
                    $(args.callbacks).each(function(index, callback, allCallbacks) {
                        callback(getCapsResponse, this);
                    })
                }
            })
        },
        getWFSCapabilities : function(args) {
            $.ajax(me.wfsGetCapsUrl, {
                context: args,
                success : function(data, textStatus, jqXHR) {
                    var getCapsResponse = new OpenLayers.Format.WFSCapabilities.v1_1_0().read(data); 
                    me.wfsCapabilities = getCapsResponse;
                    me.wfsCapabilitiesXML = data;
                    $(args.callbacks).each(function(index, callback, allCallbacks) {
                        callback(getCapsResponse, this);
                    })
                }
            })
        },
        getFeatureByName : function(name) {
            return me.wfsCapabilities.featureTypeList.featureTypes.find(function(featureType) {
                return featureType.name === name;
            })
        },
        getLayerByName : function(name) {
            return me.wmsCapabilities.capability.layers.find(function(layer) {
                return layer.title === name;
            })
        },
        getDescribeFeatureType : function(args) {
            // Check if we currently have this feature type from a previous call
            if (me.featureTypes[args.featureName]) {
                if (!args.callbacks || args.callbacks.length == 0) {
                    return me.featureTypes[args.featureName];
                } else {
                    $(args.callbacks || []).each(function(index, callback) {
                        callback(me.featureTypes[args.featureName], this);
                    })
                }
            }
            
            var url = me.wfsDescribeFeatureType + '&typeName=' + args.featureName;
            $.ajax(url, {
                context : args.scope || this,
                success : function(data, textStatus, jqXHR) {
                    var gmlReader = new OpenLayers.Format.WFSDescribeFeatureType();
                    var describeFeaturetypeRespone = gmlReader.read(data); 
                    
                    me.featureTypes[describeFeaturetypeRespone.featureTypes[0].typeName] = describeFeaturetypeRespone;
                    
                    $(args.callbacks || []).each(function(index, callback) {
                        callback(describeFeaturetypeRespone, this);
                    })
                }
            })
        },
        getFilteredFeature : function(args) {
            var properties = function(describeFeatureResponse) {
                var result = new Object.extended();
                // For every layer pulled in...
                $(describeFeatureResponse.featureTypes).each(function(i, featureType) {
                        
                    // For each layer, initilize a property array for it in the result object
                    result[featureType.typeName] = [];
                        
                    // Parse through its properties
                    $(featureType.properties || []).each(function(i,property) {
                            
                        // Pulling down geometries is not required and can make the document huge 
                        // So grab everything except the geometry object(s)
                        if (property.type != "gml:MultiLineStringPropertyType") {
                            result[featureType.typeName].push(property.name);
                        }
                    })
                })
                return result;
            }(args.describeFeatureResponse)
            
            var layer = args.describeFeatureResponse.targetPrefix + ':' + args.featureName;
            var url = me.wfsGetFeature + '&typeName=' + layer;
            
            url += '&propertyName='
            $(args.propertyArray || []).each(function(i, property, array) {
                if (i == properties[args.featureName].length - 1) {
                    url += property
                } else {
                    url += property + ','
                }
            })
            
            if (args.sortBy) {
//                url += '&sortBy=' + properties[args.featureName][0]// + properties[layer.title][0] ? '%2BA' : '%2BD';
            }
            
            $.ajax(url, {
                context : args.scope || this,
                success : function(data, textStatus, jqXHR) {
                    var gmlReader = new OpenLayers.Format.GML.v3();
                    var getFeatureResponse = gmlReader.read(data); 
                    
                    $(args.callbacks || []).each(function(index, callback, allCallbacks) {
                        callback(getFeatureResponse, this);
                    })
                }
            })
        }
    });
}
