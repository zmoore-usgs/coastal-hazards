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

	me.loadSLDCallback = function (data, dataItem, index, isLast) {
		return;
		var sld = data,
			featureLegend,
			existingDivArray,
			$legendContainer = $('#info-legend'),
			insertLegendAtIndex = function (legend, index) {
				if (index === 0) {
					$legendContainer.prepend(legend);
				} else {
					existingDivArray = $legendContainer.find('> div:nth-child(' + (index + 1) + ')');
					if (existingDivArray.length) {
						existingDivArray.before(legend);
					} else {
						$legendContainer.append(legend);
					}
				}
				// Make sure the legend container is only as large as the first
				// legend child
				$legendContainer.height($legendContainer.find('>div:first-child').height());
			};
		if (dataItem.type === 'historical') {
			if (["LRR", "WLR", "SCE", "NSM", "EPR"].indexOf(dataItem.attr.toUpperCase()) !== -1) {
				featureLegend = CCH.ui.buildLegend({
					type: dataItem.type,
					name: dataItem.name,
					attr: dataItem.attr,
					sld: sld
				});
				insertLegendAtIndex(featureLegend, index);
			} else {
				var wmsService = dataItem.services.find(function (svc) {
					return svc.type === 'proxy_wms';
				});

				// - The legend builder is going to need the actual data from the shorelines layer
				// 
				// - Using the wmsService.layers info for a WMS request because that's properly
				// formatted to go into this request. The wfsService has the fully qualified namespace
				// which borks the WFS request
				CCH.ows.getFilteredFeature({
					layerName: wmsService.serviceParameter,
					propertyArray: [dataItem.attr],
					callbacks: {
						success: [
							function (data) {
								var features = data;
								featureLegend = CCH.ui.buildLegend({
									type: dataItem.type,
									attr: dataItem.attr,
									sld: sld,
									features: features
								});
								if ($('.cch-ui-legend-table').length === 0) {
									insertLegendAtIndex(featureLegend, index);
								} else {
									var $table = $('.cch-ui-legend-table'),
										$rows = $table.find('tbody > tr'),
										$caption = $table.find('caption');

									featureLegend.find('tr').each(function (ind, row) {
										var foundRow = $rows.toArray().find(function (r) {
											return $(r).attr('data-attr') === $(row).attr('data-attr');
										});

										if (!foundRow) {
											$rows.push(row);
										}
									});

									// I'm going to empty the table, add the sorted
									// rows put the caption back on top
									$table.empty();
									var sortedRows = $rows.toArray().sortBy(function (row) {
										return parseInt($(row).find('.cch-ui-legend-table-body-div-year').html());
									}),
										$thead = $('<thead />').append($('<tr />').append(
										$('<td />'),
										$('<td />').html('Year')
										));
									$table.append($thead, $('<tbody />').append(sortedRows.reverse()));
									$table.prepend($caption);
								}
							}
						],
						error: [
							function (data, textStatus) {
								LOG.warn(textStatus);
								CCH.ui.removeLegendContainer();
							}
						]
					}
				});
			}
		} else if (dataItem.type === 'storms') {
			if ($legendContainer.find('#feature-legend-' + dataItem.attr).length === 0) {
				featureLegend = CCH.ui.buildLegend({
					type: dataItem.type,
					sld: sld
				});
				featureLegend.attr('id', 'feature-legend-' + dataItem.attr);
				insertLegendAtIndex(featureLegend, index);
			}

			if (isLast && $legendContainer.children().length === 1) {
				$legendContainer.find('caption').html(item.summary.full.title);
			}
		} else if (dataItem.type === 'vulnerability') {
			if ($legendContainer.find('#feature-legend-' + dataItem.attr).length === 0) {
				featureLegend = CCH.ui.buildLegend({
					type: dataItem.type,
					attr: dataItem.attr,
					sld: sld
				});
				featureLegend.attr('id', 'feature-legend-' + dataItem.attr);
				insertLegendAtIndex(featureLegend, index);
			}

			if (isLast && $legendContainer.children().length === 1) {
				$legendContainer.find('caption').html(item.summary.full.title);
			}
		}
	};

	me.buildLegend = function (args) {
		args = args || {};

		if (!args.sld) {
			return null;
		}

		var sld = args.sld,
			type = args.type,
			bInd = 0,
			ub,
			lb,
			$legendDiv = $('<div />').addClass('cch-ui-legend-div'),
			$legendTable = $('<table />').addClass('cch-ui-legend-table table table-bordered table-hover'),
			$legendTableCaption = $('<caption />').addClass('cch-ui-legend-table-caption').html(CCH.CONFIG.item.summary.tiny.text || sld.title),
			$legendTableHead = $('<thead />').append(
			$('<tr />').append(
			$('<th />').attr({'scope': 'col'}),
			$('<th />').attr({'scope': 'col'}).html(sld.units)
			)
			),
			$legendTableBody = $('<tbody />'),
			legendTableBodyTr,
			legendTableBodyTdColor,
			legendTableBodyTdRange,
			legendTableBodyTdYear,
			valueContainer,
			range = function (ub, lb) {
				if (lb && ub) {
					return lb + ' to ' + ub;
				}

				if (lb && !ub) {
					return '> ' + lb;
				}

				if (!lb && ub) {
					return '< ' + ub;
				}
			},
			buildVanillaLegend = function () {
				for (bInd; bInd < sld.bins.length; bInd++) {
					ub = sld.bins[bInd].upperBound;
					lb = sld.bins[bInd].lowerBound;
					legendTableBodyTr = $('<tr />');
					legendTableBodyTdColor = $('<td />').addClass('cch-ui-legend-table-body-td-color').append(
						$('<div />').addClass('cch-ui-legend-table-body-div-color').css('background-color', sld.bins[bInd].color).html('&nbsp;')
						);
					legendTableBodyTdRange = $('<td />').addClass('cch-ui-legend-table-body-td-range').append(
						$('<div />').addClass('cch-ui-legend-table-body-div-range').html(range(ub, lb))
						);
					$legendTableBody.append(
						legendTableBodyTr.append(
							legendTableBodyTdColor,
							legendTableBodyTdRange
							)
						);
				}
			},
			year,
			years,
			yearToColor,
			yInd,
			createYearLookupMap = function (y) {
				return y < 10 ? '0' + y : String() + y;
			},
			attr = args.attr,
			category;

		if (type === 'historical') {
			if (["LRR", "WLR", "SCE", "NSM", "EPR"].indexOf(attr.toUpperCase()) !== -1) {
				buildVanillaLegend();
				$legendDiv.append($legendTable.append(
					$legendTableCaption,
					$legendTableHead,
					$legendTableBody
					));
			} else {
				var $testTable = $('.cch-ui-legend-table[data-attr="' + attr + '"]');
				if ($testTable.length !== 0) {
					$legendTable = $testTable;
					$legendDiv.empty();
				}

				// TODO- When time permits, figure out why adding this repeatedly
				// only creates one caption in the table. I don't have time right 
				// now to trace this down
				$legendDiv.append($legendTable.append($legendTableCaption));

				years = args.features.map(function (f) {
					if (CCH.CONFIG.item.attr) {
						return f.data[CCH.CONFIG.item.attr].split('/')[2];
					} else {
						return Object.values(f.data)[0].split('/')[2];
					}
				}).unique().sort().reverse();

				// Create a proper map to quickly look years up against
				yearToColor = {};
				for (bInd = 0; bInd < sld.bins.length; bInd++) {
					sld.bins[bInd].years = sld.bins[bInd].years.map(createYearLookupMap);
					for (yInd = 0; yInd < 3; yInd++) {
						year = sld.bins[bInd].years[yInd];
						// The tail end of the sld.bins doesn't have 3 indexes so check
						if (year) {
							yearToColor[year] = sld.bins[bInd].color;
						}
					}
				}

				for (yInd = 0; yInd < years.length; yInd++) {
					var yr = years[yInd].substr(2);
					legendTableBodyTr = $('<tr />').attr('data-attr', yr);
					legendTableBodyTdColor = $('<td />').
						addClass('cch-ui-legend-table-body-td-color').
						append($('<div />').
							addClass('cch-ui-legend-table-body-div-color').
							css('background-color', yearToColor[years[yInd].substr(2)]).html('&nbsp;')
							);
					valueContainer = $('<div />').attr({'id': 'cch-ui-legend-table-body-div-year-' + years[yInd]}).addClass('cch-ui-legend-table-body-div-year').html(years[yInd]);
					legendTableBodyTdYear = $('<td />').addClass('cch-ui-legend-table-body-td-year').append(valueContainer);
					$legendTable.append(legendTableBodyTr.append(legendTableBodyTdColor, legendTableBodyTdYear));
				}
			}
		} else if (type === 'storms') {
			buildVanillaLegend();
			$legendDiv.append($legendTable.append(
				$legendTableCaption,
				$legendTableHead,
				$legendTableBody
				));
		} else if (type === 'vulnerability') {
			if (["TIDERISK", "SLOPERISK", "ERRRISK", "SLRISK", "GEOM", "WAVERISK", "CVIRISK"].indexOf(args.attr.toUpperCase()) !== -1) {
				// Old school CVI
				for (bInd = 0; bInd < sld.bins.length; bInd++) {
					category = sld.bins[bInd].category;
					legendTableBodyTr = $('<tr />');
					legendTableBodyTdColor = $('<td />').addClass('cch-ui-legend-table-body-td-color').append(
						$('<div />').addClass('cch-ui-legend-table-body-div-color').css('background-color', sld.bins[bInd].color).html('&nbsp;'));
					legendTableBodyTdRange = $('<td />').addClass('cch-ui-legend-table-body-td-range').append(
						$('<div />').addClass('cch-ui-legend-table-body-div-range').html(category));
					$legendTableBody.append(legendTableBodyTr.append(legendTableBodyTdColor, legendTableBodyTdRange));
				}
			} else {
				// Bayesian
				buildVanillaLegend();
			}

			$legendDiv.append($legendTable.append(
				$legendTableCaption,
				$legendTableHead,
				$legendTableBody
				));
		}

		return $legendDiv;
	};

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

	me.legend = new CCH.Objects.Widget.Legend({
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

	return me;
};
