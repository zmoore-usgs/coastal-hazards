/*jslint browser: true */
/*global CCH*/
/*global OpenLayers*/
CCH.Objects.ClickControl = OpenLayers.Class(OpenLayers.Control, {
	defaultHandlerOptions: {
		'single': true,
		'double': false,
		'pixelTolerance': 0,
		'stopSingle': false,
		'stopDouble': false
	},
	handler: null,
	map: null,
	iconLayer: CCH.CONFIG.map.layers.markerLayer,
	/**
	 * Handles the event of the map adding a layer
	 * 
	 * @returns {undefined}
	 */
	onAddLayer: function () {
		"use strict";
		// Whenever a layer is added, it may be added on top of the marker layer. I need to move the marker layer
		// above all other layers
		var baseLayers = this.getLayersBy('isBaseLayer', true),
			highestLayer = baseLayers.max(function (layer) {
				return layer.map.getLayerIndex(layer);
			}),
			highestLayerIndex = this.getLayerIndex(highestLayer);

		if (highestLayerIndex !== -1) {
			this.setLayerIndex(this.getLayersByName('Markers')[0], highestLayerIndex + 1);
		}
	},
	/**
	 * Handles the event of a click to identify response from the back-end
	 * 
	 * @returns {undefined}
	 */
	onLayerResponse: function () {
		"use strict";
		var markerLayer = CCH.map.getMap().getLayersByName('Markers')[0];

		// Remove the marker on the map since the ajax call is no longer out
		markerLayer.markers.each(function (marker) {
			markerLayer.removeMarker(marker);
			marker.destroy();
		});
	},
	/**
	 * Places a marker on the map where the user has clicked
	 * 
	 * @param {type} evt Map click event
	 * @returns {unresolved}
	 */
	onClick: function (evt) {
		"use strict";

		var msg = "click " + evt.xy,
			size = new OpenLayers.Size(20, 20),
			icon = new OpenLayers.Icon(CCH.CONFIG.contextPath + '/images/spinner/spinner3.gif', size, new OpenLayers.Pixel(-(size.w / 2), -size.h)),
			marker = new OpenLayers.Marker(this.map.getLonLatFromPixel(evt.xy), icon);

		CCH.LOG.trace(msg);

		this.iconLayer.addMarker(marker);
		setTimeout(function () {
			// Marker may not exist. It may have been removed already
			if (marker && marker.map) {
				// If markers exist, remove them
				var markerLayer = marker.map.getLayersByName('Markers')[0];
				
				markerLayer.markers.each(function (marker) {
					markerLayer.removeMarker(marker);
					marker.destroy();
				});
			}
		}, 5000);
		return evt;
	},
	/**
	 * Passes map double click event over to the click event
	 * 
	 * @param {type} evt Map double click event
	 * @returns {Anonym$0@call;onClick}
	 */
	onDblclick: function (evt) {
		"use strict";
		return this.onClick(evt);
	},
	initialize: function () {
		"use strict";
		this.handlerOptions = OpenLayers.Util.extend(
			{},
			this.defaultHandlerOptions);

		OpenLayers.Control.prototype.initialize.apply(this, arguments);

		this.map = this.handlerOptions.map;

		this.handler = new OpenLayers.Handler.Click(
			this, {
				'click': this.onClick,
				'dblclick': this.onDblclick
			}, this.handlerOptions
			);

		this.map.events.on({
			'addlayer': this.onAddLayer
		});

		$(window).on('cch.map.control.layerid.responded', this.onLayerResponse);

		this.map.addLayer(this.iconLayer);
	}

});