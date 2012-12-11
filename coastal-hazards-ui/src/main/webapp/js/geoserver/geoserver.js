var Geoserver = function(endpoint) {
    var me = (this === window) ? {} : this;
    
    me.importEndpoint = 'service/import'
    me.geoserverEndpoint = CONFIG.geoServerEndpoint;
    me.wfsGetCapsCall = /*CONFIG.geoServerEndpoint*/ 'geoserver' + '/wfs?service=wfs&version=1.1.0&request=GetCapabilities'
    
    return $.extend(me, {
        importFile : function(token, importName, workspace, callback) {
            $.get(me.importEndpoint,
            {
                'file-token': token,
                'feature-name' : importName,
                'workspace' : workspace
            },
            callback);
        },
        getCapabilities : function(args) {
            $.ajax(me.wfsGetCapsCall, {
                context: args,
                success : function(data, textStatus, jqXHR) {
                    var a = new OpenLayers.Format.WFSCapabilities.v1_1_0().read(data); 
                    var b = 1;
                }
            })
        }
        
    });
}
