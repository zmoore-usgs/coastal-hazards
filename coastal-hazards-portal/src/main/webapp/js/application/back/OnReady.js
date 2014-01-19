/*jslint browser: true*/
/*global $*/
/*global CCH*/
/*global initializeLogging*/
/*global LOG*/
/*global OpenLayers*/
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
            item = CCH.CONFIG.item;
        
        if (CCH.CONFIG.item.id === id) {
            item.showLayer();
        }
    });

    

    CCH.CONFIG.item.load({
        callbacks : {
            success : [
                function (itemData) {
                    var legend,
                        isAggregation = itemData.itemType === 'aggregation'

                    CCH.ui = new CCH.Objects.UI({itemData : itemData});

                    if (isAggregation) {
                    } else {
                        CCH.Util.getSLD({
                            contextPath: CCH.CONFIG.contextPath,
                            itemId: CCH.CONFIG.itemId,
                            callbacks: {
                                success: [
                                    function (data) {
                                        var sld = data;
                                        if (CCH.CONFIG.item.type === 'historical') {
                                            if (CCH.CONFIG.item.name === 'rates') {
                                                legend = CCH.ui.buildLegend({
                                                    type: CCH.CONFIG.item.type,
                                                    name: CCH.CONFIG.item.name,
                                                    attr: CCH.CONFIG.item.attr,
                                                    sld: sld
                                                });
                                                $('#info-legend').append(legend);
                                            } else {
                                                // - The legend builder is going to need the actual data from the shorelines layer
                                                // 
                                                // - Using the wmsService.layers info for a WMS request because that's properly
                                                // formatted to go into this request. The wfsService has the fully qualified namespace
                                                // which borks the WFS request
                                                CCH.ows.getFilteredFeature({
                                                    layerName : CCH.CONFIG.item.wmsService.layers,
                                                    propertyArray : [CCH.CONFIG.item.attr],
                                                    success : [
                                                        function (data) {
                                                            var gmlReader = new OpenLayers.Format.GML.v3(),
                                                                features = gmlReader.read(data),
                                                                featureLegend = CCH.Util.buildLegend({
                                                                    type: CCH.CONFIG.item.type,
                                                                    attr: CCH.CONFIG.item.attr,
                                                                    sld: sld,
                                                                    features: features
                                                                });
                                                            $('#info-legend').append(featureLegend);
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
                                        } else if (CCH.CONFIG.item.type === 'storms') {
                                            CCH.ui.buildLegend({
                                                type: CCH.CONFIG.item.type,
                                                sld: sld
                                            });
                                        } else if (CCH.CONFIG.item.type === 'vulnerability') {
                                            CCH.Util.buildLegend({
                                                type: CCH.CONFIG.item.type,
                                                attr: CCH.CONFIG.item.attr,
                                                sld: sld
                                            });
                                        }

                                    }
                                ],
                                error: [
                                    function (jqXHR, textStatus, errorThrown) {
                                        LOG.warn(errorThrown);
                                        CCH.ui.removeLegendContainer();
                                    }
                                ]
                            }
                        });
                    }

                    // Clear the overlay
                    $('#application-overlay').fadeOut(2000, function () {
                        $('#application-overlay').remove();
                    });
                }
            ],
            error : [
                function(jqXHR, textStatus, errorThrown) {
                    var continueLink = $('<a />').attr({
                        'href': CCH.CONFIG.contextPath,
                        'role': 'button'
                    }).addClass('btn btn-lg').html('<i class="fa fa-refresh"></i> Click to continue')

                    var emailLink = $('<a />').attr({
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
