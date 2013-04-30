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

			me.displayAvailableData();
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
				
		displayAvailableData: function() {
			var availableLayers = me.getShorelineLayerInfoArray();
			var layerCt = availableLayers.length;
			if (layerCt) {
				LOG.debug('Historical.js::displayAvailableData(): Found ' + layerCt + ' shoreline layers to display');
			}
		}
	});
};