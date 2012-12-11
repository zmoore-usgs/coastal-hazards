var Geoserver = function(endpoint) {
    var me = (this === window) ? {} : this;
    
    me.importEndpoint = 'service/import'
    me.listLayersEndpoint = '';
    
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
        getLayerList : function(args) {
            var callback = args.callback;
            var workspace = args.workspace;
            $.get(me.listLayersEndpoint, 
            {
                
            })
        }
        
    });
}
