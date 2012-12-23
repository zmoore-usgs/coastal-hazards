var OWS = function(endpoint) {
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
            LOG.info('OWS.js::importFile: Importing file into OWS resource');
            $.ajax(me.importEndpoint,{
                context : args.context || this,
                data : {
                    'file-token': args['file-token'],
                    'feature-name' : args.importName,
                    'workspace' : args.workspace
                },
                success : function(data, textStatus, jqXHR) {
                    var scope = this;
                    $(args.callbacks).each(function(index, callback, allCallbacks) {
                        callback(data, scope);
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
                        callback(getCapsResponse, args);
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
        },
        updateFeatureTypeAttribute : function(featureType, attribute, value, callback) {

            var updateTransaction =
            '<?xml version="1.0"?>' +
            '<wfs:Transaction xmlns:ogc="http://www.opengis.net/ogc" ' +
            'xmlns:wfs="http://www.opengis.net/wfs" ' +
            'xmlns:gml="http://www.opengis.net/gml" ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'version="1.1.0" service="WFS" '+
            'xsi:schemaLocation="http://www.opengis.net/wfs ../wfs/1.1.0/WFS.xsd">' +
            '<wfs:Update typeName="' + featureType + '">' +
            '<wfs:Property>' +
            '<wfs:Name>' + attribute + '</wfs:Name>' +
            '<wfs:Value>' + value + '</wfs:Value>'+
            '</wfs:Property>'+
            '</wfs:Update>'+
            '</wfs:Transaction>';

            $.ajax({
                url: 'geoserver/ows/',
                type: 'POST',
                contentType: 'application/xml',
                data: updateTransaction,
                success: function(data, textStatus, jqXHR) {
                    callback(data);
                }
            });
        }
    });
}
