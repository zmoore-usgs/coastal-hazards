/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/

window.CCH = CCH || {};
CCH.Objects = CCH.Objects || {};
CCH.Objects.Widget = CCH.Objects.Widget || {};
CCH.Objects.Widget.Legend = function (args) {
	"use strict";
	var me = (this === window) ? {} : this;

	$.extend(true, me, args);
	me.errorMessage = 'Legend.js:: %s Legend could not be created.';
	me.$container = null;
	me.$legendDiv = $('<div />');
	me.items = [];
	me.itemTypes = new CCH.Objects.Items().Types;
	me.owsUtils = new CCH.Util.OWS();

	me.init = function () {
		CCH.LOG.info('Legend.js::constructor:Legend class is initializing.');
		var childItems = [],
			legendTables = [];

		me.$container = $('#' + me.containerId);

		if (me.$container.length === 0) {
			throw me.errorMessage.replace('%s', 'containerId  "' + me.containerId + '" not found in document.');
		}

		// Fill out the items array with the item ids of the items that will end up in the legend
		if (me.item.itemType.toLowerCase() === 'aggregation') {
			childItems = me.item.getLayerList();
			childItems.layers.each(function (childItem) {
				// Possible formats:
				// aggregationId_itemId_r_ribbonIndexInteger (Ribboned, example: C68abcd_C67pzz9_r_1)
				// aggregationId_itemId (Unribboned, example: C68abcd_C67pzz9)
				me.items.push(childItem.split('_')[1]);
			});
		} else {
			me.items.push(me.item.id);
		}

		// Now that I have all of the necessary items that I will be creating the legend from, I need the SLDs 
		// associated with them
		me.items.each(function (childId, index, items) {
			CCH.LOG.debug("Requesting SLD " + index);
			CCH.Util.Util.getSLD({
				contextPath: CCH.CONFIG.contextPath,
				itemId: childId,
				context: {
					index: index,
					items: items,
					legendTables: legendTables,
					itemId: childId
				},
				callbacks: {
					success: [
						function (sld) {
							var $legendTable,
								index = this.index,
								items = this.items,
								itemId = this.itemId,
								legendTables = this.legendTables,
								item = CCH.items.getById({id: itemId}),
								total = items.length,
								nonYearHistoricalAttributes = ["LRR", "WLR", "SCE", "NSM", "EPR"];

							CCH.LOG.debug("Got SLD " + index);

							// Test the item type/attribtue. If the type is historical and the attribute is not 
							// a date type, secondary calls need not be made. Otherwise, there will need 
							// to be a series of async calls to get WFS data so the method to make the table
							// differs
							if (item.type.toLowerCase() === me.itemTypes.HISTORICAL &&
								nonYearHistoricalAttributes.indexOf(item.attr.toUpperCase()) === -1) {
								me.generateDateLegendTable({
									item: item,
									sld: sld,
									total: total,
									index: index,
									legendTables: legendTables
								});
							} else {
								try {
									// Build the table and add a custom attribute to it that serves to sort the 
									// table in the legend when all legends are created
									$legendTable = me.generateLegendTable({
										sld: sld,
										itemId: itemId,
										index: index
									});
								} catch (ex) {
									LOG.warn(ex);
								}

								if ($legendTable) {
									this.legendTables.push($legendTable);
									me.tableAdded({
										legendTables: this.legendTables,
										total: total
									});
								}
							}
						}
					],
					error: [
						function (jqXHR, textStatus, errorThrown) {
							LOG.warn("Could not retrieve SLD. Legend will not be created for this item");
							this.legendTables.push(-1);
							me.tableAdded({
								legendTables: this.legendTables,
								total : this.total
							})
							if (me.onError) {
								me.onError.call(me, arguments);
							}
						}
					]
				}
			});
		});

		return me;
	};

	me.generateLegendTable = function (args) {
		args = args || {};

		var itemType,
			item,
			$legend,
			fName = 'Legend.js::generateLegend: ',
			index = args.index;


		if (!args.sld) {
			throw fName + "Missing SLD";
		}
		if (!args.itemId) {
			throw fName + "Missing ItemID";
		}

		item = CCH.items.getById({id: args.itemId});

		if (!item) {
			throw fName + "Item " + args.itemId + " not found";
		}

		itemType = item.type;
		if (itemType === me.itemTypes.HISTORICAL) {
			$legend = me.generateHistoricalLegendTable({
				sld: args.sld,
				item: item,
				index: index
			});
		} else if (itemType === me.itemTypes.STORMS) {
			$legend = me.generateStormLegendTable({
				sld: args.sld,
				item: item,
				index: index
			});
		} else if (itemType === me.itemTypes.VULNERABILITY) {
			$legend = me.generateVulnerabilityLegendTable({
				sld: args.sld,
				item: item,
				index: index
			});
		}

		return $legend;

	};

	me.generateGenericLegendTable = function (args) {
		args = args || {};
		var sld = args.sld,
			$table = $('<table />'),
			$thead = $('<thead />'),
			$caption = $('<caption />'),
			$theadTr = $('<tr />'),
			$theadUOM = $('<td />'),
			$colorContainer,
			$tr,
			$colorTd,
			$rangeTd,
			bins = sld.bins,
			uom = sld.units || '',
			title = sld.title || '',
			upperBound,
			lowerBound,
			category,
			color,
			range;

		// Create the table head which displays the unit of measurements
		$caption.html(title);
		$theadUOM.html(uom);
		$theadTr.append($('<td />'), $theadUOM);
		$thead.append($caption, $theadTr);
		$table.append($thead);

		bins.each(function (bin) {
			$tr = $('<tr />');
			$colorTd = $('<td />');
			$rangeTd = $('<td />');
			$colorContainer = $('<span />');
			upperBound = bin.upperBound;
			lowerBound = bin.lowerBound;
			category = bin.category;
			color = bin.color;
			range;

			if (bin.category) {
				range = category;
			} else {
				range = me.generateRangeString(upperBound, lowerBound);
			}

			$colorContainer.css('background-color', color);
			$colorTd.append($colorContainer);

			$rangeTd.html(range);

			$tr.append($colorTd, $rangeTd);
			$table.append($tr);
		});

		return $table;
	};
	me.wfsCount = 0;
	me.generateDateLegendTable = function (args) {
		args = args || {};

		var item = args.item,
			sld = args.sld,
			attrArr = [item.attr],
			total = args.total,
			index = args.index,
			legendTables = args.legendTables,
			wmsService = item.services.find(function (svc) {
				return svc.type === 'proxy_wms';
			}),
			layerName = wmsService.serviceParameter;

		CCH.LOG.debug("Requesting WFS " + ++this.wfsCount);

		// In order to build the legend, I am going to need year data
		me.owsUtils.getFilteredFeature({
			layerName: layerName,
			propertyArray: attrArr,
			scope: {
				item: item,
				sld: sld,
				total: total,
				index: index,
				legendTables: legendTables,
				wfsCount: new Number(this.wfsCount)
			},
			callbacks: {
				success: [
					function (features) {
						CCH.LOG.debug("Got WFS: " + this.wfsCount);
						var $legendTable = me.generateHistoricalLegendTable({
							features: features,
							sld: this.sld,
							item: this.item,
							index: this.index
						});
						
						this.legendTables.push($legendTable);
						me.tableAdded({
							legendTables: this.legendTables,
							total: this.total
						});
					}
				],
				error: [
					function (data, textStatus) {
						LOG.warn(textStatus);
						this.legendTables.push(-1);
						me.tableAdded({
							legendTables: this.legendTables,
							total: this.total
						});
					}
				]
			}
		});
	};

	me.generateHistoricalLegendTable = function (args) {
		args = args || {};
		var sld = args.sld,
			item = args.item,
			attr = item.attr,
			index = args.index,
			features = args.features,
			feature,
			date,
			shortenedDate,
			yearlySld = {},
			$legendTable;

		if (["LRR", "WLR", "SCE", "NSM", "EPR"].indexOf(attr.toUpperCase()) !== -1) {
			$legendTable = me.generateGenericLegendTable({
				sld: sld
			});
			$legendTable.attr({
				'legend-attribute': attr,
				'legend-index': index
			});
		} else {
			// Take the years from the returned features and merge them with the provided SLD into a new SLD
			// that I can then pass to the generic SLD creation function
			yearlySld = {
				title: sld.title,
				units: sld.units,
				style: sld.style,
				bins: []
			};

			for (var fIdx = 0; fIdx < features.length; fIdx++) {
				feature = features[fIdx];
				date = feature.data[item.attr].split('/')[2];

				// Years in the sld bins are integers, so convert the output here to integers. This is probably
				// a performance hit. Might be faster to go through all of the bins in the sld and convert those
				// to string? Though that would have to be done using nested for loops :/
				if (date[2] === '0') {
					shortenedDate = parseInt(date.substring(3));
				} else {
					shortenedDate = parseInt(date.substring(2));
				}

				yearlySld.bins.push({
					category: date,
					color: sld.bins.find(function (bin) {
						return bin.years.indexOf(shortenedDate) !== -1;
					}).color
				});
			}
			$legendTable = me.generateGenericLegendTable({
				sld: yearlySld
			});
		}
		return $legendTable;

	};

	me.generateStormLegendTable = function (args) {
		args = args || {};
		var sld = args.sld,
			item = args.item,
			index = args.index,
			attr = item.attr,
			$legendTable = me.generateGenericLegendTable({
				sld: sld
			});
		$legendTable.attr({
			'legend-attribute': attr,
			'legend-index': index
		});
		return $legendTable;
	};

	me.generateVulnerabilityLegendTable = function (args) {
		args = args || {};
		var sld = args.sld,
			item = args.item,
			index = args.index,
			attr = item.attr,
			$legendTable = me.generateGenericLegendTable({
				sld: sld
			});
		$legendTable.attr({
			'legend-attribute': attr,
			'legend-index': index
		});
		return $legendTable;
	};

	me.generateRangeString = function (ub, lb) {
		if (lb && ub) {
			return lb + ' to ' + ub;
		} else if (lb && !ub) {
			return '> ' + lb;
		} else if (!lb && ub) {
			return '< ' + ub;
		}
		return '';
	};

	me.tableAdded = function (args) {
		args = args || {};

		var total = args.total,
			legendTables = args.legendTables,
			isYearLegend,
			tIdx = 0,
			$table,
			rowArray,
			yearRows = [];
		
		// When all the tables are created, I want to sort them, append them to a  wrapper and throw that wrapper 
		// into the final container
		if (legendTables.length === total) {
			// Figure out whether or not the table is a yearly table. If so, I won't unique it based on legend attribute
			isYearLegend = legendTables.first().find('thead tr:nth-child(2) > td:last-child').html().toLowerCase() === 'year';
			
			if (isYearLegend) {
				// Because this is an array of tables for a list of years, I'd like to combine them all into a single table
				// and put the result into the legend
				for (var tIdx;tIdx < legendTables.length;tIdx++) {
					$table = $(legendTables[tIdx]);
					// Get every row from the table that is now the first row (the THEAD row)
					rowArray = $table.
						find('tr'). // Find all the rows in this table
						toArray(). // Get a js array out of the jQuery object returned by find
						slice(1); // Chop off the first row (which is the header row) 

					yearRows = yearRows.concat(rowArray);
					yearRows = yearRows.unique(function (tr) { // Cut down the array only to unique rows
						return $(tr).html();
					});
				}
				
				// Now that I have all of my year rows, sort them descending by year
				yearRows = yearRows.sortBy(function (tr) {
					return $(tr).find('td:nth-child(2)').html();
				}, true);
				
				// Re-create the legend table
				legendTables = $('<table />').append(yearRows);
			} else {
				// There are no more legends to be built, filter and add the legend to the document
				legendTables = legendTables.unique(function (table) {
					return $(table).attr('legend-attribute');
				});

				if (legendTables.length === 1) {
					// If there's only one table, replace the caption with the title of its 
					// ancestor. Otherwise, we just have the title of the last child to 
					// make it through unique()
					legendTables[0].find('caption').html(item.getAncestor().summary.full.title);
				} else {
					// If there's multiple tables, sort them according to index, leaving
					// titles as is
					legendTables = legendTables.sort(function (a, b) {
						return $(a).attr('legend-index') - $(b).attr('legend-index');
					});
				}
			}


			me.$legendDiv.append(legendTables);
			me.$container.append(me.$legendDiv);

			if (me.onComplete) {
				me.onComplete.call(me);
			}
		}
	};

	// Verify that everything we need was passed in and create the item. Otherwise, error out.
	if (!me.containerId) {
		throw me.errorMessage.replace('%s', 'Argument "containerId" was not provided.');
	} else if (!me.item) {
		throw me.errorMessage.replace('%s', 'Argument "item" was not provided.');
	} else {
		return {
			init: me.init
		};
	}
};
