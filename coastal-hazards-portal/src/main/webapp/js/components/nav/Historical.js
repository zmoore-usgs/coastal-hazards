var Historical = function(args) {
	LOG.info('Historical.js::constructor: Historical class is initializing.');
	var me = (this === window) ? {} : this;
	me.name = 'historical';
	me.collapseDiv = args.collapseDiv;
	me.shareMenuDiv = args.shareMenuDiv;
	me.viewMenuDiv = args.viewMenuDiv;
	me.boxLayerName = 'shoreline-box-layer';
	me.boxBorderColor = '#FF0000';
	me.highlightedBorderColor = '#00FF00';
	me.boxLayer = new OpenLayers.Layer.Boxes(me.boxLayerName, {
		displayInLayerSwitcher: false
	});

	LOG.debug('Historical.js::constructor: Historical class initialized.');
	return $.extend(me, {
		init: function() {
			me.bindParentMenu();
			me.bindViewMenu();
			me.bindShareMenu();
		},
		enterSection: function() {
			LOG.debug('Historical.js::displayAvailableData(): Adding box layer to map');
			CONFIG.map.getMap().addLayer(me.boxLayer);
			me.displayShorelineBoxMarkers();
		},
		leaveSection: function() {
			LOG.debug('Historical.js::displayAvailableData(): Removing box layer from map');
			me.removeShorelineBoxMarkers();
		},
		bindParentMenu: function() {
			me.collapseDiv.on({
				'show': function(e) {
					if (e.target.className !== 'accordion-group-item') {
						LOG.debug('Historical.js:: Entering historical section.');
						CONFIG.session.objects.view.activeParentMenu = me.name;
						me.enterSection();
					}
				},
				'hide': function(e) {
					if (e.target.className !== 'accordion-group-item') {
						LOG.debug('Historical.js:: Leaving historical section.');
						me.leaveSection();
					}
				}
			});
		},
		bindViewMenu: function() {
			me.viewMenuDiv.popover({
				html: true,
				placement: 'right',
				trigger: 'manual',
				title: 'View Historical',
				container: 'body',
				content: "<div class='container-fluid'><div>This menu will contain information and options for viewing historical shorelines, result sets, etc etc</div></div>"
			}).on({
				'click': CONFIG.ui.popoverClickHandler,
				'shown': CONFIG.ui.popoverShowHandler
			});
		},
		bindShareMenu: function() {
			CONFIG.ui.bindShareMenu({
				menuItem: me.shareMenuDiv
			});
		},
		/**
		 * Uses the OpenLayers parsed WMS GetCapabilities response to get an
		 * array of shoreline objects.
		 * 
		 * @returns Array of shoreline info objects
		 */
		getShorelineLayerInfoArray: function() {
			var allLayerArray = CONFIG.ows.wmsCapabilities.ows.capability.layers;
			var publishedLayers = allLayerArray.findAll(function(l) {
				return l.name.toLowerCase().startsWith(CONFIG.name.published);
			});
			var shorelineLayers = publishedLayers.findAll(function(l) {
				return l.name.toLowerCase().endsWith('shorelines');
			});
			return shorelineLayers;
		},
		/**
		 * Lays out a set of box markers on the map that shows the user where we
		 * have active data sets
		 * 
		 * @returns {undefined}
		 */
		displayShorelineBoxMarkers: function() {
			var availableLayers = me.getShorelineLayerInfoArray();
			var layerCt = availableLayers.length;
			if (layerCt) {
				LOG.debug('Historical.js::displayAvailableData(): Found ' + layerCt + ' shoreline layers to display');

				var bounds = new OpenLayers.Bounds();

				availableLayers.each(function(layer) {
					var layerBounds = OpenLayers.Bounds.fromArray(layer.bbox['EPSG:900913'].bbox);
					var box = new OpenLayers.Marker.Box(layerBounds);
					box.setBorder(me.boxBorderColor, 1);

					box.events.register('click', box, function() {
						LOG.debug('Historical.js:: Box marker clicked. Zooming to shoreline');
						var olBounds = new OpenLayers.Bounds(this.bounds.left, this.bounds.bottom, this.bounds.right, this.bounds.top);
						CONFIG.map.getMap().zoomToExtent(olBounds);
						me.removeShorelineBoxMarkers();
						me.displayShoreline({
							'name': this.layerObject.name
						});
					});

					box.events.register('mouseover', box, function(event) {
						LOG.debug('Historical.js:: Box marker rolled over with mouse. Displaying popup');
						box.setBorder(me.highlightedBorderColor, 2);
						$(box.div).css({
							'cursor': 'pointer',
							'border-style': 'dotted'
						});

						if (!this.popup) {
							this.popup = new OpenLayers.Popup.FramedCloud(
									this.layerObject.title + '_boxid',
									this.bounds.getCenterLonLat(),
									null,
									this.layerObject.title,
									null,
									false,
									null);
						}

						CONFIG.map.getMap().addPopup(this.popup, true);
					});

					box.events.register('mouseout', box, function() {
						LOG.debug('Historical.js:: Box marker rolled off with mouse. Displaying popup');
						box.setBorder(me.boxBorderColor, 1);
						$(box.div).css({
							'cursor': 'default'
						});

						CONFIG.map.getMap().removePopup(this.popup);
					});

					box.layerObject = layer;

					LOG.debug('Historical.js:: Adding box marker to map');
					me.boxLayer.addMarker(box);

					LOG.trace('Historical.js::displayAvailableData(): Adding current box bounds to overall layer set bounds.');
					bounds.extend(box.bounds);
				});

				LOG.debug('Historical.js::displayAvailableData(): Zooming to combined bounds of all layers.');
				CONFIG.map.getMap().zoomToExtent(bounds);
			}
		},
		/**
		 * Removes all box markers from the map
		 * 
		 * @returns {undefined}
		 */
		removeShorelineBoxMarkers: function() {
			var map = CONFIG.map.getMap();
			map.popups.each(function(p) {
				map.removePopup(p);
			});
			CONFIG.map.removeLayersByName(me.boxLayerName);

		},
		/**
		 *	Displays one or all shorelines on the map
		 *  
		 * @param {type} args
		 * @returns {undefined}
		 */
		displayShoreline: function(args) {
			var name = args.name;

			if (name) {
				var prefix = name.split(':')[0];
				var title = name.split(':')[1];
				var wmsLayer = new OpenLayers.Layer.Shorelines(
						title,
						'geoserver/' + prefix + '/wms',
						{
							layers: [name],
							transparent: true,
//							sld_body: sldBody,
							format: "image/png"
						},
				{
					prefix: prefix,
					zoomToWhenAdded: true, // Include this layer when performing an aggregated zoom
					isBaseLayer: false,
					unsupportedBrowsers: [],
//					colorGroups: colorDatePairings,
//					describedFeatures: features,
					tileOptions: {
						// http://www.faqs.org/rfcs/rfc2616.html
						// This will cause any request larger than this many characters to be a POST
						maxGetUrlLength: 2048
					},
					singleTile: true,
					ratio: 1,
//					groupByAttribute: groupingColumn,
//					groups: groups,
					displayInLayerSwitcher: false
				});
				CONFIG.map.getMap().addLayer(wmsLayer);
				wmsLayer.redraw(true);
			} else {

			}
		}
	});
};