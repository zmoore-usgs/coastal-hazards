OpenLayers.Layer.Shorelines = OpenLayers.Class(OpenLayers.Layer.WMS, {
	initialize: function(name, url, params, options) {
		var newArguments = [];
		newArguments.push(name, url, params, options);
		OpenLayers.Layer.WMS.prototype.initialize.apply(this, newArguments);
	},
	CLASS_NAME: "OpenLayers.Layer.Shorelines"
});