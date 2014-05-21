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
	// If available, this class is added to $legendDiv
	me.legendClass = args.legendClass;
	// I keep track of ongoing ajax requests. When I destroy this object
	me.ajaxRequests = [];
	// A flag that informs any ongoing processes in this object whether or not the object has already been destroyed.
	// There are edge cases where the application may not want the ajax calls from this object to complete and if
	// this gets flipped to true, I want to stop all processes as soon as possible
	me.destroyed = false;

	me.init = function () {
		CCH.LOG.trace('Legend.js::constructor:Legend class is initializing.');
		var childItems = [],
			legendTables = [],
			attribute,
			nonAggItem,
			itemId = me.item.id,
			request;

		me.$container = $('#' + me.containerId);

		if (me.$container.length === 0) {
			throw me.errorMessage.replace('%s', 'containerId  "' + me.containerId + '" not found in document.');
		}

		if (me.legendClass) {
			me.$legendDiv.addClass(me.legendClass);
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
			me.items.push(itemId);
		}

		// I branch on the type of item that I am trying to display
		nonAggItem = me.items.find(function (id) {
			return CCH.items.getById({id: id}).itemType.toLowerCase() !== 'aggregation';
		});
		// The above function gets us an id string. Now I need to pull out the item from CCH.items
		nonAggItem = CCH.items.getById({id: nonAggItem});
		attribute = nonAggItem.attr;

		// Now that I have all of the necessary items that I will be creating the legend from, I need the SLDs 
		// associated with them
		me.items.each(function (childId, index, items) {
			if (!me.destroyed) {
				request = CCH.Util.Util.getSLD({
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
									total = items.length;

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
										total: total,
										item: CCH.items.getById({id: itemId})
									});
								} else {
									this.legendTables.push(-1);
									me.tableAdded({
										legendTables: this.legendTables,
										total: this.total
									});
								}
							}
						],
						error: [
							function (jqXHR, textStatus, errorThrown) {
								if (!me.destroyed) {
									LOG.warn("Could not retrieve SLD. Legend will not be created for this item");
									this.legendTables.push(-1);
									me.tableAdded({
										legendTables: this.legendTables,
										total: this.total
									});
									if (me.onError) {
										me.onError.call(me, arguments);
									}
								}
							}
						]
					}
				});
				me.ajaxRequests.push(request);
			}
		});
		return me;
	};

	me.destroy = function () {
		me.destroyed = true;
		me.ajaxRequests.each(function (req) {
			req.abort();
		});
		me.$legendDiv.remove();
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
			years,
			color,
			range;

		// Create the table head which displays the unit of measurements
		$caption.html(title);
		$theadUOM.html(uom);
		$theadTr.append($('<td />'), $theadUOM);
		$thead.append($theadTr);
		$table.append($caption, $thead);

		bins.each(function (bin) {
			$tr = $('<tr />');
			$colorTd = $('<td />');
			$rangeTd = $('<td />');
			$colorContainer = $('<span />');
			upperBound = bin.upperBound;
			lowerBound = bin.lowerBound;
			years = bin.years;
			category = bin.category;
			color = bin.color;
			range;

			if (bin.category) {
				range = category;
			} else if (bin.years) {
				range = years;
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

	me.generateHistoricalLegendTable = function (args) {
		args = args || {};
		var sld = args.sld,
			item = args.item,
			attr = item.attr,
			index = args.index || null,
			$legendTable,
			$legendTableTBody,
			$yearRows;

		$legendTable = me.generateGenericLegendTable({
			sld: sld
		});

		$legendTable.attr({
			'legend-attribute': attr,
			'legend-index': index
		});

		// If the table is a date table, I want to sort it by year in descending order
		if ('year' === sld.units) {
			$legendTableTBody = $legendTable.find('tbody');
			$yearRows = $legendTableTBody.find('tr').toArray();
			$yearRows = $yearRows.sortBy(function (r) {
				return parseInt($(r).find('td:nth-child(2)').html(), 10);
			}).reverse();
			$legendTableTBody.empty().append($yearRows);
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
			item = args.item || null;

		if (legendTables.length === total) {
			// When all the tables are created, I want to sort them, append them to a  wrapper and throw that wrapper 
			// into the final container
			// There are no more legends to be built, filter and add the legend to the document
			legendTables = legendTables.unique(function (table) {
				return $(table).attr('legend-attribute');
			}).filter(function (table) { // Remove any array items that are -1
				return table !== -1;
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


			me.$legendDiv.append(legendTables);
			me.$container.append(me.$legendDiv);

			if (me.onComplete) {
				me.onComplete.call(me);
			}
		}
	};

	/**
	 * Hides the legend div
	 * 
	 * @returns {$} the jQuery dom container for this legend
	 */
	me.hide = function () {
		me.$legendDiv.addClass('hidden');
		return me.$legendDiv;
	};

	/**
	 * Shows the legend div
	 * 
	 * @returns {$} the jQuery dom container for this legend
	 */
	me.show = function () {
		me.$legendDiv.removeClass('hidden');
		return me.$legendDiv;
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
