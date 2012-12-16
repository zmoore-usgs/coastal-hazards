var Geoserver = function(endpoint) {
    var me = (this === window) ? {} : this;
    
    me.importEndpoint = 'service/import'
    me.geoserverEndpoint = endpoint ? endpoint : CONFIG.geoServerEndpoint;
    me.wfsGetCapsUrl = 'geoserver/ows?service=wfs&version=1.1.0&request=GetCapabilities'
    me.wfsGetFeature = 'geoserver/ows?service=wfs&version=1.1.0&request=GetFeature'
    me.wfsDescribeFeatureType = 'geoserver/ows?service=wfs&version=1.1.0&request=DescribeFeatureType'
    me.wfsCapabilities = null;
    me.wfsCapabilitiesXML = null;
    me.wmsGetCapsUrl = 'geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities'
    me.wmsCapabilities = null;
    me.wmsCapabilitiesXML = null;
    
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
            var url = me.wfsDescribeFeatureType + '&typeName=';
            $(args.featureNameArray || []).each(function(i,featureName, array) {
                if (i == args.featureNameArray.length - 1) {
                    url += featureName
                } else {
                    url += featureName + ','
                }
            })
            
            $.ajax(url, {
                context : args.scope || this,
                success : function(data, textStatus, jqXHR) {
                    var gmlReader = new OpenLayers.Format.WFSDescribeFeatureType();
                    var describeFeaturetypeRespone = gmlReader.read(data); 
                    
                    $(args.callbacks || []).each(function(index, callback, allCallbacks) {
                        callback(describeFeaturetypeRespone, this);
                    })
                }
            })
        },
        getFilteredFeature : function(args) {
            var url = me.wfsGetFeature + '&typeName=';
            $(args.featureNameArray || []).each(function(i,featureName, array) {
                if (i == args.featureNameArray.length - 1) {
                    url += featureName
                } else {
                    url += featureName + ','
                }
            })
            
            url += '&propertyName='
            $(args.propertyArray || []).each(function(i, property, array) {
                if (i == args.propertyArray.length - 1) {
                    url += property
                } else {
                    url += property + ','
                }
            })
            
            if (args.sortBy) {
                url += '&sortBy=' + args.sortBy// + args.sortByAscending ? '%2BA' : '%2BD';
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
