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
    CCH.ui = new CCH.Objects.UI();

    CCH.CONFIG.item.load({
        callbacks : {
            success : [
                function (data, textStatus, jqXHR) {
                    var legend;

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
                                            $.ajax(CCH.CONFIG.contextPath + 
                                                    '/cidags/ows?service=wfs&version=1.1.0&outputFormat=GML2&request=GetFeature&propertyName=' + 
                                                    CCH.CONFIG.item.attr + 
                                                    '&typeName=' + 
                                                    CCH.CONFIG.item.wmsService.layers, {
                                                success: function (data) {
                                                    var gmlReader = new OpenLayers.Format.GML.v3(),
                                                        features = gmlReader.read(data),
                                                        featureLegend = CCH.Util.buildLegend({
                                                            type: CCH.CONFIG.item.type,
                                                            attr: CCH.CONFIG.item.attr,
                                                            sld: sld,
                                                            features: features
                                                        });
                                                    $('#info-legend').append(featureLegend);
                                                },
                                                error: function (data, textStatus, jqXHR) {
                                                    removeLegendContainer();
                                                }
                                            });
                                        }

                                    } else if (CCH.CONFIG.item.type === 'storms') {
                                        legend = CCH.ui.buildLegend({
                                            type: CCH.CONFIG.item.type,
                                            sld: sld
                                        });
                                        $('#info-legend').append(legend);
                                    } else if (CCH.CONFIG.item.type === 'vulnerability') {
                                        legend = CCH.Util.buildLegend({
                                            type: CCH.CONFIG.item.type,
                                            attr: CCH.CONFIG.item.attr,
                                            sld: sld
                                        });
                                        $('#info-legend').append(legend);
                                    }

                                }
                            ],
                            error: [
                                function (jqXHR, textStatus, errorThrown) {
                                    removeLegendContainer();
                                }
                            ]
                        }
                    });

                    // Clear the overlay
                    $('#application-overlay').fadeOut(2000, function() {
                        $('#application-overlay').remove();
                    });

                    // A user has navigated to the info page. Update the popularity of 
                    // the object for that use type
                    CCH.Util.updateItemPopularity({
                        item: CCH.CONFIG.itemId,
                        type: 'use'
                    });

                    // Create a "View Metadata" button
                    var metadataLink = $('<a />').attr({
                        'href': CCH.CONFIG.item.metadata + '&outputSchema=http://www.opengis.net/cat/csw/csdgm',
                        'target': 'portal_metadata_window',
                        'role': 'button'
                    }).addClass('btn btn-default').html('<i class="fa fa-download"></i> View Metadata');

                    // Create a "Download Full" button
                    var downloadFull = $('<a />').attr({
                        'role': 'button',
                        'href': window.location.origin + CCH.CONFIG.contextPath + '/data/download/item/' + CCH.CONFIG.itemId
                    }).addClass('btn btn-default').html('<i class="fa fa-download"></i> Download Full Data');

                    // Create a "View in Portal" link to let the user view this in the portal
                    var applicationLink = $('<a />').attr({
                        'href': CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId,
                        'target': 'portal_main_window',
                        'role': 'button'
                    }).addClass('btn btn-default').html('<i class="fa fa-eye"></i> View In Portal');

                    // Build the publications list for the item
                    var publist = 'None Found';
					if (data.summary.full.publications) {
						publist = $('<ul />').attr('id', 'info-container-publications-list');
						Object.keys(data.summary.full.publications, function (type) {
							var pubTypeArray = data.summary.full.publications[type],
								pubTypeListHeader = $('<li />').
									addClass('publist-header').
									html(type),
								subList = $('<ul />'),
								pubLink;
							if (pubTypeArray.length) {
								pubTypeListHeader.append(subList);
								publist.append(pubTypeListHeader);
								data.summary.full.publications[type].each(function (publication) {
									pubLink = $('<a />').attr({
										'href' : publication.link,
										'target': 'portal_publication_window'
									}).html(publication.title);
									subList.append($('<li />').append(pubLink));
								});
							}
						});
					}
					
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
					
                    $('#info-title').html(data.summary.full.title);
                    $('#info-summary').html(data.summary.full.text);
                    $('#info-container-publications-list-span').append(publist);
                    $('#metadata-link').append(metadataLink);
                    $('#download-full-link').append(downloadFull);
                    $('#application-link').append(applicationLink);

                    buildTwitterButton();
                    CCH.map.buildMap();
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
    
    var removeLegendContainer = function() {
        $('#info-legend').remove();
    };

    var createShareButton = function(url) {
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
                CCH.Util.updateItemPopularity({
                    item: CCH.CONFIG.itemId,
                    type: 'tweet'
                });
            });
        });
    };

    var buildTwitterButton = function() {
        var url = window.location.origin + CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId;
        CCH.Util.getMinifiedEndpoint({
            location: url,
            contextPath: CCH.CONFIG.contextPath,
            callbacks: {
                success: [
                    function(data, textStatus, jqXHR) {
                        createShareButton(data.tinyUrl);
                    }],
                error: [
                    function(jqXHR, textStatus, errorThrown) {
                        createShareButton(url);
                    }]
            }
        });

    };
});
