var Historical = function(args) {
	LOG.info('Historical.js::constructor: Historical class is initializing.');
	var me = (this === window) ? {} : this;
	me.name = 'historical';
	me.collapseDiv = args.collapseDiv;
	me.shareMenuDiv = args.shareMenuDiv;
	me.viewMenuDiv = args.viewMenuDiv;
	me.boxLayer = new OpenLayers.Layer.Boxes('shoreline-box-layer', {
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
			CONFIG.map.removeLayersByName('shoreline-box-layer');
		},
		bindParentMenu: function() {
			$('#accordion-group-historical-collapse').on({
				'show': function() {
					CONFIG.session.objects.view.activeParentMenu = me.name;
					me.enterSection();
				},
				'hide': function() {
					me.leaveSection();
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
			me.shareMenuDiv.popover({
				html: true,
				placement: 'right',
				trigger: 'manual',
				title: 'Share Session',
				container: 'body',
				content: "<div class='container-fluid' id='prepare-container'><div>Preparing session export...</div></div>"
			}).on({
				'click': CONFIG.ui.popoverClickHandler,
				'shown': function() {
					CONFIG.session.getMinifiedEndpoint({
						callbacks: [
							function(args) {
								var response = args.response;
								var url = args.url;

								// URL controlset
								var container = $('<div />').addClass('container-fluid');
								var row = $('<div />').addClass('row-fluid');
								var controlSetDiv = $('<div />');
								container.append(row.append(controlSetDiv));
								$('#prepare-container').replaceWith(container);


								var goUsaResponse = JSON.parse(response.response);
								if (goUsaResponse.response.statusCode.toLowerCase() === 'error') {
									controlSetDiv.html('Use the following URL to share your current view<br /><br /><b>' + url + '</b>');
								} else {

								}
							}
						]
					});
					CONFIG.ui.popoverShowHandler.call(this);
				}
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
		displayShorelineBoxMarkers: function() {
			var availableLayers = me.getShorelineLayerInfoArray();
			var layerCt = availableLayers.length;
			if (layerCt) {
				LOG.debug('Historical.js::displayAvailableData(): Found ' + layerCt + ' shoreline layers to display');
				availableLayers.each(function(layer) {
					var layerBounds = OpenLayers.Bounds.fromArray(layer.bbox['EPSG:900913'].bbox);
					var box = new OpenLayers.Marker.Box(layerBounds);
					box.setBorder('#FF0000', 1);
					box.events.register('click', box, function() {

					});
					box.events.register('mouseover', box, function(event) {
						box.setBorder('#00FF00', 2);
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
						box.setBorder('#FF0000', 1);
						$(box.div).css({
							'cursor': 'default'
						});

						CONFIG.map.getMap().removePopup(this.popup);
					});

					box.layerObject = layer;

					me.boxLayer.addMarker(box);
				});
			}
		}
	});
};