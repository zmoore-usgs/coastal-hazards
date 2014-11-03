/* global LOG, CONFIG, OpenLayers, Handlebars */
var Shorelines = {
	stage: 'shorelines',
	suffixes: ['_shorelines'],
	mandatoryColumns: ['date', 'uncy'],
	defaultingColumns: [
		{attr: CONFIG.strings.columnAttrNames.MHW, defaultValue: "0"},
		{attr: CONFIG.strings.columnAttrNames.source, defaultValue: ''},
		{attr: CONFIG.strings.columnAttrNames.name, defaultValue: ''},
		{attr: CONFIG.strings.columnAttrNames.distance, defaultValue: ''},
		{attr: CONFIG.strings.columnAttrNames.defaultDirection, defaultValue: ''},
		{attr: CONFIG.strings.columnAttrNames.biasUncertainty, defaultValue: ''}
	],
	groupingColumn: 'date',
	columnMatchingTemplate: undefined,
	featureTableRowTemplate: undefined,
	CONTROL_IDENTIFY_ID: 'shoreline-identify-control',
	CONTROL_IDENTIFY_AOI_ID: 'shoreline-identify-aoi-control',
	LAYER_AOI_NAME: 'layer-aoi-box',
	$buttonSelectAOI: $('#shorelines-aoi-select-toggle'),
	$buttonSelectAOIDone: $('#shorelines-aoi-select-done'),
	$descriptionAOI: $('#description-aoi'),
	$shorelineFeatureTableContainer: $('#shorelines-feature-table-container'),
	aoiBoundsSelected: null,
	shorelinesServiceEndpoint: 'service/shoreline',
	uploadRequest: {
		'endpoint': 'service/stage-shoreline',
		'paramsInBody': false,
		'forceMultipart': false,
		params: {
			'response.encoding': 'json',
			'filename.param': 'qqfile',
			'action': 'stage',
			'workspace': 'added during app init'
		}
	},
	uploadExtraParams: {
		'action': 'stage'
	},
	description: {
		'stage': '<p>Shorelines are geospatial polylines which represent the location of the shoreline and various points in time</p> <p>Add shorelines to your workspace with the selection box above or upload your own zipped shapefile containing shoreline polylines within the Manage tab.</p><p>Use the map to investigate the selected shorelines, clicking to enable/disable for DSASweb processing.</p><hr />View and select existing published shorelines, or upload your own. Shorelines represent snap-shots of the coastline at various points in time.',
		'view-tab': 'Select a published collection of shorelines to add to the workspace.',
		'manage-tab': ' Upload a zipped shapefile to add it to the workspace.',
		'upload-button': 'Upload a zipped shapefile which includes shoreline polyline features.'
	},
	appInit: function () {
		"use strict";
		this.initSession();
		this.uploadRequest.params.workspace = CONFIG.tempSession.session.id;
		this.initializeUploader();
		this.bindSelectAOIButton();
		this.bindSelectAOIDoneButton();

		// Pre-compile the handlebars template for creating column matching windows
		$.get('templates/column-matching-modal.mustache').done(function (data) {
			Shorelines.columnMatchingTemplate = Handlebars.compile(data);
			Handlebars.registerHelper('printDefaultValue', function () {
				if (this.defaultValue) {
					return new Handlebars.SafeString(' Default: "' + this.defaultValue + '"');
				} else {
					return '';
				}
			});
		});
		$.get('templates/shoreline-feature-table-row.mustache').done(function (data) {
			Shorelines.featureTableRowTemplate = Handlebars.compile(data);
			Handlebars.registerHelper('isChecked', function () {
				if (this.checked) {
					return new Handlebars.SafeString('checked="checked"');
				} else {
					return '';
				}
			});
		});

		Shorelines.enterStage();
	},
	initSession: function () {
		var sessionStage = CONFIG.tempSession.getStage(this.stage);

		// Add a disabled dates key
		if (!sessionStage.datesDisabled) {
			sessionStage.datesDisabled = [];
		}

		// Remove individual shorelines layers from session 
		Object.keys(sessionStage).forEach(function (k) {
			if (k.indexOf(':') !== -1) {
				delete sessionStage[k];
			}
		});

		CONFIG.tempSession.setStage({
			stage: this.stage,
			obj: sessionStage
		});
		CONFIG.tempSession.persistSession();
	},
	enterStage: function () {
		"use strict";
		LOG.debug('Shorelines.js::enterStage');
		Shorelines.activateShorelineIdControl();
		CONFIG.ui.switchTab({
			caller: Shorelines,
			tab: 'view'
		});
	},
	leaveStage: function () {
		"use strict";
		LOG.debug('Shorelines.js::leaveStage');
		Shorelines.deactivateShorelineIdControl();
		Shorelines.closeShorelineIdWindows();
		Shorelines.toggleBindSelectAOIButton(false);
	},
	/**
	 * Calls DescribeFeatureType against OWS service and tries to add the layer(s) to the map 
	 * @param {type} layers
	 * @returns {undefined}
	 */
	addShorelines: function (layers) {
		"use strict";
		LOG.info('Shorelines.js::addShorelines');

		LOG.debug('Shorelines.js::addShorelines: Adding ' + layers.length + ' shoreline layers to map');
		layers.each(function (layer) {
			var layerTitle = layer.title;
			var layerPrefix = layer.prefix;
			var layerName = layer.name;

			var addToMap = function (data, textStatus, jqXHR) {
				LOG.trace('Shorelines.js::addShorelines: Attempting to add shoreline layer ' + layerTitle + ' to the map.');
				CONFIG.ows.getDescribeFeatureType({
					layerNS: layerPrefix,
					layerName: layerName,
					callbacks: [
						function (describeFeaturetypeRespone) {
							LOG.trace('Shorelines.js::addShorelines: Parsing layer attributes to check that they contain the attributes needed.');
							var attributes = describeFeaturetypeRespone.featureTypes[0].properties;
							if (attributes.length < Shorelines.mandatoryColumns.length) {
								LOG.warn('Shorelines.js::addShorelines: There are not enough attributes in the selected shapefile to constitute a valid shoreline. Will be deleted. Needed: ' + Shorelines.mandatoryColumns.length + ', Found in upload: ' + attributes.length);
								Shorelines.removeResource();
								CONFIG.ui.showAlert({
									message: 'Not enough attributes in upload - Check Logs',
									caller: Shorelines,
									displayTime: 7000,
									style: {
										classes: ['alert-error']
									}
								});
							}

							var layerColumns = Util.createLayerUnionAttributeMap({
								caller: Shorelines,
								attributes: attributes
							});

							var foundAll = true;
							Shorelines.mandatoryColumns.each(function (mc) {
								if (layerColumns.values().indexOf(mc) === -1) {
									foundAll = false;
								}
							});

							Shorelines.defaultingColumns.each(function (col) {
								if (layerColumns.values().indexOf(col.attr) === -1) {
									foundAll = false;
								}
							});

							if (layerPrefix !== CONFIG.name.published && !foundAll) {
								CONFIG.ui.buildColumnMatchingModalWindow({
									layerName: layerName,
									columns: layerColumns,
									caller: Shorelines,
									template: Shorelines.columnMatchingTemplate,
									continueCallback: function () {
										Shorelines.addLayerToMap({
											layer: layer,
											describeFeaturetypeRespone: describeFeaturetypeRespone
										});
									}
								});
							} else {
								Shorelines.addLayerToMap({
									layer: layer,
									describeFeaturetypeRespone: describeFeaturetypeRespone
								});
							}
						}
					]
				});
			};

			CONFIG.ows.getUTMZoneCount({
				layerPrefix: layer.prefix,
				layerName: layer.name,
				callbacks: {
					success: [
						function (data, textStatus, jqXHR) {
							LOG.trace('Shorelines.js::addShorelines: UTM Zone Count Returned. ' + data + ' UTM zones found');
							if (data > 1) {
								CONFIG.ui.showAlert({
									message: 'Shoreline spans ' + data + ' UTM zones',
									caller: Shorelines,
									displayTime: 5000
								});
							}
							addToMap(data, textStatus, jqXHR);
						}
					],
					error: [
						function (data, textStatus, jqXHR) {
							LOG.warn('Shorelines.js::addShorelines: Could not retrieve UTM count for this resource. It is unknown whether or not this shoreline resource crosses more than 1 UTM zone. This could cause problems later.');
							addToMap(data, textStatus, jqXHR);
						}
					]
				}
			});
		});
	},
	addLayerToMap: function (args) {
		"use strict";
		var name = args.name,
			prefix = args.prefix,
			title = args.title,
			bounds = args.bounds,
			dates = args.dates,
			colorDatePairings = Util.createColorGroups(dates),
			sldBody = Shorelines.createSLDBody({
				colorDatePairings: colorDatePairings,
				groupColumn: 'date',
				layer: {
					prefix: prefix,
					name: name
				}
			}),
			wmsLayer = new OpenLayers.Layer.WMS(
				name,
				CONFIG.ows.geoserverProxyEndpoint + prefix + '/wms',
				{
					layers: [name],
					transparent: true,
					sld_body: sldBody,
					format: "image/png",
					bbox: bounds
				},
			{
				prefix: prefix,
				zoomToWhenAdded: false,
				isBaseLayer: false,
				unsupportedBrowsers: [],
				colorGroups: colorDatePairings,
				tileOptions: {
					// http://www.faqs.org/rfcs/rfc2616.html
					// This will cause any request larger than this many characters to be a POST
					maxGetUrlLength: 2048
				},
				title: title,
				singleTile: true,
				ratio: 1,
				groupByAttribute: 'date',
				layerType: Shorelines.stage,
				displayInLayerSwitcher: false
			}),
			loadEnd = function (e) {
				e.object.events.unregister('loadend', null, loadEnd);
				Shorelines.updateFeatureTable(e);
				Shorelines.showFeatureTable();
			};

		Shorelines.getShorelineIdControl().layers.push(wmsLayer);
		wmsLayer.events.register("loadend", wmsLayer, loadEnd);
		CONFIG.map.getMap().addLayer(wmsLayer);
		wmsLayer.redraw(true);
		return wmsLayer;
	},
	/**
	 * 
	 * @param {type} args
	 * @returns {undefined}
	 * 
	 */
	addLayerToMap2: function (args) {
		"use strict";
		var layer = args.layer;
		LOG.debug('Shorelines.js::addLayerToMap: Adding shoreline layer ' + layer.title + 'to map');
		var properties = CONFIG.ows.getLayerPropertiesFromWFSDescribeFeatureType({
			describeFeatureType: args.describeFeaturetypeRespone,
			includeGeom: false
		})[layer.name];

		CONFIG.ows.getFilteredFeature({
			layerPrefix: layer.prefix,
			layerName: layer.name,
			propertyArray: properties,
			scope: this,
			callbacks: {
				success: [
					function (features) {
						LOG.info('Shorelines.js::addLayerToMap: WFS GetFileterdFeature returned successfully');
						if (CONFIG.map.getMap().getLayersByName(layer.title).length === 0) {
							LOG.info('Shorelines.js::addLayerToMap: Layer does not yet exist on the map. Loading layer: ' + layer.title);

							var stage = CONFIG.tempSession.getStage(Shorelines.stage);
							var groupingColumn = Object.keys(features[0].attributes).find(function (n) {
								return n.toLowerCase() === stage.groupingColumn.toLowerCase();
							});
							LOG.trace('Shorelines.js::addLayerToMap: Found correct grouping column capitalization for ' + layer.title + ', it is: ' + groupingColumn);

							LOG.trace('Shorelines.js::addLayerToMap: Saving grouping column to session');
							stage.groupingColumn = groupingColumn;

							stage.dateFormat = Util.getLayerDateFormatFromFeaturesArray({
								featureArray: features,
								groupingColumn: groupingColumn
							});
							CONFIG.tempSession.persistSession();

							// Find the index of the desired column
							var dateIndex = Object.keys(features[0].attributes).findIndex(function (n) {
								return n === groupingColumn;
							});

							// Extract the values from the features array
							var groups = Util.makeGroups({
								groupItems: features.map(function (n) {
									return Object.values(n.attributes)[dateIndex];
								}),
								preserveDate: true
							});

							if (groups[0] instanceof Date) {
								// If it's a date array Change the groups items back from Date item back into string
								groups = groups.map(function (n) {
									return n.format(stage.dateFormat);
								});
							}

							var colorDatePairings = Util.createColorGroups(groups);

							var sldBody = Shorelines.createSLDBody({
								colorDatePairings: colorDatePairings,
								groupColumn: groupingColumn,
								layer: layer
							});

							var wmsLayer = new OpenLayers.Layer.WMS(
								layer.name,
								'geoserver/' + layer.prefix + '/wms',
								{
									layers: [layer.name],
									transparent: true,
									sld_body: sldBody,
									format: "image/png"
								},
							{
								prefix: layer.prefix,
								zoomToWhenAdded: true, // Include this layer when performing an aggregated zoom
								isBaseLayer: false,
								unsupportedBrowsers: [],
								colorGroups: colorDatePairings,
								describedFeatures: features,
								tileOptions: {
									// http://www.faqs.org/rfcs/rfc2616.html
									// This will cause any request larger than this many characters to be a POST
									maxGetUrlLength: 2048
								},
								title: layer.title,
								singleTile: true,
								ratio: 1,
								groupByAttribute: groupingColumn,
								groups: groups,
								displayInLayerSwitcher: false
							});

							Shorelines.getShorelineIdControl().layers.push(wmsLayer);
							wmsLayer.events.register("loadend", wmsLayer, Shorelines.createFeatureTable);
							wmsLayer.events.register("added", wmsLayer, Shorelines.zoomToLayer);
							CONFIG.map.getMap().addLayer(wmsLayer);
							wmsLayer.redraw(true);
						}
					}
				],
				error: [
					function () {
						LOG.warn('Shorelines.js::addLayerToMap: Failed to retrieve a successful WFS GetFileterdFeature response');
					}
				]
			}
		});
	},
	createSLDBody: function (args) {
		"use strict";
		var sldBody;
		var colorDatePairings = args.colorDatePairings;
		var groupColumn = args.groupColumn;
		var layer = args.layer;
		var layerName = args.layerName || layer.prefix + ':' + layer.name;
		var scaleDenominatorFunction = '<ogc:Function name="min">' +
			'<ogc:Literal>6</ogc:Literal>' +
			'<ogc:Function name="max">' +
			'<ogc:Literal>2</ogc:Literal>' +
			'<ogc:Div>' +
			'<ogc:Literal>1000000</ogc:Literal>' +
			'<ogc:Function name="env">' +
			'<ogc:Literal>wms_scale_denominator</ogc:Literal>' +
			'</ogc:Function>' +
			'</ogc:Div>' +
			'</ogc:Function>' +
			'</ogc:Function>';

		if (!isNaN(colorDatePairings[0][1])) {
			LOG.info('Shorelines.js::?: Grouping will be done by number');
			// Need to first find out about the featuretype
			var createUpperLimitFilterSet = function (colorLimitPairs) {
				var filterSet = '';
				for (var pairsIndex = 0; pairsIndex < colorLimitPairs.length; pairsIndex++) {
					filterSet += '<ogc:Literal>' + colorLimitPairs[pairsIndex][0] + '</ogc:Literal>';
					filterSet += '<ogc:Literal>' + colorLimitPairs[pairsIndex][1] + '</ogc:Literal>';
				}
				return filterSet + '<ogc:Literal>' + Util.getRandomColor({
					fromDefinedColors: true
				}).capitalize(true) + '</ogc:Literal>';
			};

			sldBody = '<?xml version="1.0" encoding="ISO-8859-1"?>' +
				'<StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
				'<NamedLayer>' +
				'<Name>#[layer]</Name>' +
				'<UserStyle>' +
				'<FeatureTypeStyle>' +
				'<Rule>' +
				'<PointSymbolizer>' +
				'<Graphic>' +
				'<Mark>' +
				'<WellKnownName>circle</WellKnownName>' +
				'<Fill>' +
				'<CssParameter name="fill">#FF0000</CssParameter>' +
				'</Fill>' +
				'<Stroke>' +
				'<CssParameter name="stroke">' +
				'<ogc:Function name="Categorize">' +
				'<ogc:PropertyName>' + groupColumn.trim() + '</ogc:PropertyName> '
				+ createUpperLimitFilterSet(colorDatePairings) +
				'</ogc:Function>' +
				'</CssParameter>' +
				'<CssParameter name="stroke-opacity">1</CssParameter>' +
				'<CssParameter name="stroke-width">1</CssParameter>' +
				'</Stroke>' +
				'</Mark>' +
				'<Size>' + scaleDenominatorFunction + '</Size>' +
				'</Graphic>' +
				'</PointSymbolizer>' +
				'</Rule>' +
				'</FeatureTypeStyle>' +
				'</UserStyle>' +
				'</NamedLayer>' +
				'</StyledLayerDescriptor>';
		} else if (!isNaN(Date.parse(colorDatePairings[0][1]))) {
			LOG.debug('Shorelines.js::?: Grouping will be done by year');

			var createRuleSets;
			LOG.debug('Shorelines.js::?: Geoserver date column is actually a string');
			createRuleSets = function (colorLimitPairs) {
				var html = '';


				for (var lpIndex = 0; lpIndex < colorLimitPairs.length; lpIndex++) {
					var date = colorLimitPairs[lpIndex][1];
					var disabledDates = CONFIG.tempSession.getDisabledDates();
					if (disabledDates.indexOf(date) === -1) {
						html += '<Rule><ogc:Filter>';
						html += '<ogc:PropertyIsLike escape="!" singleChar="." wildCard="*">';
						html += '<ogc:PropertyName>';
						html += groupColumn.trim();
						html += '</ogc:PropertyName>';
						html += '<ogc:Literal>';
						html += colorLimitPairs[lpIndex][1];
						html += '</ogc:Literal>';
						html += '</ogc:PropertyIsLike>';
						html += '</ogc:Filter><PointSymbolizer><Graphic><Mark><WellKnownName>circle</WellKnownName><Fill><CssParameter name="fill">#FFFFFF</CssParameter></Fill><Stroke><CssParameter name="stroke">';
						html += colorLimitPairs[lpIndex][0];
						html += '</CssParameter></Stroke></Mark><Size>' + scaleDenominatorFunction + '</Size></Graphic></PointSymbolizer></Rule>';
					}
				}

				// default rule 
				html += '<Rule><ElseFilter />';
				html += '<PointSymbolizer>';
				html += '<Graphic>';
				html += '<Mark>';
				html += '<WellKnownName>circle</WellKnownName>';
				html += '<Stroke>';
				html += '<CssParameter name="stroke-opacity">0</CssParameter>';
				html += '</Stroke>';
				html += '</Mark>';
				html += '</Graphic>';
				html += '</PointSymbolizer>';
				html += '</Rule>';

				return html;
			};

			sldBody = '<?xml version="1.0" encoding="ISO-8859-1"?>' +
				'<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
				'<NamedLayer>' +
				'<Name>#[layer]</Name>' +
				'<UserStyle>' +
				'<FeatureTypeStyle> ' + createRuleSets(colorDatePairings) + '</FeatureTypeStyle>' +
				'</UserStyle>' +
				'</NamedLayer>' +
				'</StyledLayerDescriptor>';

		}
		sldBody = sldBody.replace('#[layer]', layerName);
		return sldBody;
	},
	zoomToLayer: function () {
		"use strict";
		LOG.info('loadend event triggered on layer');
		var bounds = new OpenLayers.Bounds();
		var layers = CONFIG.map.getMap().getLayersBy('zoomToWhenAdded', true);

		$(layers).each(function (i, layer) {
			if (layer.zoomToWhenAdded) {
				var mapLayer = CONFIG.ows.getLayerByName({
					layerNS: layer.prefix,
					layerName: layer.name
				}),
					mlBbox,
					lbbox;
				if (mapLayer) {
					mlBbox = mapLayer.bbox[CONFIG.strings.epsg4326];

					if (mlBbox) {
						lbbox = mlBbox.bbox;
						bounds.extend(new OpenLayers.Bounds(lbbox[1], lbbox[0], lbbox[3], lbbox[2]).
							transform(new OpenLayers.Projection(CONFIG.strings.epsg4326), new OpenLayers.Projection(CONFIG.strings.epsg900913)));

						if (layer.events.listeners.loadend.length) {
							layer.events.unregister('added', layer, Shorelines.zoomToLayer);
						}
					} else {
						LOG.warn('Map layer does not have EPSG:3857 or EPSG:900913 bounding box designation. Could not zoom to layer.');
					}
				}
			}
		});

		if (bounds.left && bounds.right && bounds.top && bounds.bottom) {
			CONFIG.map.getMap().zoomToExtent(bounds, false);
		}
	},
	emptyFeatureTable: function () {
		Shorelines.$shorelineFeatureTableContainer.find('table > tbody').empty();
	},
	updateFeatureTable: function (event) {
		var layer = event.object,
			colorGroups = layer.colorGroups,
			$switchCandidates,
			$tbody = Shorelines.$shorelineFeatureTableContainer.find('table > tbody');

		event.object.events.unregister('loadend', null, Shorelines.updateFeatureTable);

		colorGroups.forEach(function (cg) {
			var color = cg[0],
				date = cg[1],
				checked = !CONFIG.tempSession.isDateDisabled(date),
				row = Shorelines.featureTableRowTemplate({
					color: color,
					date: date,
					checked: checked
				}),
				// I only want to do this if the table doesn't already contain this date
				$existingDates = Shorelines.$shorelineFeatureTableContainer
				.find('table > tbody')
				.find('td:nth-child(2):contains("' + date + '")');

			if (!$existingDates.length)
				$tbody.append($(row));
		}, this);

		if (layer.prefix === CONFIG.tempSession.getCurrentSessionKey()) {
			// We may have auxillary values to sort by so try to grab them after
			// the table is set up
			$.ajax(Shorelines.shorelinesServiceEndpoint + '?', {
				context: this,
				data: {
					action: 'getDateToAuxValues',
					workspace: layer.prefix
				},
				success: function (e, status) {
					if (status === 'success' && e.success === 'true') {
						var dateToValue = JSON.parse(e.values);

						if (Object.keys(dateToValue).length) {
							var $theadRow = Shorelines.$shorelineFeatureTableContainer.find('thead > tr'),
								$tbody = Shorelines.$shorelineFeatureTableContainer.find('tbody'),
								$rows = $tbody.find('tr'),
								$th = $('<th />')
								.addClass('table-features-column-aux tablesorter-header')
								.attr({
									'data-column': '3'
								}),
								$thDiv = $('<div />').addClass('tablesorter-header-inner').html(e.name);

							$th.append($thDiv);
							$theadRow.append($th);
							$rows.each(function (i, row) {
								var $row = $(row),
									year = $row.children()[1].innerHTML,
									value = dateToValue[year],
									$td = $('<td />').addClass('table-features-column-aux').html(value);
								$row.append($td);
							});
						}
						$("table.tablesorter").trigger('update', false);
					}
				}
			});
		}

		$switchCandidates = $('.switch>:not(.switch-animate)').parent();

		$switchCandidates.each(function (index, element) {
			var switchChange = function (event, data) {
				var status = data.value,
					$element = data.el,
					date = $element.parent().parent().attr('data-date'),
					datesDisabled = CONFIG.tempSession.getDisabledDates();

				LOG.info('Shorelines.js::?: User has selected to ' + (status ? 'activate' : 'deactivate') + ' shoreline for date ' + date);

				var idTableButtons = $('.btn-year-toggle[date="' + date + '"]');
				if (!status) {
					// Date is disabled, add it to collection of disabled dates
					if (datesDisabled.indexOf(date) === -1) {
						datesDisabled.push(date);
					}

					idTableButtons.removeClass('btn-success');
					idTableButtons.addClass('btn-danger');
					idTableButtons.html('Enable');
				} else {
					// Date was not disabled. Remove it from the array of disabled dates
					while (datesDisabled.indexOf(date) !== -1) {
						datesDisabled.remove(date);
					}

					idTableButtons.removeClass('btn-danger');
					idTableButtons.addClass('btn-success');
					idTableButtons.html('Disable');
				}
				CONFIG.tempSession.setDisabledDates(datesDisabled);
				CONFIG.tempSession.persistSession();

				var layers = CONFIG.map.getMap().getLayersBy('layerType', Shorelines.stage);
				layers.forEach(function (l) {
					var sldBody = Shorelines.createSLDBody({
						colorDatePairings: l.colorGroups,
						groupColumn: l.groupByAttribute,
						layerTitle: l.title,
						layerName: l.prefix + ':' + l.name
					});

					l.params.SLD_BODY = sldBody;
					l.redraw(true);
				});

				$("table.tablesorter").trigger('update', false);
			};

			// Re-bind the event handler for this switch
			$(element)
				.off('switch-change', switchChange)
				.on('switch-change', switchChange);
		});

		$switchCandidates.bootstrapSwitch();
	},
	createFeatureTable2: function (event) {
		"use strict";
		LOG.info('Shorelines.js::createFeatureTable:: Creating color feature table');
		var navTabs = $('#shoreline-table-navtabs');
		var tabContent = $('#shoreline-table-tabcontent');
		var shorelineList = $('#shorelines-list');
		var layerPrefix = event.object.prefix;
		var layerName = event.object.params.LAYERS;

		var selectedVals = shorelineList.children(':selected').map(function (i, v) {
			return v.text;
		}).toArray();

		event.object.events.unregister('loadend', event.object, Shorelines.createFeatureTable);

		LOG.debug('Shorelines.js::createFeatureTable:: Creating color feature table header');
		var colorTableContainer = $('<div />').addClass('shoreline-feature-table');
		var colorTable = $('<table />').addClass('table table-bordered table-condensed tablesorter shoreline-table');
		var colorTableHead = $('<thead />');
		var colorTableHeadR = $('<tr />');
		var colorTableBody = $('<tbody />');

		colorTableHeadR.append($('<th />').addClass('shoreline-table-selected-head-column').html('Visibility'));
		colorTableHeadR.append($('<th />').html('Date'));
		colorTableHeadR.append($('<th />').attr('data-sorter', false).html('Color'));
		colorTableHead.append(colorTableHeadR);
		colorTable.append(colorTableHead);

		LOG.debug('Shorelines.js::createFeatureTable:: Creating color feature table body');

		$(event.object.colorGroups).each(function (i, colorGroup) {
			var date = colorGroup[1];
			var checked = CONFIG.tempSession.isDateDisabled(date);

			var tableRow = $('<tr />');
			var tableData = $('<td />');
			var toggleDiv = $('<div />');

			toggleDiv.addClass('switch').addClass('feature-toggle');
			toggleDiv.data('date', date);//will be used by click handler
			toggleDiv.data('layer-name', layerName);

			var checkbox = $('<input />').attr({
				type: 'checkbox'
			}).val(date);

			if (checked) {
				checkbox.attr('checked', 'checked');
			}

			toggleDiv.append(checkbox);

			tableData.append(toggleDiv);
			tableRow.append(tableData);
			tableRow.append($('<td />').html(date));
			tableRow.append($('<td />').
				attr('style', 'background-color:' + colorGroup[0] + ';').
				html('&nbsp;'));
			colorTableBody.append(tableRow);
		});

		colorTable.append(colorTableBody);
		colorTableContainer.append(colorTable);

		LOG.debug('Shorelines.js::createFeatureTable:: Color feature table created');

		LOG.debug('Shorelines.js::createFeatureTable:: Creating new tab for new color feature table');
		navTabs.children().each(function (i, navTab) {
			if (navTab.textContent === event.object.name || !selectedVals.count(navTab.textContent)) {
				$(navTab).remove();
			} else if ($(navTab).hasClass('active')) {
				$(navTab).removeClass('active');
			}
		});

		tabContent.children().each(function (i, tabContent) {
			if (tabContent.id === event.object.name || !selectedVals.count(tabContent.id)) {
				$(tabContent).remove();
			} else if ($(tabContent).hasClass('active')) {
				$(tabContent).removeClass('active');
			}
		});

		navTabs.append(
			$('<li />').addClass('active').append(
			$('<a />').attr({
			href: '#' + this.name,
			'data-toggle': 'tab'
		}).html(this.title)));

		LOG.debug('Shorelines.js::createFeatureTable:: Adding color feature table to DOM');

		tabContent.append(
			$('<div />').
			addClass('tab-pane active').
			attr('id', this.title).
			append(colorTableContainer));

		$('.switch').each(function (index, element) {
			var attachedLayer = event.object.prefix + ':' + layerName;
			$(element).on('switch-change',
				function (event, data) {
					var status = data.value,
						$element = data.el,
						layerName = attachedLayer,
						date = $element.parent().parent().data('date'),
						stageDatesDisabled = CONFIG.tempSession.getDisabledDates();

					LOG.info('Shorelines.js::?: User has selected to ' + (status ? 'activate' : 'deactivate') + ' shoreline for date ' + date + ' on layer ' + layerName);

					var idTableButtons = $('.btn-year-toggle[date="' + date + '"]');
					if (!status) {
						if (stageDatesDisabled.indexOf(date) === -1) {
							stageDatesDisabled.push(date);
						}

						idTableButtons.removeClass('btn-success');
						idTableButtons.addClass('btn-danger');
						idTableButtons.html('Enable');
					} else {
						while (stageDatesDisabled.indexOf(date) !== -1) {
							stageDatesDisabled.remove(date);
						}

						idTableButtons.removeClass('btn-danger');
						idTableButtons.addClass('btn-success');
						idTableButtons.html('Disable');
					}
					CONFIG.tempSession.persistSession();

					var layer = CONFIG.map.getMap().getLayersByName(layerName.split(':')[1])[0];
					var sldBody = Shorelines.createSLDBody({
						colorDatePairings: layer.colorGroups,
						groupColumn: layer.groupByAttribute,
						layerTitle: layer.title,
						layerName: layer.prefix + ':' + layer.name
					});

					layer.params.SLD_BODY = sldBody;
					layer.redraw(true);
					$("table.tablesorter").trigger('update', false);
				});
		});

		Shorelines.setupTableSorting();
		$('.switch').bootstrapSwitch();

		// Check to see if we need to create a wildcard column by seeing if there's anything to wildcard
		var ignoredColumns = ['id', 'date'];
		var featureKeys = Object.keys(event.object.describedFeatures[0].attributes).filter(function (key) {
			return ignoredColumns.indexOf(key.toLowerCase()) === -1;
		});
		if (featureKeys.length) {
			$('#shoreline-table-navtabs').find('li a[href="#' + layerName + '"]').
				append(
					$('<span />').
					addClass('wildcard-link').
					html('*').
					on('click', function () {

						var container = $('<div />').addClass('container-fluid');
						var explanationRow = $('<div />').addClass('row-fluid').attr('id', 'explanation-row');
						var explanationWell = $('<div />').addClass('well').attr('id', 'explanation-well');
						explanationWell.html('Choose an attribute from the shorelines resource to use as a wildcard column in the shorelines table for sorting purposes.');
						container.append(explanationRow.append(explanationWell));

						var selectionWell = $('<div />').addClass('well').attr({
							'style': 'text-align:center;',
							'id': 'selection-well'
						});
						var selectionRow = $('<div />').addClass('row-fluid').attr({
							'id': 'selection-row'
						});
						var selectList = $('<select />').addClass('wildcard-select-list');

						selectList.append(
							$('<option />').
							val('').
							html(''));

						featureKeys.each(function (attribute) {
							selectList.append(
								$('<option />').
								val(attribute).
								html(attribute));
						});
						selectionWell.append(selectList);
						selectionRow.append(selectionWell);
						container.append(selectionWell);
						$('#shoreline-table-navtabs li[class="active"] a').data('layer', {
							'layerPrefix': layerPrefix,
							'layerName': layerName
						});
						var modalShown = function () {
							var currentSelected = $('#shoreline-table-tabcontent>#' + layerName + '>.shoreline-feature-table>table>thead>tr>th:nth-child(4)').text() || '';
							$('.wildcard-select-list').val(currentSelected);
							$('.wildcard-select-list').on('change', function (event) {
								var layerPrefix = $('#shoreline-table-navtabs li[class="active"] a').data('layer').layerPrefix;
								var layerName = $('#shoreline-table-navtabs li[class="active"] a').data('layer').layerName;
								var layerObj = CONFIG.ows.featureTypeDescription[layerPrefix][layerName];
								var selectedVal = $(this).val();
								var table = $('#shoreline-table-tabcontent>#' + layerName + '>.shoreline-feature-table>table');

								$("table.tablesorter").trigger('destroy');

								// Clear table of previous wildcard, if any
								table.find('thead>tr>th:nth-child(4)').remove();
								table.find('tbody>tr>td:nth-child(4)').remove();

								if (selectedVal) {
									$(table).find('>thead>tr').append(
										$('<th />').
										html(selectedVal));
									var dateAttr = Object.keys(layerObj[0].data).find(function (k) {
										return k.toLowerCase() === 'date';
									});
									layerObj.unique(function (l) {
										return l.data[dateAttr];
									}).each(function (l) {
										var attributeData = l.data;
										var tr = $(table).find('>tbody>tr td:nth-child(2):contains("' + attributeData[dateAttr] + '")').parent();
										tr.append($('<td />').html(attributeData[selectedVal]));
									});
								}
								$("#modal-window").modal('hide');
								Shorelines.setupTableSorting();
							});
						};

						CONFIG.ui.createModalWindow({
							headerHtml: 'Choose A Wildcard Attribute',
							bodyHtml: container.html(),
							callbacks: [
								modalShown
							]
						});
					}));
		}
	},
	setupTableSorting: function () {
		"use strict";
		$.tablesorter.addParser({
			id: 'visibility',
			is: function (s) {
				return false;
			},
			format: function (s, table, cell, cellIndex) {
				var toggleButton = $(cell).find('.switch')[0];
				return $(toggleButton).bootstrapSwitch('status') ? 1 : 0;
			},
			type: 'numeric'
		});
		$.tablesorter.addParser({
			id: 'dateSorter',
			is: function (s) {
				return false;
			},
			format: function (s) {
				return Date.create(s).getTime();
			},
			type: 'numeric'
		});

		Shorelines.$shorelineFeatureTableContainer.find("table").tablesorter({
			headers: {
				0: { sorter: 'visibility' },
				1: { sorter: 'dateSorter' },
				3: { sorter: 'text'}
			}
		});
		
		
	},
	clear: function () {
		"use strict";
		$("#shorelines-list").val('');
		Shorelines.listboxChanged();
	},
//	listboxChanged: function () {
//		"use strict";
//		LOG.info('Shorelines.js::listboxChanged: A shoreline was selected from the select list');
//		CONFIG.map.getShorelineBoxLayer().setVisibility(true);
//		Shorelines.disableRemoveButton();
//		Shorelines.disableDownloadButton();
//		LOG.debug('Shorelines.js::listboxChanged: Removing all shorelines from map that were not selected');
//		$("#shorelines-list option:not(:selected)").each(function (index, option) {
//			var layerName = (option.value || ':').split(':')[1],
//				layers = CONFIG.map.getMap().getLayersBy('name', layerName);
//			if (layers.length) {
//				$(layers).each(function (i, layer) {
//					CONFIG.map.getMap().removeLayer(layer);
//
//					var idControl = Shorelines.getShorelineIdControl();
//					var controlLayerIndex = idControl.layers.indexOf(layer);
//					if (controlLayerIndex !== -1) {
//						idControl.layers = idControl.layers.removeAt(controlLayerIndex);
//					}
//				});
//			}
//		});
//
//		var layerInfos = [];
//		var stage = CONFIG.tempSession.getStage(Shorelines.stage);
//		stage.viewing = [];
//		if ($("#shorelines-list option:selected").val()) {
//			CONFIG.map.getShorelineBoxLayer().setVisibility(false);
//			$("#shorelines-list option:selected").each(function (index, option) {
//				LOG.debug('Shorelines.js::shorelineSelected: A shoreline (' + option.text + ') was selected from the select list');
//				var layerFullName = option.value;
//				var layerNamespace = layerFullName.split(':')[0];
//				var layerTitle = layerFullName.split(':')[1];
//				var layer = CONFIG.ows.getLayerByName({
//					layerNS: layerNamespace,
//					layerName: layerTitle
//				});
//				layerInfos.push(layer);
//				stage.viewing.push(layerFullName);
//				if (layerFullName.has(CONFIG.tempSession.getCurrentSessionKey())) {
//					Shorelines.enableRemoveButton();
//					Shorelines.enableDownloadButton();
//				}
//			});
//		}
//		CONFIG.tempSession.persistSession();
//
//		CONFIG.map.getShorelineBoxLayer().setZIndex(1000);
//
//		// Provide default names for base layers and transects
//		var derivedName = '';
//		var selectedLayers = stage.viewing;
//		var getSeries = function (series) {
//			var skey = CONFIG.tempSession.getCurrentSessionKey();
//			var startPoint = series.has(skey) ? skey.length : 0;
//			return series.substr(startPoint, series.lastIndexOf('_') - startPoint);
//		};
//		if (selectedLayers.length === 0) {
//			derivedName += Util.getRandomLorem();
//		}
//
//		if (selectedLayers.length > 0) {
//			derivedName += getSeries(selectedLayers[0].split(':')[1]);
//		}
//
//		if (selectedLayers.length > 1) {
//			derivedName += '_' + getSeries(selectedLayers[1].split(':')[1]);
//		}
//
//		if (selectedLayers.length > 2) {
//			derivedName += '_etal';
//		}
//
//		$('#baseline-draw-form-name').val(derivedName);
//		$('#create-transects-input-name').val(derivedName);
//		$('#results-form-name').val(derivedName);
//
//		if (layerInfos.length) {
//			Shorelines.addShorelines(layerInfos);
//		} else {
//			LOG.debug('Shorelines.js::shorelineSelected: All shorelines in shoreline list are deselected.');
//			$('#shoreline-table-navtabs').children().remove();
//			$('#shoreline-table-tabcontent').children().remove();
//		}
//	},
	initializeUploader: function (args) {
		"use strict";
		CONFIG.ui.initializeUploader($.extend({
			caller: Shorelines
		}, args));
	},
	getShorelineIdControl: function () {
		"use strict";
		var shorelineIdControl = CONFIG.map.getControlBy('title', Shorelines.CONTROL_IDENTIFY_ID);
		if (!shorelineIdControl) {
			shorelineIdControl = new OpenLayers.Control.WMSGetFeatureInfo({
				title: Shorelines.CONTROL_IDENTIFY_ID,
				layers: [],
				queryVisible: true,
				output: 'features',
				drillDown: true,
				maxFeatures: 1000,
				infoFormat: 'application/vnd.ogc.gml',
				vendorParams: {
					radius: 3
				}
			});
			shorelineIdControl.events.register("getfeatureinfo", this, CONFIG.ui.showShorelineInfo);
			CONFIG.map.addControl(shorelineIdControl);
		}
		return shorelineIdControl;
	},
	activateShorelineIdControl: function () {
		"use strict";
		var idControl = Shorelines.getShorelineIdControl();
		if (idControl) {
			LOG.debug('Shorelines.js::enterStage: Shoreline identify control found in the map. Activating.');
			idControl.activate();
		} else {
			LOG.warn('Shorelines.js::enterStage: Shoreline identify control not found. Creating one, adding to map and activating it.');
			Shorelines.wmsGetFeatureInfoControl.events.register("getfeatureinfo", this, CONFIG.ui.showShorelineInfo);
			CONFIG.map.addControl(Shorelines.wmsGetFeatureInfoControl);
		}
	},
	deactivateShorelineIdControl: function () {
		"use strict";
		var idControl = Shorelines.getShorelineIdControl();
		if (idControl) {
			LOG.debug('Shorelines.js::enterStage: Shoreline identify control found in the map.  Deactivating.');
			idControl.deactivate();
		}
	},
	closeShorelineIdWindows: function () {
		"use strict";
		$('#FramedCloud_close').trigger('click');
	},
	bindSelectAOIButton: function () {
		this.$buttonSelectAOI.on('click', function (e) {
			if ($(e.target).hasClass('active')) {
				Shorelines.deactivateSelectAOIControl();
			} else {
				Shorelines.activateSelectAOIControl();
			}
		});
	},
	toggleBindSelectAOIButton: function (toggleOn) {
		var isActive = Shorelines.$buttonSelectAOI.hasClass('active');
		if (toggleOn === true && !isActive) {
			Shorelines.$buttonSelectAOI.trigger('click');
		}

		if (!toggleOn === false && isActive) {
			Shorelines.$buttonSelectAOI.trigger('click');
		}
	},
	bindSelectAOIDoneButton: function () {
		this.$buttonSelectAOIDone.on('click', function (e) {
			var boxLayer = Shorelines.getAOISelectionLayer(),
				boxLayer;
			if (boxLayer) {
				if (boxLayer.features && boxLayer.features.length) {
					Shorelines.aoiBoundsSelected = boxLayer.features[0].geometry.bounds;
				} else {
					Shorelines.aoiBoundsSelected = null;
				}
			}

			Shorelines.$buttonSelectAOI.trigger('click');

			if (Shorelines.aoiBoundsSelected) {
				var filterFunc = function (l) {
					var layerBounds = OpenLayers.Bounds.fromArray(l.bbox[CONFIG.strings.epsg4326].bbox, true)
						.transform(new OpenLayers.Projection(CONFIG.strings.epsg4326), new OpenLayers.Projection(CONFIG.strings.epsg900913));
					return l.name.endsWith('shorelines') && Shorelines.aoiBoundsSelected.intersectsBounds(layerBounds);
				},
					validPublishedLayers = CONFIG.ows.wmsCapabilities.published.capability.layers.filter(filterFunc),
					validSessionLayers = CONFIG.ows.wmsCapabilities[CONFIG.tempSession.getCurrentSessionKey()].capability.layers.filter(filterFunc),
					validLayers = validPublishedLayers.concat(validSessionLayers),
					bounds = Shorelines.aoiBoundsSelected.clone(),
					boundsString = bounds.transform(new OpenLayers.Projection(CONFIG.strings.epsg900913), new OpenLayers.Projection(CONFIG.strings.epsg4326)).toArray(true).toString(),
					createGetFeaturesUrl = function (layer) {
						var layerPrefix = layer.prefix,
							url = CONFIG.ows.geoserverProxyEndpoint + layerPrefix + '/ows?',
							params = {
								service: 'WFS',
								version: '1.1.0',
								request: 'GetFeature',
								srsName: 'EPSG:4326',
								propertyName: layerPrefix + ':date',
								sortBy: layerPrefix + ':date',
								typeName: layerPrefix + ':' + layer.name,
								bbox: boundsString
							};
						return url + $.param(params);
					},
					ajaxCalls = validLayers.map(function (l) {
						var context = {
							layer: l,
							bounds: boundsString
						};
						return $.ajax(createGetFeaturesUrl(l), {context: context}).promise();
					});

				if (validLayers.length) {
					CONFIG.map.getMap().zoomToExtent(Shorelines.aoiBoundsSelected, true);
					$.when.apply(this, ajaxCalls).done(function () {
						var dates = [],
							aIdx;

						// I should have as many incoming arguments as there were 
						// ajax calls going out (probably 2: published and workspace).
						// I need to create a dates array here 
						for (aIdx = 0; aIdx < arguments.length; aIdx++) {
							var r = Array.isArray(arguments[0]) ? arguments[aIdx][0] : arguments[0];

							// For each argument I want to read the response into 
							// a features array 
							var features = new OpenLayers.Format.GML.v3().read(r);
							if (features.length) {
								// If the response had features come back, I want to 
								// grab the dates in those features and create a unique 
								// dates array
								dates = dates.union(features.map(function (f) {
									var origDate = f.data.date;
									if (origDate.indexOf('Z') !== -1) {
										origDate = origDate.substring(0, origDate.length - 1);
									}
									return origDate;
								})).sortBy(function (d) {
									return Date.parse(d);
								});
							}
						}

						var addLayer = function (o) {
							var layerInfo = o.layer,
								bounds = o.bounds;

							// I also want to add the WMS layer to the map
							var wmsLayer = Shorelines.addLayerToMap({
								name: layerInfo.name,
								prefix: layerInfo.prefix,
								title: layerInfo.title,
								bounds: bounds,
								dates: dates
							});
						}

						if (Array.isArray(this)) {
							for (aIdx = 0; aIdx < arguments.length; aIdx++) {
								addLayer(this[aIdx]);
							}
						} else {
							addLayer(this);
						}

						Shorelines.setupTableSorting();
					});

				} else {
					CONFIG.ui.showAlert({
						message: 'There is no data for the area of interest you selected<br />Try uploading data.',
						caller: Shorelines,
						displayTime: 3000,
						style: {
							classes: ['alert-warn']
						}
					});
				}

			} else {
				CONFIG.ui.showAlert({
					message: 'You have not selected an area of interest',
					caller: Shorelines,
					displayTime: 3000,
					style: {
						classes: ['alert-warn']
					}
				});
			}
		});
	},
	activateSelectAOIControl: function () {
		this.$descriptionAOI.removeClass('hidden');
		var drawBoxLayer = new OpenLayers.Layer.Vector(Shorelines.LAYER_AOI_NAME),
			aoiIdControl = new OpenLayers.Control.DrawFeature(drawBoxLayer,
				OpenLayers.Handler.RegularPolygon,
				{
					title: Shorelines.CONTROL_IDENTIFY_AOI_ID,
					handlerOptions: {
						sides: 4,
						irregular: true
					}
				});

		// I really only want one box on a layer at any given time
		drawBoxLayer.events.register('beforefeatureadded', null, function (e) {
			e.object.removeAllFeatures();
		});
		Shorelines.hideFeatureTable(true);
		Shorelines.removeShorelineLayers();
		CONFIG.map.getMap().addLayers([drawBoxLayer]);
		CONFIG.map.getMap().addControl(aoiIdControl);
		aoiIdControl.activate();
	},
	deactivateSelectAOIControl: function () {
		this.$descriptionAOI.addClass('hidden');
		var shorelineIdAOIControl = CONFIG.map.getControlBy('title', Shorelines.CONTROL_IDENTIFY_AOI_ID),
			layer;

		if (shorelineIdAOIControl) {
			layer = shorelineIdAOIControl.layer;
			CONFIG.map.removeLayer(layer, false);
			shorelineIdAOIControl.destroy();
		}
	},
	getAOISelectionLayer: function () {
		var results = CONFIG.map.getMap().getLayersBy('name', Shorelines.LAYER_AOI_NAME);
		if (results.length) {
			return results[0];
		}
		return null;
	},
	showFeatureTable: function () {
		Shorelines.$shorelineFeatureTableContainer.removeClass('hidden');
	},
	hideFeatureTable: function (clear) {
		Shorelines.$shorelineFeatureTableContainer.addClass('hidden');
		if (clear) {
			Shorelines.$shorelineFeatureTableContainer.find('tbody').empty();
		}
	},
	removeShorelineLayers: function () {
		var layers = CONFIG.map.getMap().getLayersBy('layerType', Shorelines.stage);
		layers.forEach(function (layer) {
			CONFIG.map.getMap().removeLayer(layer);
		});
	},
//	disableDownloadButton: function () {
//		"use strict";
//		this.$downloadButton.attr('disabled', 'disabled');
//	},
//	enableDownloadButton: function () {
//		"use strict";
//		this.$downloadButton.removeAttr('disabled');
//	},
//	disableRemoveButton: function () {
//		"use strict";
//		$('#shorelines-remove-btn').attr('disabled', 'disabled');
//	},
//	enableRemoveButton: function () {
//		"use strict";
//		$('#shorelines-remove-btn').removeAttr('disabled');
//	},
//	removeResource: function (args) {
//		"use strict";
//		args = args || {};
//		var layer = args.layer || $('#shorelines-list option:selected')[0].text,
//			store = args.store || 'shorelines',
//			cutOffIndex = layer.lastIndexOf(Shorelines.suffixes[0]),
//			callbacks = args.callbacks || [
//				function (data, textStatus, jqXHR) {
//					CONFIG.ui.showAlert({
//						message: 'Shorelines removed',
//						caller: Shorelines,
//						displayTime: 4000,
//						style: {
//							classes: ['alert-success']
//						}
//					});
//					CONFIG.ows.getWMSCapabilities({
//						namespace: CONFIG.tempSession.getCurrentSessionKey(),
//						callbacks: {
//							success: [
//								function () {
//									$('#shorelines-list').val('');
//									$('#shorelines-list').trigger('change');
//									CONFIG.ui.switchTab({
//										caller: Shorelines,
//										tab: 'view'
//									});
//									Shorelines.populateFeaturesList();
//								}
//							]
//						}
//					});
//
//				}
//			];
//
//		// I don't want the '_shorelines' suffix going into the removeResource function
//		if (cutOffIndex !== -1) {
//			layer = layer.substring(0, cutOffIndex);
//		}
//
//		try {
//			CONFIG.tempSession.removeResource({
//				store: store,
//				layer: layer,
//				extraParams: {
//					isShoreline: 'true'
//				},
//				callbacks: callbacks
//			});
//		} catch (ex) {
//			CONFIG.ui.showAlert({
//				message: 'Unable to remove resource - ' + ex,
//				caller: Shorelines,
//				displayTime: 4000,
//				style: {
//					classes: ['alert-error']
//				}
//			});
//		}
//	},
	getActive: function () {
		"use strict";
		return $('#shorelines-list').children(':selected').map(function (i, v) {
			return v.value;
		}).toArray();
	},
	uploadCallbacks: {
		onComplete: function (id, fileName, responseJSON) {
			CONFIG.ui.hideSpinner();
			$('#application-alert').alert('close');

			var success = responseJSON.success;
			if (success === 'true') {
				var token = responseJSON.token;

				Shorelines.getShorelineHeaderColumnNames({
					token: token,
					callbacks: {
						success: function (data) {
							var success = data.success,
								headers = data.headers,
								layerColumns = Object.extended(),
								foundAllRequiredColumns = true;

							if (success === 'true') {
								headers = headers.split(',');

								if (headers.length < Shorelines.mandatoryColumns.length) {
									LOG.warn('Shorelines.js::addShorelines: There '
										+ 'are not enough attributes in the selected '
										+ 'shapefile to constitute a valid shoreline. '
										+ 'Will be deleted. Needed: '
										+ Shorelines.mandatoryColumns.length
										+ ', Found in upload: ' + headers.length);
									Shorelines.removeResource();
									CONFIG.ui.showAlert({
										message: 'Not enough attributes in upload - Check Logs',
										caller: Shorelines,
										displayTime: 7000,
										style: {
											classes: ['alert-error']
										}
									});
								} else {
									// User needs to tell me which is uncy and date
									for (var hIdx = 0; hIdx < headers.length; hIdx++) {
										layerColumns[headers[hIdx]] = '';
									}
									layerColumns = Util.createLayerUnionAttributeMap({
										caller: Shorelines,
										layerColumns: layerColumns
									});

									Shorelines.mandatoryColumns.each(function (mc) {
										if (layerColumns.values().indexOf(mc) === -1) {
											foundAllRequiredColumns = false;
										}
									});

									Shorelines.defaultingColumns.each(function (col) {
										if (layerColumns.values().indexOf(col.attr) === -1) {
											foundAllRequiredColumns = false;
										}
									});

									var doUpload = function () {
										$.ajax(Shorelines.uploadRequest.endpoint, {
											type: 'POST',
											data: {
												action: 'import',
												token: token,
												workspace: CONFIG.tempSession.session.id,
												columns: JSON.stringify(layerColumns)
											},
											success: function (data) {
												var layerName = data.layer,
													workspace = CONFIG.tempSession.session.id;
												CONFIG.ows.getWMSCapabilities({
													namespace: workspace,
													layerName: layerName,
													callbacks: {
														success: [
															function (args) {
																CONFIG.ui.showAlert({
																	message: 'Upload Successful',
																	caller: Shorelines,
																	displayTime: 3000,
																	style: {
																		classes: ['alert-success']
																	}
																});
																CONFIG.tempSession.updateLayersFromWMS(args);
																CONFIG.ui.populateFeaturesList({
																	caller: Shorelines
																});

																$('a[href="#shorelines-view-tab"]').tab('show');
																$('#shorelines-list').val(workspace + ':' + layerName).trigger('change');
															}
														]
													}
												});
											},
											error: function () {
												Shorelines.removeResource();
												CONFIG.ui.showAlert({
													message: 'There was an error performing a shoreline import - Check Logs',
													caller: Shorelines,
													displayTime: 7000,
													style: {
														classes: ['alert-error']
													}
												});
											}
										});
									};

									if (!foundAllRequiredColumns) {
										CONFIG.ui.buildColumnMatchingModalWindow({
											layerName: token,
											columns: layerColumns,
											caller: Shorelines,
											template: Shorelines.columnMatchingTemplate,
											continueCallback: function () {
												doUpload();
											},
											updateCallback: function () {
												doUpload();
											},
											cancelCallback: function () {
												// Call to delete the stored file
												// on the back-end via its token
												$.ajax(Shorelines.uploadRequest.endpoint + '?' + $.param({action: "delete-token", token: token}), {
													type: 'DELETE'
												});
											}
										});
									} else {
										// Ready to add to map
										doUpload();
									}
								}
							}
						},
						error: function () {
							Shorelines.removeResource();
							CONFIG.ui.showAlert({
								message: 'There was an error performing a shoreline upload - Check Logs',
								caller: Shorelines,
								displayTime: 7000,
								style: {
									classes: ['alert-error']
								}
							});
						}
					}
				});
			} else {
				var exception = responseJSON.exception;
				LOG.warn('UI.js::Uploader Error Callback: Import incomplete.');
				Shorelines.removeResource();
				CONFIG.ui.showAlert({
					message: 'Import incomplete. ' + (exception ? exception : ''),
					caller: Shorelines,
					displayTime: 3000,
					style: {
						classes: ['alert-error']
					}
				});
			}
		}
	},
	getShorelineHeaderColumnNames: function (args) {
		args = args || {};
		var token = args.token,
			callbacks = args.callbacks || {
				success: function () {
				},
				error: function () {
				}
			};

		$.ajax(Shorelines.uploadRequest.endpoint, {
			'data': {
				'action': 'read-dbf',
				'token': token
			},
			success: callbacks.success,
			error: callbacks.error
		});
	}
};
