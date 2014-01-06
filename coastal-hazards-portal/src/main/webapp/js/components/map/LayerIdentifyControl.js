CCH.Objects.LayerIdentifyControl = OpenLayers.Class(OpenLayers.Control.WMSGetFeatureInfo, {
    title: 'identify-control',
    layers: [],
    queryVisible: true,
    output: 'features',
    drillDown: true,
    maxFeatures: 1000,
    infoFormat: 'application/vnd.ogc.gml',
    initialize : function(options) {
        options = options || {};
        options.handlerOptions = options.handlerOptions || {};

        OpenLayers.Control.WMSGetFeatureInfo.prototype.initialize.apply(this, [options]);
        
        this.events.register("getfeatureinfo", this, this.layerIdClickHandler);
    },
    vendorParams: {
        radius: 3
    },
    layerIdClickHandler : function (evt) {
            var features = evt.features,
                cchLayers,
                layerUrlToId = {},
                ids,
                layerId,
                featuresById = {},
                featureCount,
                popup,
                popupHtml;

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
                    if (!layerUrlToId[l.params.LAYERS]) {
                        layerUrlToId[l.params.LAYERS] = [];
                    }
                    layerUrlToId[l.params.LAYERS].push(l.name);
                    featuresById[l.name] = [];
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
                        featuresById[id].push(feature.attributes);
                    });
                });

                popupHtml = '<div class="col-md-12">' +
                        '<table>' +
                        '<tr id="loading-info-row"><td>Loading Information...</td></tr>' +
                        '</table>';

                // Create the popup and add it to the map
                popup = new OpenLayers.Popup.FramedCloud('feature-identification-popup',
                    CCH.map.getMap().getLonLatFromPixel(evt.xy),
                    null,
                    popupHtml,
                    null,
                    true,
                    null);

                // Close any other layer identification widgets on the map
                if (CCH.map.getMap().popups.length) {
                    CCH.map.getMap().popups.each(function (popup) {
                        popup.closeDiv.click();
                    });
                }
                CCH.map.getMap().addPopup(popup, true);

                for (layerId in featuresById) {
                    if (featuresById.hasOwnProperty(layerId)) {
                        features = featuresById[layerId];
                        featureCount = features.length;
                        if (featureCount) {
                            CCH.Util.getSLD({
                                itemId : layerId,
                                contextPath: CCH.CONFIG.contextPath,
                                context : {
                                    features : features,
                                    layerId : layerId,
                                    evt : evt,
                                    popup : popup
                                },
                                callbacks : {
                                    success : [
                                        function (sld) {
                                            var title = sld.title,
                                                bins = sld.bins,
                                                units = sld.units,
                                                features = this.features,
                                                layerId = this.layerId,
                                                item = CCH.items.getById({id:layerId}),
                                                popup = this.popup,
                                                attr = item.attr,
                                                attrAvg = 0,
                                                category,
                                                color,
                                                buildLegend,
                                                binIdx,
                                                $popupHtml = $(popup.contentHTML),
                                                $table = $popupHtml.find('table'),
                                                $theadRow = $('<tr />').append(
                                                    $('<td />').html('Layer'),
                                                    $('<td />').html('Color'),
                                                    $('<td />').html('Value')
                                                ),
                                                $legendRow = $('<tr>'),
                                                $titleContainer = $('<td />'),
                                                $colorContainer = $('<td />'),
                                                $averageContainer = $('<td />'),
                                                lb,
                                                ub;

                                            
                                            // Add up the count for each feature
                                            features.each(function (f) {
                                                var pFl = parseFloat(f[attr]);
                                                if (isNaN(pFl)) {
                                                    pFl = 0.0;
                                                }
                                                attrAvg += pFl;
                                            });

                                            // Average them out
                                            attrAvg /= features.length;

                                            // I've got enough information to build
                                            // a legend
                                            buildLegend = function () {
                                                for (binIdx = 0; binIdx < bins.length && !color; binIdx++) {
                                                    lb = bins[binIdx].lowerBound;
                                                    ub = bins[binIdx].upperBound;

                                                    if (lb !== undefined && ub !== undefined) {
                                                        if (attrAvg < ub && attrAvg > lb) {
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

                                                $table.find('#loading-info-row').remove();
                                                $titleContainer.html(title);
                                                $colorContainer.append($('<span />').css('backgroundColor', color).html('&nbsp;&nbsp;&nbsp;&nbsp;'));
                                                
                                                if (item.attr.toLowerCase() === 'cvirisk') {
                                                    $averageContainer.append(bins[attrAvg.toFixed(0) - 1].category + ' Risk')
                                                } else {
                                                    $averageContainer.append(attrAvg % 1 === 0 ? attrAvg.toFixed(0) : attrAvg.toFixed(3));
                                                    $averageContainer.append(' ' + units);
                                                }
                                                $legendRow.append($titleContainer, $colorContainer, $averageContainer);

                                                $table.append($legendRow);
                                                $popupHtml.append($table);
                                                popup.setContentHTML($popupHtml.clone().wrap('<div/>').parent().html());
                                                // Set the size of the popup to be 
                                                // 1/3rd of the map's width and add
                                                // 60 pixels for each row
                                                popup.setSize(new OpenLayers.Size(CCH.map.getMap().getSize().w * 0.65, $table.find('tr').length * 65));
                                                popup.panIntoView();
                                            };
                                            
                                            if ($table.find('tr:not(#loading-info-row)').length === 0) {
                                                $table.append($theadRow);
                                            }

                                            if (item.type.toLowerCase() === 'vulnerability') {
                                                if (["TIDERISK", "SLOPERISK", "ERRRISK", "SLRISK", "GEOM", "WAVERISK", "CVIRISK"].indexOf(attr.toUpperCase()) !== -1) {
                                                    attrAvg = Math.ceil(attrAvg);
                                                    category = sld.bins[attrAvg - 1].category;
                                                    color = sld.bins[attrAvg - 1].color;
                                                }
                                            } else if (item.type.toLowerCase() === 'historical') {
                                                if (["LRR", "WLR", "SCE", "NSM", "EPR"].indexOf(args.attr.toUpperCase()) === -1) {
                                                    // TODO - Figure out what needs to be done here. Need data to look at before that happens
                                                }
                                            }
                                            buildLegend();
                                        }
                                    ],
                                    error : [
                                        function () {
                                            CCH.LOG.warn('Map.js::Could not get SLD information for item ' + layerId);
                                        }
                                    ]
                                }
                            });
                        }
                    }
                }
            }
        },
    CLASS_NAME: "OpenLayers.Control.WMSGetFeatureInfo"
});