/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global OpenLayers*/
/*global CCH*/
CCH.Objects.Search = function (args) {
    "use strict";
    var me = (this === window) ? {} : this;

    if (!args) {
        throw 'arguments not found';
    }

    me.GEOCODE_SERVICE_ENDPOINT = args.geocodeServiceEndpoint;

    $.extend(me, args);

    me.submitLocationSearch = function (args) {
        if (!args) {
            throw 'arguments required';
        }

        var criteria = args.criteria || '',
            maxLocations = args.maxLocations || 20,
            callbacks = args.callbacks || {
                success : [],
                error : []
            },
            scope = args.scope || this;

        $.ajax({
            type: 'GET',
            url: me.GEOCODE_SERVICE_ENDPOINT,
            context : scope,
            data: {
                text: criteria,
                maxLocations: maxLocations,
                outFields: '*',
                f: 'pjson',
                outSR: '3785'
            },
            contentType: 'application/json',
            dataType: 'jsonp',
            success: function (data, statusText, xhrResponse) {
                callbacks.success.each(function (cb) {
                    cb.apply(this, [data, statusText, xhrResponse]);
                });
            },
            error: function (xhr, status, error) {
                callbacks.error.each(function (cb) {
                    cb.apply(this, [xhr, status, error]);
                });
            }
        });
    };

    me.submitItemSearch = function (args) {
        if (!args) {
            throw 'arguments required';
        }

        var criteria = args.criteria || '',
            count = args.count || 20,
            bbox = args.bbox || null,
            sortBy = args.sortBy || null,
            items = args.items || [],
            itemId = items.pop() || '',
            item = itemId ? '/' + itemId : '',
            types = args.types || [],
            callbacks = args.callbacks || {
                success : [],
                error : []
            },
            scope = args.scope || this,
            data = item ? '' : {
                count: count,
                bbox: bbox,
                sortBy: sortBy,
                query: criteria,
                type: types
            },
            url = CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.item.endpoint;

        if (!item) {
            if (!count) {
                delete data.count;
            }
            if (!bbox) {
                delete data.bbox;
            }
            if (!sortBy) {
                delete data.sortBy;
            }
            if (!criteria || criteria.length === 0) {
                delete data.criteria;
            }
            if (!types || types.length === 0) {
                delete data.length;
            }
        } else {
            url += item;
        }

        $.ajax({
            url: url,
            dataType: 'json',
            data: data,
            context : scope,
            traditional: true,
            success: function (data, statusText, xhrResponse) {
                callbacks.success.each(function (cb) {
                    cb.apply(this, [data, statusText, xhrResponse]);
                });
            },
            error: function (xhr, status, error) {
                callbacks.error.each(function (cb) {
                    cb.apply(this, [xhr, status, error]);
                });
            }
        });
    };

    return {
        submitLocationSearch : me.submitLocationSearch,
        submitItemSearch : me.submitItemSearch
    };

};

CCH.Objects.deprecatedSearch = function(args) {
	var me = (this === window) ? {} : this;
	me.searchbar = args.searchbar;
	me.geocodeEndoint = args.geocodeEndoint;
	me.modalContainer = args.modalContainer;
	me.north = args.north;
	me.south = args.south;
	me.east = args.east;
	me.west = args.west;
	me.popularityInput = args.popularityInput;
	me.popularityRange = args.popularityRange;
	me.searchContainer = args.searchContainer;
	me.submitButton = args.submitButton;
	me.keywordInput = args.keywordInput;
	me.themeInput = args.themeInput;
	me.itemSearchModalWindow = args.itemSearchModalWindow;
	me.popularityCb = args.popularityCb;
	me.searchQuery = args.searchQuery;
	return $.extend(me, {
		init: function() {
			me.bindGeolocationInput();
			me.bindSearchModalButton();
			me.itemSearchModalWindow.css('display', 'none');
			return me;
		},
		bindGeolocationInput: function() {
			me.searchbar.submit(function(evt) {
				var query = me.searchQuery.val();
				if (query) {
					$.ajax({
						type: 'GET',
						url: me.geocodeEndoint,
						data: {
							text: query,
							maxLocations: '20',
							outFields: '*',
							f: 'pjson',
							outSR: '3785'
						},
						async: false,
						contentType: 'application/json',
						dataType: 'jsonp',
						success: function(json) {
							if (json.locations[0]) {
								CCH.map.buildGeocodingPopup({
									locations: json.locations
								});

							}

							$(window).trigger('cch.searchbar.submit.success', {
								query: query,
								response: json
							});
						}
					});
				}

				$(window).trigger('cch.search.geocode.submit', {
					query: query
				});
			});
		},
		transformBBOX3857to4326: function(extent) {
			return extent.transform(new OpenLayers.Projection('EPSG:3857'), new OpenLayers.Projection('EPSG:4326'));
		},
		updateSearchBBOX: function(extent) {
			me.north.html(extent.top.toFixed(4));
			me.south.html(extent.bottom.toFixed(4));
			me.west.html(extent.left.toFixed(4));
			me.east.html(extent.right.toFixed(4));
		},
		getCurrentBBOX: function() {
			return [
				parseFloat(me.west.html()),
				parseFloat(me.south.html()),
				parseFloat(me.east.html()),
				parseFloat(me.north.html())
			];
		},
		buildMap: function() {
			var miniMap = new OpenLayers.Map('item-search-map', {
				projection: "EPSG:900913",
				displayProjection: new OpenLayers.Projection("EPSG:900913")
			});


			miniMap.addLayer(new OpenLayers.Layer.XYZ("Light Gray Base",
					"http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}",
					{
						sphericalMercator: true,
						isBaseLayer: true,
						numZoomLevels: 17,
						wrapDateLine: true
					}
			));

			miniMap.addLayer(new OpenLayers.Layer.XYZ("Light Gray Reference",
					"http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/${z}/${y}/${x}",
					{
						sphericalMercator: true,
						isBaseLayer: false,
						numZoomLevels: 17,
						wrapDateLine: true
					}
			));

			miniMap.zoomToMaxExtent();
			var extent = me.transformBBOX3857to4326(miniMap.getExtent());
			me.updateSearchBBOX(extent);


			miniMap.events.on({
				'moveend': function(evt) {
					var map = evt.object;
					var extent = me.transformBBOX3857to4326(map.getExtent());
					me.updateSearchBBOX(extent);
				}
			});
		},
		isMapVisible: function() {
			return $('#item-search-row-map').css('display') !== 'none';
		},
		bindSearchModalButton: function() {
			me.buildMap();

			me.searchContainer.on({
				'click': function() {
					me.modalContainer.modal('show');
				}
			});

			me.submitButton.on({
				'click': function() {
					me.modalContainer.modal('hide');
					$(window).trigger('cch.search.item.submit', {
						'top': me.north.html(),
						'bottom': me.south.html(),
						'left': me.west.html(),
						'right': me.east.html(),
						'popularity': me.popularityCb.is(':checked'),
						'keywords': me.keywordInput.val(),
						'themes': me.themeInput.find('option:selected').toArray().map(function(option) {
							return option.value;
						})
					});
				}
			});
		}
	});
};