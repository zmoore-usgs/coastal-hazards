var Map = function(args) {
	LOG.info('Map.js::constructor:Map class is initializing.');
	var mapDivId = args.mapDiv;
	var me = (this === window) ? {} : this;
	var initialExtent = [-18839202.34857, 1028633.5088404, -2020610.1432676, 8973192.4795826];

	LOG.debug('Map.js::constructor:Loading Map object');
	me.map = new OpenLayers.Map(mapDivId, {
		projection: "EPSG:900913",
		displayProjection: new OpenLayers.Projection("EPSG:900913")
	});

	me.moveendCallback = function(evt) {
		var map = evt.object;
		var sMap = CONFIG.session.getMap();

		sMap.baselayer = map.baseLayer.name;
		sMap.center = {
			lat: map.center.lat,
			lon: map.center.lon
		};
		sMap.scale = map.getScale();
		sMap.extent = map.getExtent().toArray();
	};

	me.map.events.on({
		'moveend': me.moveendCallback,
		'changelayer': function() {

		}
	});


	LOG.debug('Map.js::constructor:Creating base layer');
	me.map.addLayer(new OpenLayers.Layer.XYZ("ESRI World Imagery",
			"http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}",
			{
				sphericalMercator: true,
				isBaseLayer: true,
				numZoomLevels: 20,
				wrapDateLine: true
			}
	));

	me.map.addLayer(new OpenLayers.Layer.Markers('geocoding-marker-layer'));

	LOG.debug('Map.js::constructor:Adding ontrols to map');
	me.map.addControl(new OpenLayers.Control.MousePosition());
	me.map.addControl(new OpenLayers.Control.ScaleLine({
		geodesic: true
	}));

	LOG.debug('Map.js::constructor:Zooming to extent: ' + initialExtent);
	me.map.zoomToExtent(initialExtent, true);

	LOG.debug('Map.js::constructor: Map class initialized.');
	return $.extend(me, {
		getMap: function() {
			return me.map;
		},
		updateFromSession: function() {
			me.map.events.un({'moveend': me.moveendCallback});
			var mapConfig = CONFIG.session.objects.map;
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
					CONFIG.map.buildGeocodingPopup({
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
			LOG.info('Map.js::removeLayerByName: Trying to remove a layer from map. Layer name: ' + featureName);
			var layers = me.map.getLayersByName(featureName) || [];
			layers.each(function(layer) {
				me.map.removeLayer(layer, false);
			});
		}
	});
};
