var Storms = function(args) {
	LOG.info('Storms.js::constructor: Storms class is initializing.');
	var me = (this === window) ? {} : this;
	LOG.debug('Storms.js::constructor: Storms class initialized.');

	me.collapseDiv = args.collapseDiv;
	me.shareMenuDiv = args.shareMenuDiv;
	me.viewMenuDiv = args.viewMenuDiv;
	me.boxBorderColor = '#FF0000';
	me.highlightedBorderColor = '#00FF00';
	me.boxLayerName = 'storms-box-layer';
	me.boxLayer = new OpenLayers.Layer.Boxes(me.boxLayerName, {
		displayInLayerSwitcher: false
	});
	return $.extend(me, {
		init: function() {
			me.bindParentMenu();
			me.bindShareMenu();
		},
		enterSection: function() {
			LOG.debug('Storms.js:: Adding box layer to map');
			CONFIG.map.getMap().addLayer(me.boxLayer);

			if (!CONFIG.ows.servers['stpete-arcserver-vulnerability-se-erosion'].data.wms.object) {
				CONFIG.ows.getWMSCapabilities({
					server: 'stpete-arcserver-vulnerability-se-erosion',
					callbacks: {
						success: [
							function(data, textStatus, jqXHR) {
								me.displayBoxMarkers();
							}
						],
						error: [
							function(data, textStatus, jqXHR) {
								LOG.error('OnReady.js:: Got an error while getting WMS GetCapabilities from server');
							}
						]
					}
				});
			} else {
				me.displayBoxMarkers();
			}

		},
		leaveSection: function() {
			LOG.debug('Historical.js::displayAvailableData(): Removing box layer from map');
			me.removeBoxMarkers();
		},
		bindParentMenu: function() {
			me.collapseDiv.on({
				'show': function(e) {
					if (e.target.className !== 'accordion-group-item') {
						LOG.debug('Storms.js:: Entering storms section.');
						CONFIG.session.objects.view.activeParentMenu = me.name;
						me.enterSection();
					}
				},
				'hide': function(e) {
					if (e.target.className !== 'accordion-group-item') {
						LOG.debug('Historical.js:: Leaving storms section.');
						me.leaveSection();
					}
				}
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
		getLayerInfoArray: function() {
			return CONFIG.ows.servers['stpete-arcserver-vulnerability-se-erosion'].data.wms.capabilities.object.capability.layers;
		},
		/**
		 * Lays out a set of box markers on the map that shows the user where we
		 * have active data sets
		 * 
		 * @returns {undefined}
		 */
		displayBoxMarkers: function() {
			var availableLayers = me.getLayerInfoArray();
			var layerCt = availableLayers.length;
			if (layerCt) {
				LOG.debug('Storms.js::displayBoxMarkers(): Found ' + layerCt + ' storms layers to display');

				var bounds = new OpenLayers.Bounds();

				availableLayers.each(function(layer) {
					var layerBounds = OpenLayers.Bounds.fromArray(layer.bbox['EPSG:3857'].bbox);
					var box = new OpenLayers.Marker.Box(layerBounds);
					box.setBorder(me.boxBorderColor, 1);

					box.events.register('click', box, function() {
						LOG.debug('Storms.js:: Box marker clicked. Zooming to storm data');
						CONFIG.map.getMap().zoomToExtent(this.bounds);
						me.removeBoxMarkers();
						me.displayData({
							'name': this.layerObject.name
						});
					});

					box.events.register('mouseover', box, function(event) {
						LOG.debug('Storms.js:: Box marker rolled over with mouse. Displaying popup');
						box.setBorder(me.highlightedBorderColor, 2);
						$(box.div).css({
							'cursor': 'pointer',
							'border-style': 'dotted'
						});

						if (!this.popup) {
							this.popup = new OpenLayers.Popup.FramedCloud(
									null,
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
						LOG.debug('Storms.js:: Box marker rolled off with mouse. Displaying popup');
						box.setBorder(me.boxBorderColor, 1);
						$(box.div).css({
							'cursor': 'default'
						});

						CONFIG.map.getMap().removePopup(this.popup);
					});

					box.layerObject = layer;

					LOG.debug('Storms.js:: Adding box marker to map');
					me.boxLayer.addMarker(box);

					LOG.trace('Storms.js::displayAvailableData(): Adding current box bounds to overall layer set bounds.');
					bounds.extend(box.bounds);
				});

				LOG.debug('Storms.js::displayAvailableData(): Zooming to combined bounds of all layers.');
				CONFIG.map.getMap().zoomToExtent(bounds);
			}
		},
		/**
		 * Removes all box markers from the map
		 * 
		 * @returns {undefined}
		 */
		removeBoxMarkers: function() {
			var map = CONFIG.map.getMap();
			map.popups.each(function(p) {
				map.removePopup(p);
			});
			CONFIG.map.removeLayersByName(me.boxLayerName);

		},
		displayData: function(args) {
			var name = args.name;

			if (name) {
				var layer = new OpenLayers.Layer.WMS(
						name,
						CONFIG.ows.servers['stpete-arcserver-vulnerability-se-erosion'].endpoints.wmsGetImageUrl,
						{
							layers: '0',
							format: 'img/png',
							transparent: true
						},
				{
					projection: 'EPSG:3857',
					isBaseLayer: false

				});
				
				layer.params.STYLES = 'lineSymbolizer';
				layer.params.SLD_BODY = '<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/ogc" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">' +
						'<sld:NamedLayer>' + 
						'<sld:Name>0</sld:Name>' + 
						'<sld:UserStyle>' + 
						'<sld:Name>lineSymbolizer</sld:Name>' + 
						'<sld:Title>lineSymbolizer</sld:Title>' +
						'<sld:FeatureTypeStyle>' + 
						'<sld:Rule>' + 
						'<sld:LineSymbolizer>' + 
						'<sld:Stroke>' + 
						'<sld:CssParameter name="stroke">#00FF00</sld:CssParameter>' + 
						'<sld:CssParameter name="stroke-opacity">1</sld:CssParameter>' + 
						'<sld:CssParameter name="stroke-width">2</sld:CssParameter>' + 
						'</sld:Stroke>' + 
						'</sld:LineSymbolizer>' + 
						'</sld:Rule>' + 
						'</sld:FeatureTypeStyle>' + 
						'</sld:UserStyle>' + 
						'</sld:NamedLayer>' + 
						'</sld:StyledLayerDescriptor>';
				CONFIG.map.getMap().addLayer(layer);
				layer.redraw(true);
			} else {

			}
		}
	});
};