$(document).ready(function() {

	// Header fix
	$('#ccsa-area').find('br').first().remove();

	$(window).resize(function() {
		var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height();
		$('#info-content').css('height', contentRowHeight + 'px');
		$('#map').css('height', $('#info-summary-and-links-container').height() + 'px');
	});


	$.ajax({
		url: CCH.CONFIG.contextPath + '/data/item/' + CCH.CONFIG.itemId,
		success: function(data, textStatus, jqXHR) {
			CCH.CONFIG.data = data;
			$(window).resize();
			CCH.Util.updateItemPopularity({
				item: CCH.CONFIG.itemId,
				type: 'use'
			});

			$('#application-overlay').fadeOut(2000, function() {
				$('#application-overlay').remove();
			});

			var metadataLink = $('<a />').attr({
				'href': CCH.CONFIG.data.metadata + '&outputSchema=http://www.opengis.net/cat/csw/csdgm',
				'target': '_blank'
			}).addClass('btn').html('View Metadata');

			var applicationLink = $('<a />').attr({
				'href': CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId,
				'target': '_blank'
			}).addClass('btn').html('View In Portal');

			var publist = 'None';
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
			$('#info-content').addClass('hidden');
			$('#info-not-found-content').removeClass('hidden');
			$('#application-overlay').fadeOut(2000, function() {
				$('#application-overlay').remove();
			});
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
						size: 'medium',
						text: CCH.CONFIG.data.summary.tiny.text
					});

			twttr.events.bind('tweet', function(event) {
				CCH.Util.updateItemPopularity({
					item: CCH.CONFIG.itemId,
					type : 'tweet'
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
						var dataUrl;
						/*
						 go.usa.gov has an...interesting...API.
						 If there's an error, there's a data.response.statusCode
						 object.Otherwise, there's a data.response[0][0].status_code
						 object.This is not ideal but we roll with it.
						 Oh, and the service will only shorten government URLs
						 Oh, and the service will not give consistent URL output
						 for consistent URL input.
						 */
						if (data.response.statusCode) {
							dataUrl = url;
						} else {
							dataUrl = data.response.data.entry[0].short_url;
						}

						createShareButton(url);


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

		CCH.CONFIG.map.addLayer(new OpenLayers.Layer.XYZ("World Imagery",
				"http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/\${z}/\${y}/\${x}",
				{
					sphericalMercator: true,
					isBaseLayer: true,
					numZoomLevels: 20,
					wrapDateLine: true
				}
		));

		CCH.CONFIG.map.addLayer(
				new OpenLayers.Layer.WMS(CCH.CONFIG.data.id,
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
		}));

		CCH.CONFIG.map.zoomToExtent(bounds);
	};
});