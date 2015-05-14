/*global CCH*/
/*global OpenLayers*/
(function () {
	"use strict";
	window.CCH = CCH || {};
	CCH.Objects = CCH.Objects || {};
	CCH.Objects.Widget = CCH.Objects.Widget || {};
	CCH.Objects.Widget.OLZoomToIcon = OpenLayers.Class(OpenLayers.Control, {
		id: 'ol-zoom-to-location',
		title: 'Zoom To Your Location',
		displayClass: 'ol-zoom-to-location',
		type: OpenLayers.Control.TYPE_TOOL,
		px: new OpenLayers.Pixel(10, 150),
		size: {w: 18, h: 18},
		initialize: function (options) {
			options = options || {};
			options.displayClass = this.displayClass;

			OpenLayers.Control.prototype.initialize.apply(this, [options]);
		},
		draw: function () {
			// Create the primary element
			OpenLayers.Control.prototype.draw.apply(this, arguments);

			this.position = this.px.clone();
			var img = CCH.CONFIG.contextPath + '/images/openlayers/maximize_minimize_toggle/cch-legend-toggle-closed.svg';
			var btn = OpenLayers.Util.createAlphaImageDiv(
					this.displayClass,
					this.px,
					this.size,
					img,
					'absolute',
					'none',
					'image',
					0.7);
			btn.style.cursor = 'pointer';
			this.button = btn;
			this.div.appendChild(btn);
			OpenLayers.Event.observe(this.div, 'click', OpenLayers.Function.bind(function (ctrl, evt) {
				OpenLayers.Event.stop(evt ? evt : window.event, true);
				this.onButtonClick();
			}, this, this.div));
			return this.div;
		},
		setMap: function () {
			OpenLayers.Control.prototype.setMap.apply(this, arguments);
		},
		onButtonClick: function (evt) {
			OpenLayers.Event.stop(evt ? evt : window.event, true);
			CCH.Util.Util.getGeolocation({
				callbacks: {
					success: function (pos) {
						var lat = pos.coords.latitude,
								lon = pos.coords.longitude,
								locationLonLat = new OpenLayers.LonLat(lon, lat).transform().transform(CCH.CONFIG.map.modelProjection, CCH.map.getMap().displayProjection),
								bounds = new OpenLayers.Bounds();

						bounds.extend(locationLonLat);
						bounds.extend(locationLonLat);
						CCH.map.getMap().zoomToExtent(bounds);
					},
					error: function (err) {
						switch (err.code) {
							case err.PERMISSION_DENIED:
								CCH.LOG.warn("User denied the request for Geolocation.");
								break;
							case err.POSITION_UNAVAILABLE:
								CCH.LOG.warn("Location information is unavailable.");
								break;
							case err.TIMEOUT:
								CCH.LOG.warn("The request to get user location timed out.");
								break;
							case err.UNKNOWN_ERROR:
								CCH.LOG.warn("An unknown error occurred.");
								break;
						}
					}
				}
			});
		}
	});
})();