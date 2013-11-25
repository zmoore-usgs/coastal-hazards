/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global OpenLayers*/
/*global CCH*/

/**
 * Top level JS container for product items
 * 
 *  Listeners
 *  window: 'cch.search.item.submit'
 *
 *  Triggers
 *  window: 'cch.data.products.loaded'
 * 
 * @param {type} args
 * @returns {CCH.Objects.Items.Anonym$4}
 */
CCH.Objects.Items = function (args) {
    "use strict";
    args = args || {};

    var me = this === window ? {} : this;

    me.items = {};
    me.search = new CCH.Objects.Search({
        geocodeServiceEndpoint: CCH.CONFIG.data.sources.geocoding.endpoint
    });

    me.load = function (args) {
        args = args || {};
        args.items = args.items || [];
        args.callbacks = args.callbacks || {};
        args.callbacks.success = args.callbacks.success || [];
        args.callbacks.error = args.callbacks.error || [];

        var bbox = args.left ? [args.left, args.bottom, args.right, args.top].toString() : '',
            query = args.keywords || '',
            type = args.themes || '',
            sortBy = args.popularity ? 'popularity' : '',
            displayNotification = args.displayNotification === false ? false : true;

        if (!args.items.length) {
            args.callbacks.success.unshift(function (data) {
                var items = [],
                    incomingItemsObject;
                if (data && data.items && data.items.length) {
                    items = data.items;

                    // Create a map of objects keyed on ids
                    incomingItemsObject = (function(i) {
                        var returnObj = {};
                        i.each(function(item) {
                            returnObj[item.id] = item;
                        });
                        return returnObj;
                    }(data.items));

                    // Extend the in-memory items with the incoming items
                    $.extend(true, me.items, incomingItemsObject);

                    // We are also currently filtering geospatial
                    // using the front-end due to hibernate being 
                    // a little b :/ Also removing duplicate entries

                    // TODO Remove this filter once PostGIS is filtering
                    // properly via spatial
                    items.remove(function (item) {
                        var isDupe = this.count(item) > 1;//,
//                                    intersectsBoundBox = new OpenLayers.Bounds(item.bbox).intersectsBounds(new OpenLayers.Bounds(me.search.getCurrentBBOX()));
                        return isDupe;// || !intersectsBoundBox;
                    });

                    // Trigger that the call has completed
                    $(window).trigger('cch.data.products.loaded', {
                        products: data.items
                    });
                }
            });
        } else {
            args.callbacks.success.unshift(function (data) {
                me.items.push(data);
                if (args.items.length) {
                    me.search(args);
                } else {
                    $(window).trigger('cch.data.products.loaded', {
                        products: me.items
                    });
                }
            });
        }
        
        args.callbacks.error.push([
            function (xhr, status, error) {
                $.pnotify({
                    text: 'Could not perform search. Check logs for details.',
                    styling: 'bootstrap',
                    type: 'error',
                    nonblock: true
                });
                LOG.info('An error occurred during search: ' + error);
            }
        ]);
       
        me.search.submitItemSearch({
            bbox: bbox,
            query: query,
            type: type,
            sortBy: sortBy,
            displayNotification : displayNotification,
            callbacks: {
                success: args.callbacks.success,
                error: args.callbacks.error
            }
        });
    };

    return {
        load: me.load,
        search: me.search.submitItemSearch,
        getItems: function () {
            return me.items;
        },
        getById: function (args) {
            var id = args.id;
            return me.items[id];
        }
    };
};