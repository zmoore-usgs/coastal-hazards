CCH.Objects.Slideshow = function(args) {
	CCH.LOG.info('Slideshow.js::constructor:Slideshow class is initializing.');
	var me = (this === window) ? {} : this;
	args = args || {};
	me.slideContainers = [];
	return $.extend(me, {
		init: function() {
			$(window).on({
				'cch.data.items.loaded':  me.createSlideshow,
				'cch.ui.resized': me.createSlideshow,
				'cch.navbar.pinmenu.item.clear.click': me.createSlideshow,
				'cch.navbar.pinmenu.button.pin.click' : function(evt, items) {
					me.createSlideshow(items);
				}
			});
			return me;
		},
		slider: function() {
			var iosslider = $('#iosslider-container');
			var sliderFunct;
			var currentSizing = CCH.ui.getCurrentSizing();
			if (currentSizing === 'large') {
				sliderFunct = iosslider.iosSliderVertical;
			} else if (currentSizing === 'small') {
				sliderFunct = iosslider.iosSlider;
			}
			return sliderFunct.apply(iosslider, arguments);
		},
		createSlideshow: function(args) {
			setTimeout(function(args) {
				args = args || {};
				var currentSizing = CCH.ui.getCurrentSizing();

				$('#iosslider-container').iosSliderVertical('destroy');
				$('#iosslider-container').iosSlider('destroy');
				$('.iosSlider').remove();

				var sliderContainer = $('<div />').addClass('iosSlider').attr('id', 'iosslider-container');
				var sliderUl = $('<div />').addClass('slider').attr('id', 'iosslider-slider');
				sliderContainer.append(sliderUl);
				$('#description-wrapper').append(sliderContainer);

				(args.items || CCH.items.getItems()).each(function(result) {
					var cardContainer = CCH.cards.buildCard({
						'itemId': result.id
					});

					var slide = $('<div />').addClass('slide well well-small').append(cardContainer);

					$('#iosslider-slider').append(slide);

					var card = $(cardContainer.data('card'))[0];
					$(card).on({
						'card-button-pin-clicked': function(evt) {
							me.slider('autoSlidePause');
						},
						'card-pinned': function(evt) {
							var card = evt.currentTarget;

							me.slider('autoSlidePause');

							CCH.map.clearBoundingBoxMarkers();

							CCH.map.displayData({
								"card": card
							});

							CCH.map.zoomToActiveLayers();

						},
						'card-unpinned': function(evt) {
							var card = evt.currentTarget;
							var layers = CCH.map.getMap().getLayersByName(card.name);

							if (layers.length) {
								layers.each(function(layer) {
									CCH.map.getMap().removeLayer(layer, false);
								});
							}

							CCH.map.zoomToActiveLayers();

							if (CCH.map.getMap().getLayersBy('isItemLayer', true).length === 0) {
								me.slider('autoSlidePlay');
							}
						}
					});

					if (CCH.session.getPinnedItemIds().indexOf(card.item.id) !== -1) {
						card.pin();
					}
				});

				var resizeVertical = function(event) {
					toggleClassForActiveSlide(event);

					event.sliderContainerObject.css({
						'height': $('#description-wrapper').height() + 'px'
					});
					event.sliderObject.css({
						'height': event.sliderContainerObject.height() + 'px'
					});

					$('.slide').each(function(index, slide) {
						var title = $(slide).find('.description-title-row');
						var descr = $(slide).find('.description-description-row');
						var descrDiv = $(descr).find('p');

						var slideHeight = title.height() + descrDiv.height();
						if (slideHeight > (event.sliderContainerObject.height() - 10)) {
							slideHeight = event.sliderContainerObject.height() - 10;
						}

						$(slide).css({
							'height': slideHeight + 'px'
						});

						descr.css({
							'height': slideHeight - title.height() + 'px'
						});

						descrDiv.css({
							'max-height': descr.height()
						});
					});
				};

				var resizeHorizontal = function(event) {
					toggleClassForActiveSlide(event);
					var container = $(event.sliderContainerObject).parent();
					event.sliderContainerObject.css('height', (container.height()) + 'px');
					event.sliderObject.css('height', (container.height()) + 'px');

					$('.slide').each(function(index, slide) {
						var title = $(slide).find('.description-title-row');
						var descr = $(slide).find('.description-description-row');
						var descrDiv = $(descr).find('p');

						var slideHeight = event.sliderContainerObject.height() - 10;

						$(slide).css({
							'height': slideHeight + 'px'
						});

						descr.css({
							'height': slideHeight - title.height() + 'px'
						});

						descrDiv.css({
							'max-height': descr.height()
						});
					});
				};

				var toggleClassForActiveSlide = function(event) {
					$('.slide').each(function(i, slide) {
						$(slide).removeClass('slider-slide-active');
						$(slide).addClass('slider-slide-inactive');
					});

					event.currentSlideObject.removeClass('slider-slide-inactive');
					event.currentSlideObject.addClass('slider-slide-active');


					CCH.map.boxLayer.markers.each(function(mrk) {
						$(mrk.div).removeClass('marker-active');
						$(mrk.div).addClass('marker-inactive');
					});

					var card = $(event.currentSlideObject[0].firstChild).data('card');
					CCH.map.addBoundingBoxMarker({
						bbox: card.bbox,
						fromProjection: 'EPSG:4326',
						slideOrder: event.currentSlideNumber
					});
				};

				if (currentSizing === 'large') {
					sliderContainer.iosSliderVertical({
						desktopClickDrag: true,
						snapToChildren: true,
						snapSlideCenter: true,
						keyboardControls: true,
						autoSlide: true,
						autoSlideTransTimer: 1500,
						unselectableSelector: $('.unselectable'),
						onSliderLoaded: resizeVertical,
						onSliderResize: resizeVertical,
						onSlideChange: toggleClassForActiveSlide
					});
				} else if (currentSizing === 'small') {
					sliderContainer.iosSlider({
						desktopClickDrag: true,
						snapToChildren: true,
						snapSlideCenter: true,
						keyboardControls: true,
						autoSlide: true,
						autoSlideTransTimer: 1500,
						unselectableSelector: $('.unselectable'),
						onSliderLoaded: resizeHorizontal,
						onSliderResize: resizeHorizontal,
						onSlideChange: toggleClassForActiveSlide
					});
				}

				var orientationChange = function(event) {
					event.preventDefault();
					me.createSlideshow();
				};

				$(window).off('orientationchange', orientationChange);
				$(window).on('orientationchange', orientationChange);
				$(window).resize();

			}, 1000, args);
		}
	})

};