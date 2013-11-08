/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global OpenLayers*/
/*global CCH*/
CCH.Objects.Items = function (args) {
    "use strict";
    args = args || {};

    var me = this === window ? {} : this;

    me.items = [];
    me.search = new CCH.Objects.Search({
        geocodeServiceEndpoint: CCH.CONFIG.data.sources.geocoding.endpoint
    });
    // Listeners
    // window: 'cch.search.item.submit'

    // Triggers
    // window: 'cch.data.items.loaded'
    // window: 'cch.data.items.searched'

    $(window).on('cch.search.item.submit', function (evt, data) {
        me.search.submitItemSearch({
            bbox: data.left ? [data.left, data.bottom, data.right, data.top].toString() : '',
            query: data.keywords || '',
            type: data.themes.toString() || '',
            sortBy: data.popularity ? 'popularity' : '',
            callbacks: {
                success: [
                    function (data) {
                        var items = [];
                        if (data && data.items && data.items.length) {
                            items = data.items;

                            // We are also currently filtering geospatial
                            // using the front-end due to hibernate being 
                            // a little b :/
                            // TODO Remove this filter once PostGIS is filterring
                            // properly via spatial
                            items.remove(function (item) {
                                var isDupe = this.count(item) > 1,
                                    intersectsBoundBox = new OpenLayers.Bounds(item.bbox).intersectsBounds(new OpenLayers.Bounds(CCH.search.getCurrentBBOX()));
                                return isDupe || !intersectsBoundBox;
                            });

                            // If items were found, return the items that were found
                            // and load them in the view
                            if (items.length) {
                                me.items = items;

                                $(window).trigger('cch.data.items.loaded', {
                                    items: me.items
                                });
                                CCH.slideshow.stop();
                            }
                        }

                        $(window).trigger('cch.data.items.searched', items.length);
                    }
                ],
                error: [
                    function(xhr, status, error) {
                        $.pnotify({
                            text: 'Could not perform search. Check logs for details.',
                            styling: 'bootstrap',
                            type: 'error',
                            nonblock: true
                        });
                        LOG.info('An error occurred during search: ' + error);
                    }
                ]
            }
        });
    });

    return {
        load: function (args) {
            args = args || {};
            args.items = args.items || [];
            args.callbacks = args.callbacks || {};
            args.callbacks.success = args.callbacks.success || [];
            args.callbacks.error = args.callbacks.error || [];

            if (!args.items.length) {
                args.callbacks.success.unshift(function (data) {
                    me.items = data.items;
                    $(window).trigger('cch.data.items.loaded', {
                        items: me.items
                    });
                });
            } else {
                args.callbacks.success.unshift(function (data) {
                    me.items.push(data);
                    if (args.items.length) {
                        me.search(args);
                    } else {
                        $(window).trigger('cch.data.items.loaded', {
                            items: me.items
                        });
                    }
                });
            }

            me.search.submitItemSearch(args);

        },
        search: me.search.submitItemSearch,
        getItems: function () {
            return me.items;
        },
        getById: function (args) {
            var id = args.id;
            return me.items.find(function (item) {
                return item.id === id;
            });
        }
    };
};