$(document).ready(function() {

	// Header fix
	$('#ccsa-area').find('br').first().remove();

	// Bind the window resize to properly size the content area and the map within it
	$(window).resize(function() {
		var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height();
		$('#info-content').css('height', contentRowHeight + 'px');
		$('#map').css('height', $('#info-summary-and-links-container').height() + 'px');
	});

	// Load the item
	$.ajax({
		url: CCH.CONFIG.contextPath + '/data/item/' + CCH.CONFIG.itemId,
		success: function(data, textStatus, jqXHR) {
			CCH.CONFIG.data = data;
			$(window).resize();

			CCH.Util.getSLD({
				contextPath: CCH.CONFIG.contextPath,
				itemId : itemId,
				callbacks : {
					success : [
						function(data, status, jqXHR) {
							
						}
					],
					error : [
						function(jqXHR, textStatus, errorThrown) {
							// Failed to get SLD from back-end
							$('#info-legend').remove();
							$('#info-graph').removeClass('span4').addClass('span6');
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
				'href': CCH.CONFIG.data.metadata + '&outputSchema=http://www.opengis.net/cat/csw/csdgm',
				'target': '_blank'
			}).addClass('btn').html('View Metadata');

			// Create a "View in Portal" link to let the user view this in the portal
			var applicationLink = $('<a />').attr({
				'href': CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId,
				'target': '_blank'
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

	var createShareButton = function(url) {
		twttr.ready(function(twttr) {
			twttr.widgets.createShareButton(
					url,
					$('#info-twitter-button')[0],
					function(element) {
						// Any callbacks that may be needed
					},
					{
						hashtags: 'USGS_CCH',
						lang: 'en',
						size: 'large',
						text: CCH.CONFIG.data.summary.tiny.text
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
		var bounds = new OpenLayers.Bounds(CCH.CONFIG.data.bbox).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857'));
		$('#map').css('height', $('#info-summary-and-links-container').height() + 'px');
		CCH.CONFIG.map = new OpenLayers.Map('map', {
			projection: CCH.CONFIG.projection,
			displayProjection: new OpenLayers.Projection(CCH.CONFIG.projection),
			restrictedExtent: bounds
		});

		CCH.CONFIG.map.addLayer(new OpenLayers.Layer.XYZ("Ocean",
				"http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/\${z}/\${y}/\${x}",
				{
					sphericalMercator: true,
					isBaseLayer: true,
					numZoomLevels: 17,
					wrapDateLine: true
				}));

		var layer = new OpenLayers.Layer.WMS(CCH.CONFIG.data.id,
				CCH.CONFIG.data.wmsService.endpoint,
				{
					layers: CCH.CONFIG.data.wmsService.layers,
					version: '1.3.0',
					crs: 'EPSG:3857',
					transparent: true
				}, {
			singleTile: true,
			transparent: true,
			isBaseLayer: false,
			projection: 'EPSG:3857'
		});

		var type = CCH.CONFIG.data.type;
		if (type === "storms") {
			layer.params.SLD = 'http://cida.usgs.gov/qa/coastalhazards/' + 'data/sld/redwhite/' + CCH.CONFIG.data.wmsService.layers + '/' + CCH.CONFIG.data.attr;
			layer.params.STYLES = 'redwhite';
		} else if (type === "historical") {
			layer.params.STYLES = 'line';
		} else if (type === "vulnerability") {
			layer.params.STYLES = '';
		}
		CCH.CONFIG.map.addLayer(layer);
		CCH.CONFIG.map.zoomToExtent(bounds);
	};
});