var Geoserver = function(endpoint) {
    var me = (this === window) ? {} : this;
    
    me.importEndpoint = 'service/import'
    me.geoserverEndpoint = endpoint ? endpoint : CONFIG.geoServerEndpoint;
    me.wfsGetCapsUrl = /*CONFIG.geoServerEndpoint*/ 'geoserver/wfs?service=wfs&version=1.1.0&request=GetCapabilities'
    me.capabilities = null;
    me.capabilitiesXML = null;
    
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
        getCapabilities : function(args) {
            $.ajax(me.wfsGetCapsUrl, {
                context: args,
                success : function(data, textStatus, jqXHR) {
                    var getCapsResponse = new OpenLayers.Format.WFSCapabilities.v1_1_0().read(data); 
                    me.capabilities = getCapsResponse;
                    me.capabilitiesXML = data;
                    $(args.callbacks).each(function(index, callback, allCallbacks) {
                        callback(getCapsResponse, this);
                    })
                }
            })
        },
        getFeatureByName : function(name) {
            return me.capabilities.featureTypeList.featureTypes.find(function(featureType) {
                return featureType.name === name
            })
        }
        
    });
}
