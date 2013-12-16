CCH.Objects.Map = function(args) {
	var me = (this === window) ? {} : this;
	me.initialExtent = CCH.CONFIG.map.initialExtent;
	me.mapDivId = args.mapDiv;
	me.bboxFadeoutDuration = 2000;
	return $.extend(me, {
		init: function() {
			CCH.LOG.info('Map.js::init():Map class is initializing.');

			CCH.LOG.debug('Map.js::init():Building map object');
			me.map = new OpenLayers.Map(me.mapDivId, {
				projection: CCH.CONFIG.map.projection,
				displayProjection: new OpenLayers.Projection(CCH.CONFIG.map.projection)
			});

			CCH.LOG.debug('Map.js::init():Adding base layers to map');
			me.map.addLayers(CCH.CONFIG.map.layers.baselayers);

			CCH.LOG.debug('Map.js::init():Adding marker layer to map');
			me.markerLayer = CCH.CONFIG.map.layers.markerLayer;
			me.map.addLayer(me.markerLayer);

			CCH.LOG.debug('Map.js::init():Adding box layer to map');
			me.boxLayer = CCH.CONFIG.map.layers.boxLayer;
			me.map.addLayer(me.boxLayer);

			CCH.LOG.debug('Map.js::init():Adding ontrols to map');
			me.map.addControls(CCH.CONFIG.map.controls);

			CCH.LOG.debug('Map.js::init():Zooming to extent: ' + me.initialExtent);
			me.map.zoomToExtent(me.initialExtent, true);

			CCH.LOG.debug('Map.js::init():Binding map event handlers');
			me.map.events.on({
				'moveend': me.moveendCallback,
				'addlayer': me.addlayerCallback,
				'changelayer': me.changelayerCallback
			});

			CCH.LOG.debug('Map.js::init():Replacing map graphics');
			$('#OpenLayers_Control_MaximizeDiv_innerImage').attr('src', 'images/openlayers/maximize_minimize_toggle/cch-layer-switcher-maximize.png');
			$('#OpenLayers_Control_MinimizeDiv_innerImage').attr('src', 'images/openlayers/maximize_minimize_toggle/cch-layer-switcher-minimize.png');

            // Bind application event handlers
			$(window).on({
                'cch.data.session.loaded.true' : function () {
                    // A session has been loaded. The map will be rebuilt from the session
                    me.updateFromSession();
                },
                'cch.ui.resized' : function () {
                    me.map.updateSize();
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
			var card = args.card;
			var bbox = card.getBoundingBox();
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
			markerDiv.addClass('marker-active').data({
				'slideOrder': slideOrder,
				'bounds': layerBounds,
				'cardId': card.id
			}).on({
				'mouseover': function() {
					$(this).addClass('marker-hover');
				},
				'mouseout': function() {
					$(this).removeClass('marker-hover');
				},
				'click': function(evt) {
					var target = $(evt.target);
					var slideOrder = target.data('slideOrder');
					var bbox = target.data('bounds');
					var cardId = target.data('cardId');
					var card = CCH.cards.getById(cardId);
					CCH.slideshow.goToSlide(slideOrder);
					CCH.slideshow.stop();

					setTimeout(function(args) {
						me.clearBoundingBoxMarkers();
					}, 1500);


					var isPinned = card.pinned;
					if (!isPinned) {
						card.pinButton.trigger('click');
					} else {
						me.map.zoomToExtent(bbox);
					}
				}
			});
			$(window).trigger('cch-map-bbox-marker-added', {
				marker: marker
			});
			return marker;
		},
		clearBoundingBoxMarkers: function() {
			var markerCt = me.boxLayer.markers.length;
			for (var mInd = markerCt; mInd > 0; mInd--) {
				me.clearBoundingBoxMarker(me.boxLayer.markers[mInd - 1]);
			}
			$(window).trigger('cch-map-bbox-markers-removed');
		},
		clearBoundingBoxMarker: function(marker) {
			$(marker.div).animate({
				opacity: 0.0
			}, me.bboxFadeoutDuration, function() {
				CCH.map.boxLayer.removeMarker(marker);
			});
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
			var bounds = new OpenLayers.Bounds();
			if (activeLayers.length) {
				// Zoom to pinned cards
				for (var lIdx = 0; lIdx < activeLayers.length; lIdx++) {
					var activeLayer = activeLayers[lIdx];
					var layerBounds = OpenLayers.Bounds.fromArray(activeLayer.bbox).transform(new OpenLayers.Projection('EPSG:4326'), CCH.map.getMap().displayProjection);
					bounds.extend(layerBounds);
				}
			} else {
				// No pinned cards, zoom to the collective bbox of all cards
				CCH.cards.getCards().each(function(card){
					bounds.extend(OpenLayers.Bounds.fromArray(card.bbox).transform(new OpenLayers.Projection('EPSG:4326'), CCH.map.getMap().displayProjection));
				});
			}

			me.map.zoomToExtent(bounds, false);
		},
		updateFromSession: function() {
			CCH.LOG.info('Map.js::updateFromSession():Map being recreated from session');
			var session = CCH.session.getSession();

			// Becaue we don't want these events to write back to the session, 
			// unhook the event handlers for map events tied to session writing.
			// They will be rehooked later
			me.map.events.un({
				'moveend': me.moveendCallback,
				'addlayer': me.addlayerCallback,
				'changelayer': me.changelayerCallback
			});

			// If the session holds items, they will be loaded and if they are pinned,
			// the map will zoom to those items that are pinned. However, if there 
			// are no items in the session or if none are pinned, zoom to the bounding box 
			// provided in the session
			if (!session.items.length) {
				me.map.setCenter([session.center[0], session.center[1]]);
				me.map.zoomToScale(session.scale);
			}

			// A session will have a base layer set. Check if the base layer is 
			// different from the current base layer. If so, switch to that base layer
			if (session.baselayer && session.baselayer !== me.map.baseLayer.name) {
				// Try to find the named base layer from the configuration object's
				// list of layers. If found, set it to the map's new base layer
				var baselayer = CCH.CONFIG.map.layers.baselayers.find(function(bl) {
					return bl.name === session.baselayer;
				});

				if (baselayer) {
					// The base layer from the config object has been found.
					// Add it to the map as a new baselayer
					me.map.setBaseLayer(baselayer);
				}
			}

			// We're done altering the map to fit the session. Let's re-register those 
			// events we disconnected earlier
			me.map.events.on({
				'moveend': me.moveendCallback,
				'addlayer': me.addlayerCallback,
				'changelayer': me.changelayerCallback
			});
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
			var container = $('<div />').addClass('container').attr('id', 'location-container');
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
			container.append($('<div />').addClass('row col-md-12').append(table));

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
				container.append($('<div />').addClass('row col-md-12').html("Did you mean... ")).append($('<div />').addClass('fluid-row col-md-12').append(select));
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
			var card = args.card,
                item = args.item,
                layer;
            
			if (me.card && me.map.getLayersByName(card.item.id).length === 0) {
				var layer = card.layer;
				me.map.addLayer(layer);
				layer.redraw(true);
			} else if (item && 'function' === typeof item.getWmsLayer) {
                layer = item.getWmsLayer();
                if (me.map.getLayersByName(layer.name).length === 0) {
                    me.map.addLayer(layer);
                    layer.redraw(true);
                }
            }
		},
		updateSession: function() {
			var map = me.map;
			var session = CCH.session.getSession();

			session.baselayer = map.baseLayer.name;
			session.center = [
				map.center.lon,
				map.center.lat
			];
			session.scale = map.getScale();
			session.bbox = map.getExtent().toArray();
		},
		floatBoxLayer: function() {
			// The bounding box layer needs to sit on top of other layers in 
			// order to be hoverable and clickable
			if (me.boxLayer) {
				while (me.boxLayer !== me.map.layers[me.map.layers.length - 1]) {
					me.map.raiseLayer(me.boxLayer, 1);
				}
			}
		},
		moveendCallback: function() {
			me.updateSession();
		},
		addlayerCallback: function() {
			me.updateSession();
			me.floatBoxLayer();
		},
		changelayerCallback: function() {
			me.updateSession();
			me.floatBoxLayer();
		},
        CLASS_NAME : 'CCH.Objects.Map'
	});
};
