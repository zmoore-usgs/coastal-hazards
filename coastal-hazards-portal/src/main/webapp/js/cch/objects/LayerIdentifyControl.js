/*jslint browser: true */
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global OpenLayers*/
CCH.Objects.LayerIdentifyControl = OpenLayers.Class(OpenLayers.Control.WMSGetFeatureInfo, {
    title: 'identify-control',
    layers: [],
    queryVisible: true,
    output: 'features',
    drillDown: true,
    maxFeatures: 1000,
    infoFormat: 'application/vnd.ogc.gml',
    vendorParams: {
        radius: 3
    },
    layerIdClickHandler : function (evt) {
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
            sldResponseHandler,
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
                return splitName.last();
            };

        $(window).trigger('cch.map.control.layerid.responded')

        // I don't roll out of bed before having some features to work with.
        // If I have no features, this means the user clicked in an empty
        // spot
        if (features.length) {
            // Get just the displayed layers on the map 
            cchLayers = CCH.map.getMap().layers.findAll(function (l) {
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
            cchLayers.each(function (l) {
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
            features.each(function (feature) {
                ids = layerUrlToId[feature.gml.featureNSPrefix + ':' + feature.gml.featureType];
                ids.each(function (id) {
                    featuresByName[id].push(feature.attributes);
                });
            });

            popupHtml = '<div class="col-md-12"><span id="layer-load-id">Loading Information...</span></div>';

            // Create the popup and add it to the map
            popup = new OpenLayers.Popup.FramedCloud('feature-identification-popup',
                CCH.map.getMap().getLonLatFromPixel(evt.xy),
                new OpenLayers.Size(50,50),
                popupHtml,
                null,
                true,
                null);

            // Close any other layer identification widgets on the map
            CCH.map.removeAllPopups();
            CCH.map.getMap().addPopup(popup, true);

            sldResponseHandler = function (sld) {
                var bins = sld.bins,
                    units = sld.units,
                    layerId = this.layerId,
                    item = CCH.items.getById({id : layerId}),
                    title = item.summary.medium.title,
                    attr = item.attr,
                    attrAvg = 0,
                    category,
                    incomingFeatures = this.features,
                    layers = this.layers,
                    color,
                    buildLegend,
                    buildLegend = function (args) {
                        args = args || {};
                        var binIdx = 0,
                            bins = args.bins,
                            color = args.color,
                            attrAvg = args.attrAvg,
                            title = args.title,
                            popup = args.popup,
                            units = args.units,
                            features = args.features,
                            layers = args.layers,
                            layerId = args.layerId,
                            layer = CCH.map.getMap().getLayersBy('itemid', layerId)[0],
                            layerIndex = CCH.map.getMap().getLayerIndex(layer),
                            $popupHtml = $(popup.contentHTML),
                            $table = $('<table />').attr('data-attr', layerIndex),
                            $titleContainer = $('<td />'),
                            $colorContainer = $('<td />'),
                            $yearContainer = $('<td />'),
                            $legendRow = $('<tr>').addClass('legend-row'),
                            item = args.item,
                            ribbonIndex = -1,
                            layerName = layers.find(function(l) {
                                return l.itemid === item.id;
                            }).name,
                            lb,
                            ub,
                            width,
                            height,
                            dateAttribute,
                            year,
                            year2Digit,
                            bin;

                        if (layerName.indexOf('_r_') !== -1) {
                            ribbonIndex = parseInt(layerName.split('_').last(), 10);
                        }

                        $titleContainer.html(title);

                        if (units === 'year') {
                            features.each(function (feature) {
                                $titleContainer = $('<td />').html(title);
                                $colorContainer = $('<td />');
                                $yearContainer = $('<td />');
                                $legendRow = $('<tr>');
                                dateAttribute = Object.keys(feature).find(function (attr) {
                                    return attr.toLowerCase().indexOf('date') !== -1;
                                });
                                year = feature[dateAttribute].split('/')[2];
                                year2Digit = year.substring(2);

                                if ($table.find('#popup-legend-' + year).length === 0) {
                                    bin = bins.find(function (bin) {
                                        return bin.years.findIndex(function (year) {
                                            year = String(year);
                                            if (year.length === 1) {
                                                year = '0' + year;
                                            }
                                            return year === year2Digit;
                                        }) !== -1;
                                    });
                                    $colorContainer.append($('<span />').css('backgroundColor', bin.color).html('&nbsp;&nbsp;&nbsp;&nbsp;'));
                                    $yearContainer.append(year, ' yr');
                                    $legendRow.append($titleContainer, $colorContainer, $yearContainer).attr('id', 'popup-legend-' + year);
                                    $table.append($legendRow);
                                }
                            });
                            var sortedRows = $table.find('tr').toArray().sortBy(function(row) {
                                return parseInt($(row).attr('id').substring(13));
                            })
                            $table.empty().append(sortedRows);
                        } else {
                            for (binIdx = 0; binIdx < bins.length && !color; binIdx++) {
                                lb = bins[binIdx].lowerBound;
                                ub = bins[binIdx].upperBound;

                                if (lb !== undefined && ub !== undefined) {
                                    if (attrAvg <= ub && attrAvg >= lb) {
                                        color = bins[binIdx].color;
                                    }
                                } else if (lb === undefined && ub !== undefined) {
                                    if (attrAvg <= ub) {
                                        color = bins[binIdx].color;
                                    }
                                } else {
                                    if (attrAvg >= lb) {
                                        color = bins[binIdx].color;
                                    }
                                }
                            }
                            $colorContainer.append($('<span />').css('backgroundColor', color).html('&nbsp;&nbsp;&nbsp;&nbsp;'));

                            if (item.attr.toLowerCase() === 'cvirisk') {
                                $yearContainer.append(bins[attrAvg.toFixed(0) - 1].category + ' Risk');
                            } else {
                                $yearContainer.append(attrAvg % 1 === 0 ? attrAvg.toFixed(0) : attrAvg.toFixed(3));
                                $yearContainer.append(' ' + units);
                            }
                            $legendRow.append($titleContainer, $colorContainer, $yearContainer);
                            
                            if (ribbonIndex !== -1) {
                                // If this is part of a ribboned series, I'm going
                                //  to have to sort these rows based on the ribbon
                                // index
                                $legendRow.attr('id', 'legend-row-' + ribbonIndex);
                                var sortedRows;
                            
                                $table.append($legendRow);
                                sortedRows = $table.find('tbody > tr').toArray().sortBy(function (row) {
                                    return parseInt($(row).attr('id').split('-').last(),10);
                                });
                                $table.empty().append(sortedRows);
                            } else {
                                $table.append($legendRow);
                            }
                        }
                        
                        $popupHtml.find('#layer-load-id').remove();
                        CCH.map.getMap().getLayerIndex(CCH.map.getMap().getLayersBy('itemid', layerId)[0])
                        $popupHtml.append($table);
                        var tables = $popupHtml.find('table').toArray().sortBy(function (tbl) {
                            return parseInt($(tbl).attr('data-attr'));
                        });
                        tables.each(function (tbl, ind) {
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
                        $popupHtml.empty().append(tables);
                        popup.setContentHTML($popupHtml.clone().wrap('<div/>').parent().html());
                        width = function () {
                            var cWidth = 0,
                                maxWidth = Math.round($('#map').width() - 20);
                                
                            $('#feature-identification-popup div.col-md-12 table').each(function (ind, table) {
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
                            $('#feature-identification-popup div.col-md-12 > table tr').each(function (ind, item) {
                                cHeight += $(item).outerHeight() + ($(item).outerHeight() * .3);
                            });
                            if (cHeight > maxHeight) {
                                cHeight = maxHeight;
                            }
                            return Math.round(cHeight);
                        };
                        popup.setSize(new OpenLayers.Size(width(), height()));
                        popup.panIntoView();
                        $(window).on('cch.ui.redimensioned', function () {
                            popup.setSize(new OpenLayers.Size(width(), height()));
                            popup.panIntoView();
                        });
                    };

                if (item.type.toLowerCase() === 'vulnerability' ||
                        item.type.toLowerCase() === 'storms' ||
                        item.type.toLowerCase() === 'historical') {
                    // Add up the count for each feature
                    incomingFeatures.each(function (f) {
                        var pFl = parseFloat(f[attr]);
                        if (isNaN(pFl)) {
                            pFl = 0.0;
                        }
                        attrAvg += pFl;
                    });

                    // Average them out
                    attrAvg /= incomingFeatures.length;
                    
                    if (["TIDERISK", "SLOPERISK", "ERRRISK", "SLRISK", "GEOM", "WAVERISK", "CVIRISK"].indexOf(attr.toUpperCase()) !== -1) {
                        attrAvg = Math.ceil(attrAvg);
                        category = sld.bins[attrAvg - 1].category;
                        color = sld.bins[attrAvg - 1].color;
                    }
                }
                
                buildLegend({
                    bins : bins,
                    color : color,
                    title : title,
                    features : incomingFeatures,
                    attrAvg : attrAvg,
                    item : item,
                    popup : popup,
                    units : units,
                    layers : layers,
                    layerId : layerId
                });
            };

            for (layerName in featuresByName) {
                if (featuresByName.hasOwnProperty(layerName)) {
                    layerName = trimLayerName(layerName);
                    if (featuresByName.hasOwnProperty(layerName)) {
                        features = featuresByName[layerName];
                        featureCount = features.length;
                        if (featureCount) {
                            CCH.Util.Util.getSLD({
                                itemId : layerName,
                                contextPath: CCH.CONFIG.contextPath,
                                context : {
                                    features : features,
                                    layerId : layerName,
                                    evt : evt,
                                    popup : popup,
                                    layers : cchLayers
                                },
                                callbacks : {
                                    success : [sldResponseHandler],
                                    error : [
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
    initialize : function (options) {
        "use strict";
        options = options || {};
        options.handlerOptions = options.handlerOptions || {};

        OpenLayers.Control.WMSGetFeatureInfo.prototype.initialize.apply(this, [options]);

        this.events.register("getfeatureinfo", this, this.layerIdClickHandler);
    },
    CLASS_NAME: "OpenLayers.Control.WMSGetFeatureInfo"
});