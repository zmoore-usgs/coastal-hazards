/*global CCH*/
/*global OpenLayers*/
/*global alertify*/
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
		px: new OpenLayers.Pixel(8, 54),
		size: {w: 28, h: 28},
		initialize: function (options) {
			options = options || {};
			options.displayClass = this.displayClass;

			OpenLayers.Control.prototype.initialize.apply(this, [options]);
		},
		draw: function () {
			// Create the primary element
			OpenLayers.Control.prototype.draw.apply(this, arguments);

			this.position = this.px.clone();
			var desktopImage = CCH.CONFIG.contextPath + '/images/map/zoom/cross.svg',
				img = desktopImage,
				btn = OpenLayers.Util.createAlphaImageDiv(
					this.displayClass,
					this.px,
					this.size,
					img,
					'absolute',
					'none',
					'image',
					0.8);
					
			btn.style.cursor = 'pointer';
			this.button = btn;
			this.div.appendChild(btn);
			OpenLayers.Event.observe(this.div, 'click', OpenLayers.Function.bind(function (ctrl, evt) {
				OpenLayers.Event.stop(evt ? evt : window.event, true);
				this.onButtonClick();
			}, this, this.div));
			OpenLayers.Event.observe(this.div, 'touchstart', OpenLayers.Function.bind(function (ele, evt) {
				this.onButtonClick();
				OpenLayers.Event.stop(evt);
			}, this, this.div));
			OpenLayers.Event.observe(this.div, 'touchmove', OpenLayers.Function.bind(function (ele, evt) {
				OpenLayers.Event.stop(evt ? evt : window.event);
			}, this, this.div));
			OpenLayers.Event.observe(this.div, 'touchend', OpenLayers.Function.bind(function (ele, evt) {
				OpenLayers.Event.stop(evt);
			}, this, this.div));
			
			$(window).on('cch.ui.resized', function (evt) {
				var magicMobileWidth = 441,
					isMobile = $(window).outerWidth() < magicMobileWidth,
					divImage = isMobile ? CCH.CONFIG.contextPath + '/images/map/zoom/cross-mobile.svg' :
						CCH.CONFIG.contextPath + '/images/map/zoom/cross.svg';
				
				$('#ol-zoom-to-location_innerImage').attr('src', divImage);
			});
			return this.div;
		},
		setMap: function () {
			OpenLayers.Control.prototype.setMap.apply(this, arguments);
		},
		onButtonClick: function (evt) {
			if (evt) {
				OpenLayers.Event.stop(evt, true);
			}
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
						CCH.map.getMap().zoomTo(15);
					},
					error: function (err) {
						alertify.log("Cannot Find Your Location");
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