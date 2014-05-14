/*jslint browser: true */
/*jslint plusplus: true */
/*global $ */
/*global CCH */
/*global OpenLayers */
/*global twttr */
window.CCH = CCH || {};
CCH.Objects = CCH.Objects || {};
CCH.Objects.Back = CCH.Objects.Back || {};
CCH.Objects.Back.UI = function (args) {
	"use strict";
	CCH.LOG.info('UI.js::constructor: UI class is initializing.');

	var me = (this === window) ? {} : this,
		$metadataLink,
		$metadataLinkButton = $('#metadata-link'),
		$downloadFullLink = $('#download-full-link'),
		$downloadFull,
		$applicationLink,
		$publist,
		item = args.item;

	me.removeLegendContainer = function () {
		$('#info-legend').remove();
	};

	me.buildTwitterButton = function () {
		var url = window.location.origin + CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId;
		CCH.Util.Util.getMinifiedEndpoint({
			location: url,
			contextPath: CCH.CONFIG.contextPath,
			callbacks: {
				success: [
					function (data, textStatus, jqXHR) {
						me.createShareButton(data.tinyUrl);
					}],
				error: [
					function (jqXHR, textStatus, errorThrown) {
						me.createShareButton(url);
					}]
			}
		});
	};

	me.createShareButton = function (url) {
		twttr.ready(function (twttr) {
			twttr.widgets.createShareButton(
				url,
				$('#social-link')[0],
				function (element) {
					// Any callbacks that may be needed
				},
				{
					hashtags: 'USGS_CCH',
					lang: 'en',
					size: 'large',
					text: CCH.CONFIG.item.summary.tiny.text
				});

			twttr.events.bind('tweet', function (event) {

			});
		});
	};

	me.createModalServicesTab = function (args) {

		var item = args.item,
			$container = args.container || $('#modal-services-view .modal-body'),
			$tabUl = $container.find('> ul'),
			$tabContentContainer = $container.find('> div'),
			$tabLi = $('<li />'),
			$tabLink = $('<a />').
			attr({
				'data-toggle': 'tab',
				'href': '#tab-' + item.id
			}).html(item.summary.tiny.text),
			$tabBody = $('<div />').
			addClass('tab-pane').
			attr('id', 'tab-' + item.id);

		if ($tabUl.length === 0) {
			$tabUl = $('<ul />').addClass('nav nav-tabs');
			$tabContentContainer = $('<div />').addClass('tab-content');
			$container.append($tabUl, $tabContentContainer);
		}

		if ($tabUl.children().length === 0) {
			$tabLi.addClass('active');
			$tabBody.addClass('active');
		}

		$tabLi.append($tabLink);
		$tabUl.append($tabLi);
		$tabContentContainer.append($tabBody);

		if (item.children.length !== 0) {
			item.children.each(function (childId) {
				var child = CCH.items.getById({id: childId});
				me.createModalServicesTab({
					item: child,
					container: $tabBody
				});
			});
		} else {
			item.services.each(function (service) {
				var endpoint = service.endpoint,
					serviceType = service.type,
					serviceParam = service.serviceParameter,
					$link = $('<a />').attr({
					'href': endpoint,
					'target': '_services'
				}),
					$textBox = $('<input />').attr({
					'type': 'text'
				}),
					$serviceParamSpan = $('<span />').html(' (Service Parameter: '),
					$newRow = $('<div />').
					addClass('row').
					append($link);

				switch (serviceType) {
					case ('csw') :
						{
							$link.html('CSW :');
							$textBox.val(endpoint);
							$newRow.append($link, $textBox);
							break;
						}
					case ('source_wms') :
						{
							$link.html('Source WMS :');
							$textBox.val(endpoint);
							$serviceParamSpan.append(serviceParam, ' )');
							$newRow.append($link, $serviceParamSpan, $textBox);
							break;
						}
					case ('source_wfs') :
						{
							$link.html('Source WFS :');
							$textBox.val(endpoint);
							$serviceParamSpan.append(serviceParam, ' )');
							$newRow.append($link, $serviceParamSpan, $textBox);
							break;
						}
					case ('proxy_wfs') :
						{
							$link.html('Proxy WFS :');
							$textBox.val(endpoint);
							$serviceParamSpan.append(serviceParam, ' )');
							$newRow.append($link, $serviceParamSpan, $textBox);
							break;
						}
					case ('proxy_wms') :
						{
							$link.html('Proxy WMS :');
							$textBox.val(endpoint);
							$serviceParamSpan.append(serviceParam, ' )');
							$newRow.append($link, $serviceParamSpan, $textBox);
							break;
						}
				}
				$tabBody.append($newRow);
			});
		}
	};

	me.createModalServicesTab({
		item: item
	});

	// Create a "Download Full" button
	$downloadFull = $('<a />').attr({
		'role': 'button',
		'href': window.location.origin + CCH.CONFIG.contextPath + '/data/download/item/' + CCH.CONFIG.itemId
	}).addClass('btn btn-default').html('<i class="fa fa-download"></i> Download Full Data');

	$downloadFullLink.append($downloadFull);

	// Create a "View Metadata" button
	var cswService = CCH.CONFIG.item.services.find(function (service) {
		return service.type === 'csw';
	});

	if (cswService && cswService.endpoint) {
		$metadataLink = $('<a />').attr({
			'href': cswService.endpoint + '&outputSchema=http://www.opengis.net/cat/csw/csdgm',
			'target': 'portal_metadata_window',
			'role': 'button'
		}).addClass('btn btn-default').html('<i class="fa fa-download"></i> View Metadata');
		$metadataLinkButton.append($metadataLink);
	} else {
		$metadataLinkButton.remove();
	}

	// Create a "Back To Portal" link to let the user view this in the portal
	$applicationLink = $('<a />').attr({
		'href': CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId,
		'role': 'button'
	}).addClass('btn btn-default').html('<i class="fa fa-eye"></i> Back To Portal');
	$('#application-link').append($applicationLink);

	// Build the publications list for the item
	if (item.summary.full.publications) {
		$publist = $('<ul />').attr('id', 'info-container-publications-list');
		Object.keys(item.summary.full.publications, function (type) {
			var pubTypeArray = item.summary.full.publications[type],
				pubTypeListHeader = $('<li />').
				addClass('publist-header').
				html(type),
				subList = $('<ul />'),
				pubLink;
			if (pubTypeArray.length) {
				pubTypeListHeader.append(subList);
				$publist.append(pubTypeListHeader);
				item.summary.full.publications[type].each(function (publication) {
					pubLink = $('<a />').attr({
						'href': publication.link,
						'target': 'portal_publication_window'
					}).html(publication.title);
					subList.append($('<li />').append(pubLink));
				});
			}
		});
	} else {
		$('#info-container-publications-list-span').remove();
	}

	$('#info-title').html(item.summary.full.title);
	$('#info-summary').html(item.summary.full.text);
	$('#info-container-publications-list-span').append($publist);

	me.buildTwitterButton();
	CCH.map.buildMap();

	if (item.getLayerList().layers.length) {
		new CCH.Objects.Widget.Legend({
			containerId: 'info-legend',
			item: item,
			onComplete: function () {
				var $container = this.$container,
					$legendDiv = this.$legendDiv,
					$firstTable = $('#info-legend > div > table:first-child'),
					$captions = $legendDiv.find('table > thead > caption'),
					mapHeight = $('#map').height(),
					tableHeight,
					tableWidth = $firstTable.width();

				// For one reason or another, the caption in the table doesn't seem to dynamically resize
				$captions.width(tableWidth);

				// I don't want my legend div to be taller than the map
				tableHeight = $firstTable.height() - parseInt($container.css('paddingTop'));

				if (tableHeight > mapHeight) {
					tableHeight = mapHeight;
				}

				// Set the height of the container to the height of the first table (All tables should be about
				// the same size)
				$container.height(tableHeight);
			}
		}).init();
	} else {
		me.removeLegendContainer();
	}

	return me;
};
