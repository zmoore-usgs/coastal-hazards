/*global CCH*/
/*global OpenLayers*/
(function () {
	"use strict";
	window.CCH = CCH || {};
	CCH.Objects = CCH.Objects || {};
	CCH.Objects.Widget = CCH.Objects.Widget || {};
	CCH.Objects.Widget.OLDrawBoxControl = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
		initialize: function (layer) {
			this.layer = layer;
			this.handler = OpenLayers.Handler.RegularPolygon;
			this.handlerOptions = {
				sides: 4,
				irregular: true
			};
			OpenLayers.Control.DrawFeature.prototype.initialize.apply(this, [this.layer, this.handler, this.handlerOptions]);
			$(document).on('keypress', function(e) {
				if (e.keyCode === 2) {
					if (CCH.map.drawBoxControl.active) {
						CCH.map.drawBoxControl.deactivate();
					} else {
						CCH.map.drawBoxControl.activate();
					}
				}
			});
		},
		featureAdded : function (v) {
			var bounds = v.geometry.bounds,
				items = CCH.items.getItemsWithinBounds(bounds);
				
			v.destroy();
				
			if (items) {
				items.forEach(function (i) {
					CCH.ui.bucket.push({item: i});
				}); 
			}
		}
	});
})();