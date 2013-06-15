var CCH = CCH || {};
CCH.Objects.Search = function(args) {
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
	me.slider = args.slider;
	me.submitButton = args.submitButton;
	me.keywordInput = args.keywordInput;
	me.themeInput = args.themeInput;
	
	return $.extend(me, {
		init : function() {
			me.bindSearchInput();
			me.bindSearchModalButton();
		},
		bindSearchInput: function() {
			me.searchbar.submit(function(evt) {
				var query = $('.search-query').val();
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
		bindSearchModalButton: function() {
			var miniMap = new OpenLayers.Map('item-search-map', {
				projection: "EPSG:900913",
				displayProjection: new OpenLayers.Projection("EPSG:900913")
			});

			miniMap.addLayer(new OpenLayers.Layer.XYZ("Shaded Relief",
					"http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/${z}/${y}/${x}",
					{
						sphericalMercator: true,
						isBaseLayer: true,
						numZoomLevels: 14,
						wrapDateLine: true
					}
			));

			miniMap.zoomToMaxExtent();
			me.north.html(miniMap.getExtent().top);
			me.south.html(miniMap.getExtent().bottom);
			me.west.html(miniMap.getExtent().left);
			me.east.html(miniMap.getExtent().right);

			miniMap.events.on({
				'moveend': function(evt) {
					var map = evt.object;
					me.north.html(map.getExtent().top);
					me.south.html(map.getExtent().bottom);
					me.west.html(map.getExtent().left);
					me.east.html(map.getExtent().right);
				}
			});

			me.searchContainer.on({
				'click': function() {
					var popularityScores = CCH.CONFIG.popularity.results.map(function(result) {
						return parseInt(result.hotness);
					});
					var lowestPopularityScore = popularityScores.min();
					var highestPopularityScore = popularityScores.max();
					me.slider.slider({
						range: "min",
						value: highestPopularityScore,
						min: lowestPopularityScore,
						max: highestPopularityScore,
						slide: function(event, ui) {
							me.popularityInput.html(ui.value);
						}
					});

					me.popularityInput.html(me.popularityRange.slider("value"));
					me.modalContainer.modal('show');
				}
			});

			me.submitButton.on({
				'click': function() {
					var data = {
						'top': me.north.html(),
						'bottom': me.south.html(),
						'left': me.west.html(),
						'right': me.east.html(),
						'popularity': me.popularityInput.html(),
						'keywords': me.keywordInput.html(),
						'themes': me.themeInput.find('option:selected').toArray().map(function(option) {
							return option.value;
						})
					};

					me.modalContainer.modal('hide');

					$(window).trigger('cch.search.item.submit', {
						query: query
					});
				}
			});
		}
	});
};