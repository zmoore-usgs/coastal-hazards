$(document).ready(function() {

	// Header fix
	$('#ccsa-area').find('br').first().remove();

	// Load the item
	$.ajax({
		url: CCH.CONFIG.contextPath + '/data/item/' + CCH.CONFIG.itemId,
		success: function(data, textStatus, jqXHR) {
			CCH.CONFIG.item = data;

			var graphic = {
				vulnerability: '/images/cards/HistoricalActive.svg',
				storms: '/images/cards/StormsActive.svg',
				historical: '/images/cards/HistoricalActive.svg'
			}

			$('#info-graph img').attr({
				src: CCH.CONFIG.contextPath + graphic[CCH.CONFIG.item.type]
			});

			CCH.Util.getSLD({
				contextPath: CCH.CONFIG.contextPath,
				itemId: CCH.CONFIG.itemId,
				callbacks: {
					success: [
						function(data, status, jqXHR) {
							var sld = data;
							if (CCH.CONFIG.item.type === 'historical') {
								if (CCH.CONFIG.item.name === 'rates') {
									var legend = CCH.Util.buildLegend({
										type: CCH.CONFIG.item.type,
										name: CCH.CONFIG.item.name,
										sld: sld
									});
									$('#info-legend').append(legend);
								} else {
									// - The legend builder is going to need the actual data from the shorelines layer
									// 
									// - Using the wmsService.layers info for a WMS request because that's properly
									// formatted to go into this request. The wfsService has the fully qualified namespace
									// which borks the WFS request
									// 
									// - Making an assumption that "Date_" is the attribute being used and is capitalized correctly
									$.ajax(CCH.CONFIG.contextPath + '/cidags/ows?service=wfs&version=1.1.0&outputFormat=GML2&request=GetFeature&propertyName=Date_&typeName=' + CCH.CONFIG.item.wmsService.layers, {
										success: function(data, textStatus, jqXHR) {
											var gmlReader = new OpenLayers.Format.GML.v3();
											var features = gmlReader.read(data);
											var legend = CCH.Util.buildLegend({
												type: CCH.CONFIG.item.type,
												attr: CCH.CONFIG.item.name,
												sld: sld,
												features: features
											});
											$('#info-legend').append(legend);
										},
										error: function(data, textStatus, jqXHR) {
											removeLegendContainer();
										}
									});
								}

							} else if (CCH.CONFIG.item.type === 'storms') {
								var legend = CCH.Util.buildLegend({
									type: CCH.CONFIG.item.type,
									sld: sld
								});
								$('#info-legend').append(legend);
							} else if (CCH.CONFIG.item.type === 'vulnerability') {
								var legend = CCH.Util.buildLegend({
									type: CCH.CONFIG.item.type,
									attr: CCH.CONFIG.item.attr,
									sld: sld
								});
								$('#info-legend').append(legend);
							}

						}
					],
					error: [
						function(jqXHR, textStatus, errorThrown) {
							removeLegendContainer();
						}
					]
				}
			})

			// Clear the overlay
			$('#application-overlay').fadeOut(2000, function() {
				$('#application-overlay').remove();
			});

			// A user has navigated to the info page. Update the popularity of 
			// the object for that use type
			CCH.Util.updateItemPopularity({
				item: CCH.CONFIG.itemId,
				type: 'use'
			});

			// Create a "View Metadata" button
			var metadataLink = $('<a />').attr({
				'href': CCH.CONFIG.item.metadata + '&outputSchema=http://www.opengis.net/cat/csw/csdgm',
				'target': '_blank',
				'role': 'button'
			}).addClass('btn').html('View Metadata');

			// Create a "View in Portal" link to let the user view this in the portal
			var applicationLink = $('<a />').attr({
				'href': CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId,
				'target': '_blank',
				'role': 'button'
			}).addClass('btn').html('View In Portal');

			// Build the publications list for the item
			var publist = 'None Found';
			if (data.summary.full.publications.length) {
				publist = $('<ul />').attr('id', 'info-container-publications-list');
				data.summary.full.publications.each(function(item) {
					var li = $('<li />');
					var a = $('<a />').attr({
						'href': item.link,
						'target': '_blank'
					}).html(item.title);
					li.append(a);
					publist.append(li);
				});
			}

			$('#info-title').html(data.summary.full.title);
			$('#info-summary').html(data.summary.full.text);
			$('#info-container-publications-list-span').append(publist);
			$('#metadata-link').append(metadataLink);
			$('#application-link').append(applicationLink);

			buildTwitterButton();
			buildMap();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			var continueLink = $('<a />').attr({
				'href': CCH.CONFIG.contextPath,
				'role': 'button'
			}).addClass('btn btn-large').html('<i class="icon-refresh"></i> Click to continue')

			var emailLink = $('<a />').attr({
				'href': 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load Item (URL: ' + window.location.toString() + ' Error: ' + errorThrown + ')',
				'role': 'button'
			}).addClass('btn btn-large').html('<i class="icon-envelope"></i> Contact Us');

			if (404 === jqXHR.status) {
				splashUpdate("<b>Item Not Found</b><br /><br />We couldn't find the item you are looking for<br /><br />");
			} else {
				splashUpdate("<b>There was an error attempting to load an item.</b><br />Either try to reload the application or contact the system administrator.<br /><br />");
			}
			$('#splash-status-update').append(continueLink);
			$('#splash-status-update').append(emailLink);
			$('#splash-spinner').fadeOut(2000);
		}
	});

	var removeLegendContainer = function() {
		$('#info-legend').remove();
		$('#info-graph').removeClass('span4').addClass('span6');
	};

	var createShareButton = function(url) {
		twttr.ready(function(twttr) {
			twttr.widgets.createShareButton(
					url,
					$('#social-link')[0],
					function(element) {
						// Any callbacks that may be needed
					},
					{
						hashtags: 'USGS_CCH',
						lang: 'en',
						size: 'large',
						text: CCH.CONFIG.item.summary.tiny.text
					});

			twttr.events.bind('tweet', function(event) {
				CCH.Util.updateItemPopularity({
					item: CCH.CONFIG.itemId,
					type: 'tweet'
				});
			});
		});
	};

	var buildTwitterButton = function() {
		var url = window.location.origin + CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId;
		CCH.Util.getMinifiedEndpoint({
			location: url,
			contextPath: CCH.CONFIG.contextPath,
			callbacks: {
				success: [
					function(data, textStatus, jqXHR) {
						createShareButton(data.tinyUrl);
					}],
				error: [
					function(jqXHR, textStatus, errorThrown) {
						createShareButton(url);
					}]
			}
		});

	};

	var buildMap = function() {
		var bounds = new OpenLayers.Bounds(CCH.CONFIG.item.bbox).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857'));
		CCH.CONFIG.map = new OpenLayers.Map('map', {
			projection: CCH.CONFIG.projection,
			displayProjection: new OpenLayers.Projection(CCH.CONFIG.projection),
			restrictedExtent: bounds
		});

		CCH.CONFIG.map.addLayer(new OpenLayers.Layer.XYZ("Light Gray Base",
				"http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}",
				{
					sphericalMercator: true,
					isBaseLayer: true,
					numZoomLevels: 17,
					wrapDateLine: true
				}
		));

		CCH.CONFIG.map.addLayer(new OpenLayers.Layer.XYZ("Light Gray Reference",
				"http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/${z}/${y}/${x}",
				{
					sphericalMercator: true,
					isBaseLayer: false,
					numZoomLevels: 17,
					wrapDateLine: true
				}
		));

		var layer = new OpenLayers.Layer.WMS(CCH.CONFIG.item.id,
				CCH.CONFIG.item.wmsService.endpoint,
				{
					layers: CCH.CONFIG.item.wmsService.layers,
					version: '1.3.0',
					crs: 'EPSG:3857',
					sld: CCH.CONFIG.publicUrl + '/data/sld/' + CCH.CONFIG.item.id,
					styles: 'cch',
					transparent: true
				}, {
			singleTile: true,
			transparent: true,
			isBaseLayer: false,
			projection: 'EPSG:3857'
		});

		CCH.CONFIG.map.addLayer(layer);
		CCH.CONFIG.map.zoomToExtent(bounds);
	};
});