CCH.Objects.Map = function(args) {
	var mapDivId = args.mapDiv;
	var me = (this === window) ? {} : this;
	me.initialExtent = [-18839202.34857, 1028633.5088404, -2020610.1432676, 8973192.4795826];
	return $.extend(me, {
		init: function() {
			CCH.LOG.info('Map.js::init():Map class is initializing.');
			
			me.map = new OpenLayers.Map(mapDivId, {
				projection: "EPSG:900913",
				displayProjection: new OpenLayers.Projection("EPSG:900913")
			});

			CCH.LOG.debug('Map.js::init():Creating base layers');
			me.map.addLayers(CCH.CONFIG.map.baselayers);

			me.markerLayer = new OpenLayers.Layer.Markers('geocoding-marker-layer', {
				displayInLayerSwitcher: false
			});
			me.map.addLayer(me.markerLayer);

			me.boxLayer = new OpenLayers.Layer.Boxes('map-boxlayer', {
				displayInLayerSwitcher: false
			});
			me.map.addLayer(me.boxLayer);

			CCH.LOG.debug('Map.js::init():Adding ontrols to map');
			me.map.addControl(new OpenLayers.Control.LayerSwitcher({
				roundedCorner: true
			}));

			CCH.LOG.debug('Map.js::init():Zooming to extent: ' + me.initialExtent);
			me.map.zoomToExtent(me.initialExtent, true);

			me.map.events.on({
				'moveend': me.moveendCallback,
				'addlayer': function() {
					// The bounding box layer needs to sit on top of other layers in 
					// order to be hoverable and clickable
					while (me.boxLayer !== me.map.layers[me.map.layers.length - 1]) {
						me.map.raiseLayer(me.boxLayer, 1);
					}
				}
			});
			return me;
		},
		getMap: function() {
			return me.map;
		},
		/**
		 * Given a bounding box, adds a bbox marker to the map 
		 * 
		 * @param {{ bbox : Array.number, [fromProjection="EPSG:900913"] : String }} args
		 * @return {OpenLayers.Marker.Box} The marker placed on the map
		 */
		addBoundingBoxMarker: function(args) {
			args = args || {};
			var bbox = args.bbox;
			var fromProjection = args.fromProjection || new OpenLayers.Projection("EPSG:900913");
			var layerBounds = OpenLayers.Bounds.fromArray(bbox);
			var slideOrder = args.slideOrder;

			if (fromProjection) {
				layerBounds.transform(new OpenLayers.Projection(fromProjection), new OpenLayers.Projection("EPSG:900913"));
			}

			// If the marker is already in the map, remove it. We will re-add it 
			// to the end of the map's marker layer's marker array
			var marker = me.boxLayer.markers.find(function(marker) {
				return  marker.bounds.toString() === layerBounds.toString();
			});
			if (marker) {
				me.boxLayer.removeMarker(marker);
			}

			// Create a new marker, add it to the map.
			marker = new OpenLayers.Marker.Box(layerBounds);
			me.boxLayer.addMarker(marker);

			// Alter the marker visually 
			var markerDiv = $(marker.div);
			markerDiv.addClass('marker-active');
			markerDiv.on({
				'mouseover': function() {
					$(this).addClass('marker-hover');
				},
				'mouseout': function() {
					$(this).removeClass('marker-hover');
				}
			});

			// Fade older markers out
			var markerCt = me.boxLayer.markers.length;
			for (var mInd = markerCt; mInd > 0; mInd--) {
				var markerItem = me.boxLayer.markers[mInd - 1];
				var opacity = Math.round((mInd / markerCt) * 10) / 10;
				$(markerItem.div).css({
					'opacity': opacity
				});
			}

			markerDiv.data('slideOrder', slideOrder);
			markerDiv.data('bounds', layerBounds);
			markerDiv.on({
				click: function(evt) {
					var target = $(evt.target);
					var slideOrder = target.data('slideOrder');
					var bbox = target.data('bounds');

					CCH.ui.slider('goToSlide', slideOrder);
					CCH.ui.slider('autoSlidePause');

					me.clearBoundingBoxMarkers();

					var card = $('.slide:nth-child(' + slideOrder + ') .description-container').data('card');
					var isPinned = card.pinned;

					if (!isPinned) {
						card.pinButton.trigger('click');
					} else {
						me.map.zoomToExtent(bbox);
					}
				}
			});

			return marker;
		},
		clearBoundingBoxMarkers: function() {
			var markerCt = me.boxLayer.markers.length;
			for (var mInd = markerCt; mInd > 0; mInd--) {
				me.boxLayer.removeMarker(me.boxLayer.markers[mInd - 1]);
			}
		},
		zoomToBoundingBox: function(args) {
			args = args || {};
			var bbox = args.bbox;
			var fromProjection = args.fromProjection || new OpenLayers.Projection("EPSG:900913");
			var layerBounds = OpenLayers.Bounds.fromArray(bbox);
			if (fromProjection) {
				layerBounds.transform(new OpenLayers.Projection(fromProjection), new OpenLayers.Projection("EPSG:900913"));
			}
			me.map.zoomToExtent(layerBounds, false);
		},
		zoomToActiveLayers: function() {
			var activeLayers = me.map.getLayersBy('isItemLayer', true);
			var bounds = null;
			if (activeLayers.length) {
				bounds = new OpenLayers.Bounds();
				for (var lIdx = 0; lIdx < activeLayers.length; lIdx++) {
					var activeLayer = activeLayers[lIdx];
					var layerBounds = OpenLayers.Bounds.fromArray(activeLayer.bbox).transform(new OpenLayers.Projection('EPSG:4326'), CCH.map.getMap().displayProjection);
					bounds.extend(layerBounds);
				}
			} else {
				bounds = OpenLayers.Bounds.fromArray(me.initialExtent);
			}

			me.map.zoomToExtent(bounds, false);
		},
		updateFromSession: function() {
			CCH.LOG.info('Map.js::updateFromSession()');
			me.map.events.un({'moveend': me.moveendCallback});
			var mapConfig = CCH.session.objects.map;
			this.getMap().setCenter([mapConfig.center.lon, mapConfig.center.lat]);
			this.getMap().zoomToScale(mapConfig.scale);
			me.map.events.on({'moveend': me.moveendCallback});
		},
		buildGeocodingPopup: function(args) {
			var map = me.map;
			var currentLocationIndex = args.currentLocationIndex || 0;
			var locations = args.locations || $('#location-container').data('locations');
			var currentLocation = locations[currentLocationIndex];
			var xmax = currentLocation.extent.xmax;
			var xmin = currentLocation.extent.xmin;
			var ymax = currentLocation.extent.ymax;
			var ymin = currentLocation.extent.ymin;
			var x = currentLocation.feature.geometry.x;
			var y = currentLocation.feature.geometry.y;
			var locAttr = currentLocation.feature.attributes;
			var select = $('<select />').attr('id', 'alt-location-list');

			// Build Market
			var markerLayer = map.getLayersByName('geocoding-marker-layer')[0];
			var iconSize = new OpenLayers.Size(32, 32);
			var icon = new OpenLayers.Icon('js/openlayers/img/BulbGrey.png', iconSize, new OpenLayers.Pixel(-(iconSize.w / 2), -iconSize.h));
			var marker = new OpenLayers.Marker(new OpenLayers.LonLat(x, y), icon);

			// Build HTML
			var container = $('<div />').addClass('container-fluid').attr('id', 'location-container');
			var table = $('<table />').addClass('table table-hover table-condensed');
			table.append(
					$('<thead>').append(
					$('<tr />').attr('colspan', '2').append(
					$('<th />').attr('id', 'location-popup-title').html(locAttr.Match_addr))));
			var tbody = $('<tbody />');
			if (locAttr.Type) {
				tbody.append('<tr><td>Address Type</td><td>' + locAttr.Addr_type + ' : ' + locAttr.Type + '</td></tr>');
			}
			if (locAttr.Country) {
				tbody.append('<tr><td>Country</td><td>' + locAttr.Country + '</td></tr>');
			}
			if (locAttr.Loc_name) {
				tbody.append('<tr><td>Source</td><td>' + locAttr.Loc_name + '</td></tr>');
			}
			table.append(tbody);
			container.append($('<div />').addClass('row-fluid span12').append(table));

			select.append($('<option />').attr('value', '-1').html(''));

			for (var lInd = 0; lInd < locations.length; lInd++) {
				if (lInd !== currentLocationIndex) {
					var loc = locations[lInd];
					var addr = loc.feature.attributes.Match_addr;
					var country = loc.feature.attributes.Country;
					var type = loc.feature.attributes.Type;
					var type2 = loc.feature.attributes.Addr_type;
					var typeDesc = ' (Type: ' + type + ', ' + type2 + ')';
					select.append($('<option />').attr('value', lInd).html(addr + ', ' + country + typeDesc));
				}
			}

			if (locations.length > 1) {
				container.append($('<div />').addClass('row-fluid span12').html("Did you mean... ")).append($('<div />').addClass('fluid-row span12').append(select));
			}

			markerLayer.addMarker(marker);

			map.zoomToExtent([xmin, ymin, xmax, ymax], true);

			var popup = new OpenLayers.Popup.FramedCloud("geocoding-popup",
					new OpenLayers.LonLat(x, y),
					new OpenLayers.Size(200, 200),
					$('<div />').append(container).html(),
					icon,
					true,
					function() {
						markerLayer.removeMarker(marker);
						map.removePopup(this);
					});

			if (map.popups.length) {
				map.popups[0].closeDiv.click();
			}

			map.addPopup(popup);

			$('#alt-location-list').change(function(event) {
				var index = parseInt(event.target.value);
				if (index !== -1) {
					me.buildGeocodingPopup({
						currentLocationIndex: index,
						locations: locations
					});
				}
			});
		},
		/**
		 * Removes a layer from the map based on the layer's name. If more
		 * than one layer with the same name exists in the map, removes
		 * all layers with that name
		 * 
		 * @param {type} featureName
		 * @returns {undefined}
		 */
		removeLayersByName: function(featureName) {
			CCH.LOG.info('Map.js::removeLayerByName: Trying to remove a layer from map. Layer name: ' + featureName);
			var layers = me.map.getLayersByName(featureName) || [];
			layers.each(function(layer) {
				me.map.removeLayer(layer, false);
			});
		},
		displayData: function(args) {
			// may want to do this first: CONFIG.map.removeLayersByName(me.visibleLayers);
			var card = args.card;
			var type = card.type;
			if (me.map.getLayersByName(card.name).length !== -1) {
				var layer = new OpenLayers.Layer.WMS(
						card.name,
						card.service.wms.endpoint,
						{
							layers: card.service.wms.layers,
							format: 'image/png',
							transparent: true
						},
				{
					projection: 'EPSG:3857',
					isBaseLayer: false,
					displayInLayerSwitcher: false,
					isItemLayer: true, // CCH specific setting
					bbox: card.bbox
				});

				if (type === "vulnerability") {
					// SLD will probably only work with one layer
					// TODO - Fix with window.location.href but make sure actually works
					layer.params.SLD = 'http://cida.usgs.gov/qa/coastalhazards/' + 'rest/sld/redwhite/' + card.service.wms.layers + '/' + card.attr;
					layer.params.STYLES = 'redwhite';
				} else if (type === "historical" || type === "storms") {
					layer.params.STYLES = 'line';
				}

				me.map.addLayer(layer);
				layer.redraw(true);

				CCH.session.objects.view.activeLayers.push = [{
						title: card.name,
						name: card.name,
						layers: card.service.wms.layers,
						type: type
					}];
			}
		},
		moveendCallback: function(evt) {
			var map = evt.object;
			var sMap = CCH.session.getMap();

			sMap.baselayer = map.baseLayer.name;
			sMap.center = {
				lat: map.center.lat,
				lon: map.center.lon
			};
			sMap.scale = map.getScale();
			sMap.extent = map.getExtent().toArray();
		}
	});
};
