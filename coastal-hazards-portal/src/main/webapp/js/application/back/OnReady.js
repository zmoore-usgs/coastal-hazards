/*jslint browser: true*/
/*global $*/
/*global CCH*/
/*global initializeLogging*/
/*global LOG*/
/*global OpenLayers*/
/*global splashUpdate*/
$(document).ready(function () {

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
            layers;

        if (CCH.CONFIG.item.id === id) {
            CCH.ui = new CCH.Objects.UI({item : item});
            layers = item.showLayer().layers;
            layers.each(function (child, index) {
                CCH.Util.getSLD({
                    contextPath: CCH.CONFIG.contextPath,
                    itemId: child.itemid,
                    callbacks: {
                        success : [
                            function (data) {
                                CCH.ui.loadSLDCallback(data, CCH.items.getById({ id : child.itemid }), index, index === layers.length - 1);
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
