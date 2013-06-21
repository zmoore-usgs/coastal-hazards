CCH.Slideshow = {
	slideContainers : [],
	slider: function() {
			var iosslider = $('#iosslider-container');
			var sliderFunct;
			if (CCH.ui.currentSizing === 'large') {
				sliderFunct = iosslider.iosSliderVertical;
			} else if (CCH.ui.currentSizing === 'small') {
				sliderFunct = iosslider.iosSlider;
			}
			return sliderFunct.apply(iosslider, arguments);
		},
	createSlideshow: function(args) {
		setTimeout(function(args) {
			args = args || {};

			$('#iosslider-container').iosSliderVertical('destroy');
			$('#iosslider-container').iosSlider('destroy');
			$('.iosSlider').remove();

			var sliderContainer = $('<div />').addClass('iosSlider').attr('id', 'iosslider-container');
			var sliderUl = $('<div />').addClass('slider').attr('id', 'iosslider-slider');
			sliderContainer.append(sliderUl);

			$('#description-wrapper').append(sliderContainer);

			CCH.items.getItems().each(function(result) {
				var cardContainer = CCH.cards.buildCard({
					'itemId': result.id
				});

				var slide = $('<div />').addClass('slide well well-small').append(cardContainer);

				$('#iosslider-slider').append(slide);

				var card = $(cardContainer.data('card'))[0];
				$(card).on({
					'card-button-pin-clicked': function(evt) {
						CCH.Slideshow.slider('autoSlidePause');
					},
					'card-pinned': function(evt) {
						var card = evt.currentTarget;

						CCH.Slideshow.slider('autoSlidePause');

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
							CCH.Slideshow.slider('autoSlidePlay');
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

			if (CCH.ui.currentSizing === 'large') {
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
			} else if (CCH.ui.currentSizing === 'small') {
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
				CCH.ui.createSlideshow();
			};

			$(window).off('orientationchange', orientationChange);
			$(window).on('orientationchange', orientationChange);
			$(window).resize();

		}, 1000, args);
	}
};