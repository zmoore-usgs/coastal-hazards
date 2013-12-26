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
                id,
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
                    // CCH layer and not anything else
                    return l.url && l.url.indexOf('geoserver') > -1;
                });

                // Set up the layer URL to ID lookup table
                cchLayers.each(function (l) {
                    layerUrlToId[l.params.LAYERS] = l.name;
                    featuresById[l.name] = [];
                });

                // Populate the layers map
                features.each(function (feature) {
                    id = layerUrlToId[feature.gml.featureNSPrefix + ':' + feature.gml.featureType];
                    featuresById[id].push(feature.attributes);
                });

                popupHtml = '<div class="container col-md-12">' +
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
                        if (features.length) {
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

                                            // I've got 
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

                                                $titleContainer.html(title + (units ? ' (' + units + ') ' : ''));
                                                $colorContainer.append($('<span />').css('backgroundColor', color).html('&nbsp;&nbsp;&nbsp;&nbsp;'));
                                                $averageContainer.html(attrAvg % 1 === 0 ? attrAvg.toFixed(0) : attrAvg.toFixed(3));

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