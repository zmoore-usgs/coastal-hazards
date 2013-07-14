CCH.Util = {
	/** 
	 * Creates a legend for display in the info page
	 */
	buildLegend: function(args) {
		args = args || {};
		var sld = args.sld;
		if (!sld) {
			return null;
		}
		var type = args.type;
		var legendDiv = $('<div />').attr({'id': 'cch-ui-legend-div'});
		var legendTable = $('<table />').attr({'id': 'cch-ui-legend-table'}).addClass('table table-bordered table-hover');
		var legendTableCaption = $('<caption />').attr({'id': 'cch-ui-legend-table-caption'}).html(sld.title);
		var legendTableHead = $('<thead />').append(
				$('<tr />').append(
				$('<th />').attr({'scope': 'col'}), $('<th />').attr({'scope': 'col'}).html(sld.units)
				));
		var legendTableBody = $('<tbody />');

		var buildVanillaLegend = function() {
			for (var bInd = 0; bInd < sld.bins.length; bInd++) {
				var ub = sld.bins[bInd].upperBound;
				var lb = sld.bins[bInd].lowerBound;
				var range = function(ub, lb) {
					if (lb && ub) {
						return lb + ' to ' + ub;
					} else if (lb && !ub) {
						return '> ' + lb;
					} else if (!lb && ub) {
						return '< ' + ub;
					}
				}(ub, lb)
				var legendTableBodyTr = $('<tr />');
				var legendTableBodyTdColor = $('<td />').addClass('cch-ui-legend-table-body-td-color').append(
						$('<div />').addClass('cch-ui-legend-table-body-div-color').css('background-color', sld.bins[bInd].color).html('&nbsp;'));
				var legendTableBodyTdRange = $('<td />').addClass('cch-ui-legend-table-body-td-range').append(
						$('<div />').addClass('cch-ui-legend-table-body-div-range').html(range));
				legendTableBody.append(
						legendTableBodyTr.append(legendTableBodyTdColor, legendTableBodyTdRange));
			}
		}

		if (type === 'historical') {
			if (args.attr === 'rates') {
				buildVanillaLegend();
			} else {
				var features = args.features;

				var years = features.map(function(f) {
					return f.data[CCH.CONFIG.item.attr].split('/')[2];
				}).unique().sort().reverse();

				// Create a proper map to quickly look years up against
				var yearToColor = {};
				for (var bInd = 0; bInd < sld.bins.length; bInd++) {
					sld.bins[bInd].years = sld.bins[bInd].years.map(function(y) {
						return y < 10 ? '0' + y : '' + y;
					});
					for (var yInd = 0; yInd < 3; yInd++) {
						var year = sld.bins[bInd].years[yInd];
						// The tail end of the sld.bins doesn't have 3 indexes so check
						if (year) {
							yearToColor[year] = sld.bins[bInd].color;
						}
					}
				}

				for (var yInd = 0; yInd < years.length; yInd++) {
					var legendTableBodyTr = $('<tr />');
					var legendTableBodyTdColor = $('<td />').addClass('cch-ui-legend-table-body-td-color').append(
							$('<div />').addClass('cch-ui-legend-table-body-div-color').css('background-color', yearToColor[years[yInd].substr(2)]).html('&nbsp;'));
					var valueContainer = $('<div />').addClass('cch-ui-legend-table-body-div-year').html(years[yInd]);
					var viewButton = $('<button />').attr({
						'cch-year': years[yInd],
						'data-toggle': 'button'
					}).
							addClass('btn btn-small pull-right cch-ui-legend-table-body-div-year-toggle').
							append($('<i />').addClass('icon-eye-open')).
							on({
						'click': function(evt) {
							setTimeout(function() {
								var years = $('.cch-ui-legend-table-body-div-year-toggle').map(function(idx, btn) {
									var year = $(btn).attr('cch-year');
									if ($(btn).hasClass('active')) {
										return year;
									} else {
										return null;
									}
								});

								var layer = CCH.CONFIG.map.getLayersBy('type', 'cch-layer')[0];
								if (years.length) {
									var filters = [];

									years.each(function(ind, year) {
										filters.push(new OpenLayers.Filter.Comparison({
											type: OpenLayers.Filter.Comparison.LIKE,
											property: CCH.CONFIG.item.attr,
											value: '*' + year
										}));
									});

									var filter = new OpenLayers.Filter.Logical({
										type: OpenLayers.Filter.Logical.AND,
										filters: filters
									});
									var filterObj = new OpenLayers.Format.Filter({version: "1.1.0"});
									var xml = new OpenLayers.Format.XML();
									var filterData = xml.write(filterObj.write(filter));
									layer.mergeNewParams({
										filter : filterData
									}, true);
								} else {
									layer.mergeNewParams({
										filter : null
									}, true);
									layer.redraw(true);
								}

							}, 100);
						}
					});
					valueContainer.append(viewButton);
					var legendTableBodyTdYear = $('<td />').addClass('cch-ui-legend-table-body-td-year').append(valueContainer);
					legendTableBody.append(legendTableBodyTr.append(legendTableBodyTdColor, legendTableBodyTdYear));
				}
			}

		} else if (type === 'storms') {
			buildVanillaLegend();
		} else if (type === 'vulnerability') {
			if (["TIDERISK", "SLOPERISK", "ERRRISK", "SLRISK", "GEOM", "WAVERISK", "CVIRISK"].indexOf(args.attr.toUpperCase()) !== -1) {
				// Old school CVI
				for (var bInd = 0; bInd < sld.bins.length; bInd++) {
					var category = sld.bins[bInd].category;
					var legendTableBodyTr = $('<tr />');
					var legendTableBodyTdColor = $('<td />').addClass('cch-ui-legend-table-body-td-color').append(
							$('<div />').addClass('cch-ui-legend-table-body-div-color').css('background-color', sld.bins[bInd].color).html('&nbsp;'));
					var legendTableBodyTdRange = $('<td />').addClass('cch-ui-legend-table-body-td-range').append(
							$('<div />').addClass('cch-ui-legend-table-body-div-range').html(category));
					legendTableBody.append(
							legendTableBodyTr.append(legendTableBodyTdColor, legendTableBodyTdRange));
				}
			} else {
				// Bayesian
				buildVanillaLegend();
			}
		}

		legendDiv.append(legendTable.append(
				legendTableCaption,
				legendTableHead,
				legendTableBody
				));

		return legendDiv;
	},
	getSLD: function(args) {
		args = args || {};
		args.callbacks = args.callbacks || {};
		args.callbacks.success = args.callbacks.success || [];
		args.callbacks.error = args.callbacks.error || [];
		$.ajax({
			url: args.contextPath + '/data/sld/' + args.itemId,
			headers: {
				'Accept': "application/json; charset=utf-8",
				'Content-Type': "application/json; charset=utf-8"
			},
			dataType: 'json',
			success: function(data, status, jqXHR) {
				args.callbacks.success.each(function(cb) {
					cb.apply(this, [data, status, jqXHR]);
				});
			},
			error: function(jqXHR, textStatus, errorThrown) {
				args.callbacks.error.each(function(cb) {
					cb.apply(this, [jqXHR, textStatus, errorThrown]);
				});
			}
		});
	},
	updateItemPopularity: function(args) {
		args = args || {};
		var contextPath = args.contextPath;
		var itemId = args.item || '';
		var useType = args.type || '';

		if (!contextPath && CCH && CCH.CONFIG) {
			contextPath = CCH.CONFIG.contextPath;
		}
		if (itemId &&
				(useType.toLowerCase() === 'tweet'
						|| useType.toLowerCase() === 'use'
						|| useType.toLowerCase() === 'publish'
						|| useType.toLowerCase() === 'insert'
						)) {
			$.ajax({
				url: contextPath + '/data/activity/' + useType.toLowerCase() + '/' + itemId,
				type: 'PUT'
			});
		}
	},
	getMinifiedEndpoint: function(args) {
		var contextPath = args.contextPath;
		var location = args.location || window.location.href;
		var callbacks = args.callbacks || {
			success: [],
			error: []
		};

		$.ajax(contextPath + '/data/minifier/minify/' + location, {
			type: 'GET',
			dataType: 'json',
			success: function(json, textStatus, jqXHR) {
				if (callbacks.success && callbacks.success.length > 0) {
					callbacks.success.each(function(callback) {
						callback.call(null, json, textStatus, jqXHR);
					});
				}
			},
			error: function(data, textStatus, jqXHR) {
				if (callbacks.error && callbacks.error.length > 0) {
					callbacks.error.each(function(callback) {
						callback.call(null, data, textStatus, jqXHR);
					});
				}
			}
		});

	}
}