var Geoserver = function(endpoint) {
    var me = (this === window) ? {} : this;
    
    me.endpoint = '/service/import'
    
    return $.extend(me, {
        importFile : function(token, importName, workspace) {
            var fileToken = token;
            var featureName = importName;
            var workspace = 'workspace';
        }
    });
}
