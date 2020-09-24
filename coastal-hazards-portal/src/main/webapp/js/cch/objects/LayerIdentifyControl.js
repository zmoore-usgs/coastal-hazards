/*jslint browser: true */
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global OpenLayers*/
CCH.Objects.LayerIdentifyControl = OpenLayers.Class(OpenLayers.Control.WMSGetFeatureInfo, 
(function(){
	/**
	 * If the features are from a vector data source, return 'attrName', 
	 * else if the features are from a raster source, override them with the
	 * only attribute name that GeoServer 2.4 supports for raster layers.
	 * 
	 * @param {Array<Object>} features
	 * @param {String} attrName
	 * @returns {String} attribute name
	 */
	var overrideAttributeName = function(features, attrName){
		var GRAY_INDEX = 'GRAY_INDEX';
		var overrideName = attrName;
		if(features.length){
			var firstFeature = features[0];
			if('object' === typeof firstFeature && null !== firstFeature){
				if(1 === Object.keys(firstFeature).length && undefined !== firstFeature[GRAY_INDEX]){
					overrideName = GRAY_INDEX;
				}
			}
		}
		return overrideName;
	};	
	/**
	 * 
	 * @param {Array<Object>} bins
	 * @param {Number} attrAvg
	 * @returns {String} css-compatible color
	 */
	var getBinColorForValue = function(bins, attrAvg){
		var color = '',
			binIdx,
			lb,
			ub;
		for (binIdx = 0; binIdx < bins.length && !color; binIdx++) {
			lb = bins[binIdx].lowerBound;
			ub = bins[binIdx].upperBound;
			if (lb !== undefined && ub !== undefined) {
				if (attrAvg <= ub && attrAvg >= lb) {
					color = bins[binIdx].color;
				}
			} else if (lb === undefined && ub !== undefined) {
				if (attrAvg < ub) {
					color = bins[binIdx].color;
				}
			} else {
				if (attrAvg > lb) {
					color = bins[binIdx].color;
				}
			}
		}

		return color;
	};
return {
	title: 'identify-control',
	layers: [],
	queryVisible: true,
	output: 'features',
	drillDown: true,
	maxFeatures: 1000,
	infoFormat: 'application/vnd.ogc.gml',
	naAttrText: '--',
	vendorParams: {
		radius: 3
	},
	layerIdClickHandler: function (evt) {
		"use strict";
		var features = evt.features,
			cchLayers,
			layerUrlToId = {},
			ids,
			layerName,
			featuresByName = {},
			featureCount,
			popup,
			popupHtml,
			splitName,
			layerId,
			trimLayerName = function (name) {
				// Names can be:
				// aggregationId_itemId_r_ribbonIndex
				// aggregationId_itemId
				// itemId
				splitName = name.split('_');
				if (splitName.length > 3) {
					return splitName[1];
				} else if (splitName.length > 2) {
					return splitName[0];
				}
				return splitName.slice(-1);
			};

		$(window).trigger('cch.map.control.layerid.responded');

		// I don't roll out of bed before having some features to work with.
		// If I have no features, this means the user clicked in an empty
		// spot
		if (features.length) {
			// Get just the displayed layers on the map 
			cchLayers = CCH.map.getMap().layers.filter(function (l) {
				// Having geoserver as part of the url tells me that it's a
				// CCH layer and not anything else.
				// Even though the control itself filters by visible layer, I
				// have to check for visibility here because of the case where
				// the same layer is in the map a number of times but ribboned
				return l.url && l.url.indexOf('geoserver') > -1 && l.getVisibility();
			});

			// Set up the layer URL to ID lookup table. It is possible that
			// the map contains an aggregation of the same layer over and 
			// over with a different SLD for each layer. In order to handle
			// that, I need to make an array for the layer name (item.id) 
			// to be able to process this going forward
			cchLayers.forEach(function (l) {
				var lName = trimLayerName(l.name);

				if (!layerUrlToId[l.params.LAYERS]) {
					layerUrlToId[l.params.LAYERS] = [];
				}

				layerUrlToId[l.params.LAYERS].push(lName);
				featuresByName[lName] = [];
			});

			// Populate the layers map
			// WARNING: This is a problem. There object of arrays created here 
			// could be massive. The maximum will be the count of layers being 
			// identified multiplied by me.maxFeatures. If max features or the
			// amount of layers gets too high, this could impact performance.
			// This function could probably be rewritten to use only the evt.features
			// array and not have to duplicate it over and over if multiple layers
			// are using the same features
			features.forEach(function (feature) {
				ids = layerUrlToId[feature.gml.featureNSPrefix + ':' + feature.gml.featureType];
				ids.forEach(function (id) {
					featuresByName[id].push(feature.attributes);
				});
			});

			popupHtml = '<div class="col-md-12"><span id="layer-load-id">Loading Information...</span></div>';

			// Create the popup and add it to the map
			popup = new OpenLayers.Popup.FramedCloud('feature-identification-popup',
				CCH.map.getMap().getLonLatFromPixel(evt.xy),
				new OpenLayers.Size(50, 50),
				popupHtml,
				null,
				true,
				null);

			// Close any other layer identification widgets on the map
			CCH.map.removeAllPopups();
			CCH.map.getMap().addPopup(popup, true);
			$('#feature-identification-popup').css('z-index', 9999);

			for (layerName in featuresByName) {
				if (featuresByName.hasOwnProperty(layerName)) {
					layerName = trimLayerName(layerName);
					var layerObject = CCH.map.getMap().getLayersBy('itemid', layerName);
					
					CCH.map.getMap().getLayersBy('itemid', layerName).forEach(function(layer){
					    if(layer.visibility){
						layerObject = layer;
					    }
					});
					var layerIdParts = layerObject.params.SLD.split("/");
					layerId = layerIdParts[layerIdParts.length-1];
					layerId = layerId.substr(0, layerId.indexOf('?')).length > 0 ? layerId.substr(0, layerId.indexOf('?')) : layerId;
					if (featuresByName.hasOwnProperty(layerName)) {
						features = featuresByName[layerName];
						featureCount = features.length;
						if (featureCount) {
							CCH.Util.Util.getSLD({
								itemId: layerId,
								contextPath: CCH.CONFIG.contextPath,
								sldUrl: layerObject.params.SLD,
								context: {
									features: features,
									layerId: layerName,
									evt: evt,
									popup: popup,
									layers: cchLayers,
									naAttrText: this.naAttrText,
									sldResponseHandler: this.sldResponseHandler
								},
								callbacks: {
									success: [function (sld) {
											this.sldResponseHandler({
												sld: sld,
												popup: this.popup,
												features: this.features,
												layers: this.layers,
												layerId: this.layerId
											});
										}],
									error: [
										function () {
											CCH.LOG.warn('Map.js::Could not get SLD information for item ' + layerName);
										}
									]
								}
							});
						}
					}
				}
			}
		}
	},
	sldResponseHandler: function (args) {
		var sld = args.sld,
			popup = args.popup,
			bins = sld.bins,
			units = sld.units,
			layerId = args.layerId,
			item = CCH.items.getById({id: layerId}),
			title = item.summary.legend ? item.summary.legend.title : "",
			features = args.features,
			attr = overrideAttributeName(features, item.attr),
			displayPoints = new Array(),
			displayColors = new Array(),
			displayCategories = new Array(),
			incomingFeatures = args.features,
			layers = args.layers;
		var buildLegend = function (args) {
				args = args || {};
				var openlayersPopupPaddingHeight = 42,
					openlayersPopupPaddingWidth = 42,
					naAttrText = args.naAttrText,
					bins = args.bins,
					displayColors = args.displayColors,
					displayPoints = args.displayPoints,
					displayCategories = args.displayCategories,
					title = args.title,
					popup = args.popup,
					units = args.units,
					layers = args.layers,
					layerId = args.layerId,
					layer = CCH.map.getMap().getLayersBy('itemid', layerId)[0],
					layerIndex = CCH.map.getMap().getLayerIndex(layer),
					$popupHtml = $(popup.contentHTML),
					$tableContainer = $('<div class="popupTableContainer" />'),
					$table = $('<table />').attr('data-attr', layerIndex),
					$titleContainer = $('<td />'),
					$colorContainer = $('<td />'),
					$valueContainer = $('<td />'),
					$legendRow = $('<tr>').addClass('legend-row'),
					item = args.item,
					ribbonIndex = -1,
					layerName = layers.find(function (l) {
						return l.itemid === item.id;
					}).name,
					date,
					dates = [],
					dateKey,
					feature,
					bin,
					yearToColor = {},
					idx = 0,
					width,
					height;
				
				if (layerName.indexOf('_r_') !== -1) {
					var layerParts = layerName.split('_');
					var	layerPart = layerParts[layerParts.length-1];
					ribbonIndex = parseInt(layerPart, 10);
				}

				if (displayPoints.length === 0) {
					$titleContainer.html(title);
					// Data unavailable, insert two dashes for color and for value
					$legendRow.append($titleContainer, $colorContainer.empty().html('--'), $valueContainer.append(naAttrText));
					$table.append($legendRow);
				} else if ('year' === units) {
					// Data is historical, create a year/color table here

					// Create a yearToColor map
					for (idx; idx < bins.length; idx++) {
						bin = bins[idx];
						yearToColor[bin.years] = bin.color;
					}

					// Figure out the date key for this feature set
					dateKey = Object.keys(features[0]).find(function (attr) {
						return attr.toLowerCase().indexOf('date') !== -1;
					});

					// Create an array of dates available
					for (idx = 0; idx < features.length; idx++) {
						feature = features[idx];
						date = feature[dateKey];
						date = parseInt(date.split('/')[2], 10);
						dates.push(date);
					}

					// Reverse sort and de-dupe the dates
					dates = dates.filter(function(item, pos) {
						return dates.indexOf(item) == pos;
					}).sort(function (a, b) {
						return b - a;
					});

					// Create rows for each date
					for (idx = 0; idx < dates.length; idx++) {
						date = dates[idx];
						
						$legendRow =  $('<tr>').addClass('legend-row');
						$titleContainer = $('<td />');
						$colorContainer = $('<td />');
						$valueContainer = $('<td />');
						
						$titleContainer.html(title);
						
						// Create the color container for the year
						$colorContainer.append($('<span />').css('backgroundColor', yearToColor[date]).html('&nbsp;&nbsp;&nbsp;&nbsp;'));
						
						// Create the value container
						$valueContainer.append(date + ' yr');
						
						$legendRow.append($titleContainer, $colorContainer, $valueContainer);
						$table.append($legendRow);
					}
				
				} else {
					//Limit ribbon data to only creating a row for the first features
					if(ribbonIndex >= 0 && displayPoints.length > 0){
						var point = displayPoints[0];
						displayPoints = new Array();
						displayPoints.push(point);
					}
					
					//Create rows for each point to be displayed in this table
					for(i = 0; i < displayPoints.length; i++){
						//Reset Contents
						$legendRow = $('<tr>').addClass('legend-row');
						$titleContainer = $('<td />');
						$colorContainer = $('<td />');
						$valueContainer = $('<td />');
						$titleContainer.html(title);
						var color;
					
						if(!displayColors || !displayColors[i]){
							color = getBinColorForValue(bins, displayPoints[i]);
						} else {
							color = displayColors[i];
						}
						
						$colorContainer.append($('<span />').css('backgroundColor', color).html('&nbsp;&nbsp;&nbsp;&nbsp;'));
						
						//Build the row
						if (displayCategories && displayCategories[i]) {
							$valueContainer.append(displayCategories[i]);
							//don't append units
						} else {
							if (!$.isNumeric(displayPoints[i])) {
								// defensive for toFixed
								$valueContainer.append('');
							} else if ('%' === units) {
								$valueContainer.append(displayPoints[i].toFixed(0));
							} else {
								if (Number.isInteger(displayPoints[i])) {
									if (item.attr === 'UVVR_RASTER'){
										$valueContainer.append(displayPoints[i].toFixed(0)/1000);
									} else if (attr === 'FORECASTPE' || attr === 'FORECAST_U') {
										$valueContainer.append(displayPoints[i].toFixed(0) + "-year");
									} else {
										$valueContainer.append(displayPoints[i].toFixed(0));
									}
								} else if (attr === 'UVVR') {
									//case specific rounding for UVVR
									$valueContainer.append(displayPoints[i].toFixed(3));
								} else {
									$valueContainer.append(displayPoints[i].toFixed(1));
								}
							}
							$valueContainer.append("&nbsp;" + units);
						}
						
						$legendRow.append($titleContainer, $colorContainer, $valueContainer);
						
						//Handle Ribbon Data
						if (ribbonIndex !== -1) {
							// If this is part of a ribboned series, I'm going
							//  to have to sort these rows based on the ribbon
							// index
							$legendRow.attr('id', 'legend-row-' + ribbonIndex);
							var sortedRows;

							$table.append($legendRow);
							sortedRows = $table.find('tbody > tr').toArray().sort(function (a, b) {
								var aParts = $(a).attr('id').split('-'),
									aPart = aParts[aParts.length-1],
									aVal = parseInt(aPart, 10),
									bParts = $(b).attr('id').split('-'),
									bPart = bParts[bParts.length-1],
									bVal = parseInt(bPart, 10);

								if(aVal < bVal) {
									return -1;
								} else if(aVal > bVal) {
									return 1;
								} else {
									return 0;
								}
							});
							$table.empty().append(sortedRows);
						} else {
							$table.append($legendRow);
						}
					}
				}

				$popupHtml.find('#layer-load-id').remove();
				CCH.map.getMap().getLayerIndex(CCH.map.getMap().getLayersBy('itemid', layerId)[0]);
				$popupHtml.append($table);
				
				var tables = $popupHtml.find('table').toArray().sort(function (a,b) {
					var aVal = parseInt($(a).attr('data-attr'));
					var bVal = parseInt($(b).attr('data-attr'));
					
					if(aVal < bVal) {
						return -1;
					} else if(aVal > bVal) {
						return 1;
					} else {
						return 0;
					}
				});
				tables.forEach(function (tbl, ind) {
					var $tbl = $(tbl);
					if (ind === 0) {
						if ($tbl.find('thead').length === 0) {
							$tbl.prepend($('<thead />').append(
								$('<tr />').append(
								$('<td />').html('Layer'),
								$('<td />').html('Color'),
								$('<td />').html('Value')
								)));
						}
					} else {
						$tbl.find('thead').remove();
					}
				});
				
				$tableContainer.append(tables);
								
				$popupHtml.empty().append($tableContainer);
								
				if(displayPoints.length > 1 || CCH.map.getMap().getZoom() < 12){
					var $noteContainer = $('<small id="zoomNotice">Zoom in further for more accurate results.</small>').css('color', 'black');
					$popupHtml.append($noteContainer);
				}
				
				popup.setContentHTML($popupHtml.clone().wrap('<div/>').parent().html());
				width = function () {
					var cWidth = 0,
						maxWidth = Math.round($('#map').width() / 2);

					$('#feature-identification-popup div.col-md-12 > .popupTableContainer > table').each(function (ind, table) {
						cWidth = $(table).width() > cWidth ? $(table).width() : cWidth;
					});

					if (cWidth > maxWidth) {
						cWidth = maxWidth;
					}

					return cWidth + 5;
				};
				height = function () {
					var cHeight = 0,
						maxHeight = Math.round($('#map').height() / 2);
					$('#feature-identification-popup div.col-md-12 > .popupTableContainer > table tr').each(function (ind, item) {
						cHeight += $(item).height();
					});
					
					$('#zoomNotice').each(function(ind, item) {
						cHeight += $(item).height();
					});
					
					if (cHeight > maxHeight) {
						cHeight = maxHeight;
					}
					return Math.round(cHeight);
				};
				popup.setSize(new OpenLayers.Size(width() + openlayersPopupPaddingWidth, height() + openlayersPopupPaddingHeight));
				popup.panIntoView();
				$(window).on('cch.ui.redimensioned', function () {
					popup.setSize(new OpenLayers.Size(width(), height()));
					popup.panIntoView();
				});
			},
			isMissing = function(val) {
				return isNaN(val) || val === -999 || (val ===  65535 && val % 1 === 0);
			};

		if (item.type.toLowerCase() === 'vulnerability' ||
			item.type.toLowerCase() === 'storms' ||
			item.type.toLowerCase() === 'historical') {
			
			//Get the first 3 values to display
			for(var i = 0; i < incomingFeatures.length; i++){
				var pFl = parseFloat(incomingFeatures[i][attr]);
				
				//Don't display the point if it is missing the display column
				if(!isMissing(pFl)){
					displayPoints.push(pFl);
					
					//If we have added a 3rd value stop trying to add more
					if(displayPoints.length === 3){
						break;
					}
				}
			}
		}
		
		if (["TIDERISK", "SLOPERISK", "ERRRISK", "SLRISK", "GEOM", "WAVERISK", "CVIRISK", "AE", "FL_MASK_ID"].indexOf(item.attr.toUpperCase()) !== -1) {
			for(var i = 0; i < displayPoints.length; i++){
				displayColors.push(sld.bins[Math.ceil(displayPoints[i]) - 1].color);

				var category = sld.bins[Math.ceil(displayPoints[i]) - 1].category;
				
				if("AE" === item.attr.toUpperCase()){
					category += "&nbsp;" + units;
				} else if("FLOODMASK" === item.attr.toUpperCase()) {
					category = units + "&nbsp;" + category;
				}
				
				displayCategories.push(category);
			}	
		}

		buildLegend({
			bins: bins,
			title: title,
			features: incomingFeatures,
			displayColors: displayColors,
			displayPoints: displayPoints,
			displayCategories: displayCategories,
			item: item,
			popup: popup,
			units: units,
			layers: layers,
			layerId: layerId,
			naAttrText: this.naAttrText
		});
	},
	initialize: function (options) {
		"use strict";
		options = options || {};
		options.handlerOptions = options.handlerOptions || {};

		OpenLayers.Control.WMSGetFeatureInfo.prototype.initialize.apply(this, [options]);

		this.events.register("getfeatureinfo", this, this.layerIdClickHandler);
	},
	CLASS_NAME: "OpenLayers.Control.WMSGetFeatureInfo"
}
}()));
