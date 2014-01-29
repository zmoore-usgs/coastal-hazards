/*jslint browser: true */
/*jslint plusplus: true */
/*global $ */
/*global CCH */
/*global OpenLayers */
CCH.Objects.UI = function (args) {
    "use strict";
    CCH.LOG.info('UI.js::constructor: UI class is initializing.');

    var me = (this === window) ? {} : this,
        $metadataLink,
        $downloadFull,
        $applicationLink,
        $publist,
        item = args.item;

    me.loadSLDCallback = function (data, dataItem, index) {
        var sld = data,
            featureLegend,
            existingDivArray,
            insertLegendAtIndex = function (legend, index) {
                var $legendContainer = $('#info-legend');
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
            };
        if (dataItem.type === 'historical') {
            if (dataItem.item.name === 'rates') {
                featureLegend = CCH.ui.buildLegend({
                    type: dataItem.item.type,
                    name: dataItem.item.name,
                    attr: dataItem.item.attr,
                    sld: sld
                });
                insertLegendAtIndex(featureLegend, index);
            } else {
                // - The legend builder is going to need the actual data from the shorelines layer
                // 
                // - Using the wmsService.layers info for a WMS request because that's properly
                // formatted to go into this request. The wfsService has the fully qualified namespace
                // which borks the WFS request
                CCH.ows.getFilteredFeature({
                    layerName : dataItem.wmsService.layers,
                    propertyArray : [dataItem.attr],
                    success : [
                        function (data) {
                            var gmlReader = new OpenLayers.Format.GML.v3(),
                                features = gmlReader.read(data);
                            featureLegend = CCH.ui.buildLegend({
                                type: dataItem.type,
                                attr: dataItem.attr,
                                sld: sld,
                                features: features
                            });
                            insertLegendAtIndex(featureLegend, index);
                        }
                    ],
                    error : [
                        function (data, textStatus, jqXHR) {
                            LOG.warn(textStatus);
                            CCH.ui.removeLegendContainer();
                        }
                    ]
                });
            }
        } else if (dataItem.type === 'storms') {
            featureLegend = CCH.ui.buildLegend({
                type: dataItem.type,
                sld: sld
            });
            insertLegendAtIndex(featureLegend, index);
        } else if (dataItem.type === 'vulnerability') {
            featureLegend = CCH.ui.buildLegend({
                type: dataItem.type,
                attr: dataItem.attr,
                sld: sld
            });
            insertLegendAtIndex(featureLegend, index);
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
            legendDiv = $('<div />').addClass('cch-ui-legend-div'),
            legendTable = $('<table />').addClass('cch-ui-legend-table table table-bordered table-hover'),
            legendTableCaption = $('<caption />').addClass('cch-ui-legend-table-caption').html(sld.title),
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
    
    me.removeLegendContainer = function() {
        $('#info-legend').remove();
    };
    
    me.buildTwitterButton = function() {
        var url = window.location.origin + CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId;
        CCH.Util.getMinifiedEndpoint({
            location: url,
            contextPath: CCH.CONFIG.contextPath,
            callbacks: {
                success: [
                    function(data, textStatus, jqXHR) {
                       me.createShareButton(data.tinyUrl);
                    }],
                error: [
                    function(jqXHR, textStatus, errorThrown) {
                        me.createShareButton(url);
                    }]
            }
        });
    };
    
    me.createShareButton = function(url) {
        twttr.ready(function(twttr) {
            twttr.widgets.createShareButton(
                    url,
                    $('#social-link')[0],
                    function(element) {
                        // Any callbacks that may be needed
                    },
                    {
                        hashtags: 'USGS_CCH',
                        lang: 'en',
                        size: 'large',
                        text: CCH.CONFIG.item.summary.tiny.text
                    });

            twttr.events.bind('tweet', function(event) {
                
            });
        });
    };
    
    // Initialize The UI
 
    // Fill out the modal window with services
    CCH.CONFIG.item.services.each(function (service) {
        var endpoint = service.endpoint,
            serviceType = service.type,
            serviceParam = service.serviceParameter,

            $link = $('<a />').attr({
                        'href' : endpoint,
                        'target' : '_services'
                    }),
            $textBox = $('<input />').attr({
                'type' : 'text'
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
                $newRow.append($link, $textBox)
                break;
                }
            case ('source_wms') :
                {
                $link.html('Source WMS :');
                $textBox.val(endpoint);
                $serviceParamSpan.append(serviceParam, ' )');
                $newRow.append($link, $serviceParamSpan, $textBox)
                break;
                }
            case ('source_wfs') :
                {
                $link.html('Source WFS :');
                $textBox.val(endpoint);
                $serviceParamSpan.append(serviceParam, ' )');
                $newRow.append($link, $serviceParamSpan, $textBox)
                break;
                }
            case ('proxy_wfs') :
                {
                $link.html('Proxy WFS :');
                $textBox.val(endpoint);
                $serviceParamSpan.append(serviceParam, ' )');
                $newRow.append($link, $serviceParamSpan, $textBox)
                break;
                }
            case ('proxy_wms') :
                {
                $link.html('Proxy WMS :');
                $textBox.val(endpoint);
                $serviceParamSpan.append(serviceParam, ' )');
                $newRow.append($link, $serviceParamSpan, $textBox)
                break;
                }
        }

        $('#modal-services-view .modal-body').append($newRow)
    });
    
    // Create a "Download Full" button
    $downloadFull = $('<a />').attr({
        'role': 'button',
        'href': window.location.origin + CCH.CONFIG.contextPath + '/data/download/item/' + CCH.CONFIG.itemId
    }).addClass('btn btn-default').html('<i class="fa fa-download"></i> Download Full Data');
 
    // Create a "View Metadata" button
    $metadataLink = $('<a />').attr({
        'href': CCH.CONFIG.item.metadata + '&outputSchema=http://www.opengis.net/cat/csw/csdgm',
        'target': 'portal_metadata_window',
        'role': 'button'
    }).addClass('btn btn-default').html('<i class="fa fa-download"></i> View Metadata');
    $('#metadata-link').append($metadataLink);
    $('#download-full-link').append($downloadFull);
    
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
                        'href' : publication.link,
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
    
    return me;
};
