/*jslint browser: true*/
/*global $*/
/*global CCH*/
/*global initializeLogging*/
/*global LOG*/
/*global OpenLayers*/
/*global splashUpdate*/
$(document).ready(function () {
    "use strict";

    initializeLogging({
        LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
    });
    CCH.LOG = LOG;
    CCH.items = new CCH.Objects.Items();
    CCH.CONFIG.item = new CCH.Objects.Item({
        id : CCH.CONFIG.itemId
    });
    CCH.map = new CCH.Objects.Map();
    CCH.ows = new CCH.Objects.OWS();

    $(window).on('cch.item.loaded', function (evt, args) {
        var id = args.id || '',
            item = CCH.CONFIG.item,
            layers,
            buildLegend = function (data, dataItem, index) {
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

        if (CCH.CONFIG.item.id === id) {
            CCH.ui = new CCH.Objects.UI({item : item});
            layers = item.showLayer();
            layers.each(function (child, index) {
                CCH.Util.getSLD({
                    contextPath: CCH.CONFIG.contextPath,
                    itemId: child.itemid,
                    callbacks: {
                        success : [
                            function (data) {
                                buildLegend(data, CCH.items.getById({ id : child.itemid }), index);
                            }
                        ],
                        error : [
                            function (jqXHR, textStatus, errorThrown) {
                                LOG.warn(errorThrown);
                            }
                        ]
                    }
                });
            });

            // Clear the overlay
            $('#application-overlay').fadeOut(2000, function () {
                $('#application-overlay').remove();
            });
        }
    });

    CCH.CONFIG.item.load({
        callbacks : {
            success : [
            ],
            error : [
                function (jqXHR, textStatus, errorThrown) {
                    var continueLink = $('<a />').attr({
                        'href': CCH.CONFIG.contextPath,
                        'role': 'button'
                    }).addClass('btn btn-lg').html('<i class="fa fa-refresh"></i> Click to continue'),
                        emailLink = $('<a />').attr({
                            'href': 'mailto:' + CCH.CONFIG.emailLink + '?subject=Application Failed To Load Item (URL: ' + window.location.toString() + ' Error: ' + errorThrown + ')',
                            'role': 'button'
                        }).addClass('btn btn-lg').html('<i class="fa fa-envelope"></i> Contact Us');

                    if (404 === jqXHR.status) {
                        splashUpdate("<b>Item Not Found</b><br /><br />We couldn't find the item you are looking for<br /><br />");
                    } else {
                        splashUpdate("<b>There was an error attempting to load an item.</b><br />Either try to reload the application or contact the system administrator.<br /><br />");
                    }
                    $('#splash-status-update').append(continueLink);
                    $('#splash-status-update').append(emailLink);
                    $('#splash-spinner').fadeOut(2000);
                }
            ]
        }
    });
});
