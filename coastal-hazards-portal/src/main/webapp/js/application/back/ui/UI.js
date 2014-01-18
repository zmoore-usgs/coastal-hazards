/*jslint browser: true */
/*jslint plusplus: true */
/*global $ */
/*global CCH */
/*global OpenLayers */
CCH.Objects.UI = function () {
    "use strict";
    CCH.LOG.info('UI.js::constructor: UI class is initializing.');

    var me = (this === window) ? {} : this;

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
            legendDiv = $('<div />').attr({'id': 'cch-ui-legend-div'}),
            legendTable = $('<table />').attr({'id': 'cch-ui-legend-table'}).addClass('table table-bordered table-hover'),
            legendTableCaption = $('<caption />').attr({'id': 'cch-ui-legend-table-caption'}).html(sld.title),
            legendTableHead = $('<thead />').append(
                $('<tr />').append(
                    $('<th />').attr({'scope': 'col'}),
                    $('<th />').attr({'scope': 'col'}).html(sld.units)
                )
            ),
            legendTableBody = $('<tbody />'),
            legendTableBodyTr,
            legendTableBodyTdColor,
            legendTableBodyTdRange,
            legendTableBodyTdButton,
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
                    legendTableBody.append(
                        legendTableBodyTr.append(
                            legendTableBodyTdColor,
                            legendTableBodyTdRange
                        )
                    );
                }
            },
            layer,
            ns,
            name,
            ratesAttributes,
            viewButton,
            year,
            years,
            yearToColor,
            yInd,
            createYearLookupMap = function (y) {
                return y < 10 ? '0' + y : String + y;
            };

        if (type === 'historical') {
            ratesAttributes = ["LRR", "WLR", "SCE", "NSM", "EPR"];
            if (ratesAttributes.indexOf(args.attr.toUpperCase()) !== -1) {
                buildVanillaLegend();
            } else {
                years = args.features.map(function (f) {
                    return f.data[CCH.CONFIG.item.attr].split('/')[2];
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
                    legendTableBodyTr = $('<tr />');
                    legendTableBodyTdColor = $('<td />').
                            addClass('cch-ui-legend-table-body-td-color').
                            append(
                            $('<div />').
                                addClass('cch-ui-legend-table-body-div-color').
                                css('background-color', yearToColor[years[yInd].substr(2)]).html('&nbsp;')
                        );
                    legendTableBodyTdButton = $('<td />');
                    valueContainer = $('<div />').attr({'id': 'cch-ui-legend-table-body-div-year-' + years[yInd]}).addClass('cch-ui-legend-table-body-div-year').html(years[yInd]);

                    // We don't really need visibility toggles when there's only one row
                    if (years.length > 1) {
                        legendDiv.addClass('btn-group').attr({'data-toggle': 'buttons-radio'});
                        viewButton = $('<button />').attr({
                            'cch-year': years[yInd],
                            'type': 'button'
                        }).
                            addClass('btn btn-sm pull-right cch-ui-legend-table-body-div-year-toggle').
                            append($('<i />').addClass('glyphicon glyphicon-eye-open')).
                            on({
                                'click': function (evt) {
                                    // Bootstrap radio toggle buttons don't let you un-toggle 
                                    // a button that's currently toggled so if a user presses an
                                    // active button, that means we should pop it up and 
                                    // un-highlight everything
                                    var tgt = $(evt.target);
                                    if (tgt.hasClass('active')) {
                                        tgt.removeClass('active');
                                        evt.stopImmediatePropagation();
                                    }

                                    setTimeout(function() {
                                        years = $('.cch-ui-legend-table-body-div-year-toggle').map(function (idx, btn) {
                                            year = $(btn).attr('cch-year');
                                            if ($(btn).hasClass('active')) {
                                                return year;
                                            } 
                                            return null;
                                        });

                                        layer = CCH.CONFIG.map.getLayersBy('type', 'cch-layer-dotted')[0];
                                        if (layer) {
                                            CCH.CONFIG.map.removeLayer(layer);
                                        }

                                        ns = CCH.CONFIG.item.wmsService.layers.split(':')[0];
                                        name = CCH.CONFIG.item.wmsService.layers.split(':')[1];
                                        layer = new OpenLayers.Layer.Vector("WFS", {
                                            strategies: [new OpenLayers.Strategy.BBOX()],
                                            protocol: new OpenLayers.Protocol.WFS({
                                                url: CCH.CONFIG.contextPath + '/cidags/' + ns + '/wfs',
                                                featureType: name
                                            }),
                                            styleMap: new OpenLayers.StyleMap({
                                                strokeColor: "#000000",
                                                strokeDashstyle: 'dot',
                                                strokeWidth: 2,
                                                strokeOpacity: 1
                                            }),
                                            filter: new OpenLayers.Filter.Logical({
                                                type: OpenLayers.Filter.Logical.OR,
                                                filters: years.map(function(idx, yr) {
                                                    return new OpenLayers.Filter.Comparison({
                                                        type: OpenLayers.Filter.Comparison.LIKE,
                                                        property: CCH.CONFIG.item.attr,
                                                        value: '*' + yr
                                                    });
                                                })
                                            })
                                        });
                                        layer.type = 'cch-layer-dotted';
                                        CCH.CONFIG.map.addLayer(layer);
                                    }, 100);
                                }
                            });
                        legendTableBodyTdButton.append(viewButton);
                    }

                    legendTableBodyTdYear = $('<td />').addClass('cch-ui-legend-table-body-td-year').append(valueContainer);
                    legendTableBody.append(legendTableBodyTr.append(legendTableBodyTdColor, legendTableBodyTdYear, legendTableBodyTdButton));
                }
            }

        } else if (type === 'storms') {
            buildVanillaLegend();
        } else if (type === 'vulnerability') {
            if (["TIDERISK", "SLOPERISK", "ERRRISK", "SLRISK", "GEOM", "WAVERISK", "CVIRISK"].indexOf(args.attr.toUpperCase()) !== -1) {
                // Old school CVI
                for (bInd = 0; bInd < sld.bins.length; bInd++) {
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
    };

    return me;
};
