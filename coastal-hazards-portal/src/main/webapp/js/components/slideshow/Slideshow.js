CCH.Objects.Slideshow = function(args) {
	CCH.LOG.info('Slideshow.js::constructor:Slideshow class is initializing.');
	var me = (this === window) ? {} : this;
	args = args || {};
	me.descriptionWrapper = $('#description-wrapper');
	return $.extend(me, {
		init: function() {
			$(window).on({
				'cch.data.items.loaded': me.createSlideshow,
				'cch.ui.resized': me.createSlideshow,
				'cch.navbar.pinmenu.item.clear.click': me.createSlideshow,
				'cch.navbar.pinmenu.button.pin.click': function(evt, items) {
					me.createSlideshow(items);
				},
				'resize': me.resize
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
			return sliderFunct;
		},
		destroySlider: function() {
			var container = $('#iosslider-container');
			CCH.cards.cards.length = 0;
			container.empty();
			container.iosSliderVertical('destroy');
			container.iosSlider('destroy');
			container.remove();
			$(window).trigger('cch.ui.slider.destroyed');
		},
		orientationChange: function(event) {
			event.preventDefault();
			me.createSlideshow();
		},
		toggleClassForActiveSlide: function() {
			$('.slide').each(function(i, slide) {
				$(slide).removeClass('slider-slide-active');
				$(slide).addClass('slider-slide-inactive');
			});

			var currentSlide = $('#iosslider-container').data().args.currentSlideObject;
			var currentSlideNumber = $('#iosslider-container').data().args.currentSlideNumber;
			currentSlide.removeClass('slider-slide-inactive');
			currentSlide.addClass('slider-slide-active');

			CCH.map.boxLayer.markers.each(function(mrk) {
				$(mrk.div).removeClass('marker-active');
				$(mrk.div).addClass('marker-inactive');
			});

			var cardId = $(currentSlide).attr('id');
			var card = CCH.cards.getById(cardId);
			CCH.map.addBoundingBoxMarker({
				card: card,
				fromProjection: 'EPSG:4326',
				slideOrder: currentSlideNumber
			});
		},
		resize: function() {
			if ('large' === CCH.ui.getCurrentSizing()) {
				me.resizeVertical();
			} else if ('small' === CCH.ui.getCurrentSizing()) {
				me.resizeHorizontal();
			}
		},
		resizeHorizontal: function() {
			var descriptionWrapper = $('#description-wrapper');
			var sliderContainer = $('.iosSlider');
			var sliderList = $('.slider');

			sliderContainer.css('height', (descriptionWrapper.height()) + 'px');
			sliderContainer.css('width', (descriptionWrapper.width()) + 'px');
			sliderList.css('height', (descriptionWrapper.height()) + 'px');

			$('.slide').each(function(index, slide) {
				var title = $(slide).find('.description-title-row');
				var descr = $(slide).find('.description-description-row');
				var descrDiv = $(descr).find('p');

				var slideHeight = sliderContainer.height() - 10;

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
		},
		resizeVertical: function() {
			var sliderContainer = $('.iosSliderVertical');
			var sliderList = $('.slider');
			sliderContainer.css({
				'height': $('#description-wrapper').height() + 'px'
			});
			sliderList.css({
				'height': sliderContainer.height() + 'px'
			});

			$('.slide').each(function(index, slide) {
				var title = $(slide).find('.description-title-row');
				var descr = $(slide).find('.description-description-row');
				var descrDiv = $(descr).find('p');

				var slideHeight = title.height() + descrDiv.height();
				if (slideHeight > (sliderContainer.height() - 10)) {
					slideHeight = sliderContainer.height() - 10;
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
		},
		createSlideshow: function(args) {
			// A timer is necessary here - Not having one here causes the browser to
			// crash. Guessing it is a resize loop issue
			setTimeout(function(args) {
				args = args || {};
				var currentSizing = CCH.ui.getCurrentSizing();
				var classname = currentSizing === 'large' ? 'iosSliderVertical' : 'iosSlider';

				// The slider will be rebuilt so destroy the old one
				me.destroySlider();

				// Create the slider container that will house the slides
				var sliderContainer = $('<div />').addClass(classname).attr('id', 'iosslider-container');
				var slideList = $('<div />').addClass('slider').attr('id', 'iosslider-slider');
				sliderContainer.append(slideList);
				me.descriptionWrapper.append(sliderContainer);

				// Build the card deck with items coming in from the arguments
				// or the list of items in the CCH.items object
				(args.items || CCH.items.getItems()).each(function(result) {
					// Build a card from the item
					var card = CCH.cards.buildCard({
						'itemId': result.id
					});
					CCH.cards.addCard(card);

					// Add the card's container (the DOM of the card) to the slide list
					var slide = $('<div />')
							.addClass('slide well well-small')
							.attr('id', result.id)
							.append(card.container);
					slideList.append(slide);

					// Append handlers to the card
					$(card).on({
						'card-button-pin-clicked': function(evt) {
							// When the card pin button is clicked, regardless of 
							// whether or not it was clicked on or off, stop the 
							// slideshow
							me.slider('autoSlidePause');
						},
						'card-pinned': function(evt) {
							// When a card is pinned, clear all of the bounding
							// box markers and display the card. Zoom to the combo
							// of all available layers
							var card = evt.currentTarget;

							CCH.map.clearBoundingBoxMarkers();

							CCH.map.displayData({
								"card": card
							});

							CCH.map.zoomToActiveLayers();

						},
						'card-unpinned': function(evt) {
							// When a card is unpinned, remove the layer from the 
							// map. The OpenLayers API doesn't have a 'removeLayerByName'
							// function :( 
							var card = evt.currentTarget;
							var layers = CCH.map.getMap().getLayersByName(card.name);

							if (layers.length) {
								layers.each(function(layer) {
									CCH.map.getMap().removeLayer(layer, false);
								});
							}

							CCH.map.zoomToActiveLayers();
						}
					});

					// After the event handlers are set, pin the card if it needs
					// to be pinned
					if (CCH.session.getPinnedItemIds().indexOf(card.item.id) !== -1) {
						card.pin();
					}
				});

				var defaultSliderOptions = {
					desktopClickDrag: true,
					snapToChildren: true,
					snapSlideCenter: true,
					keyboardControls: true,
					autoSlide: true,
					autoSlideTransTimer: 1500,
					unselectableSelector: $('.unselectable'),
					onSlideChange: me.toggleClassForActiveSlide,
					onSliderLoaded: function() {
						me.resize();
						me.toggleClassForActiveSlide();
					},
					onSliderResize: me.resize
				};
				if (currentSizing === 'large') {
					sliderContainer.iosSliderVertical(defaultSliderOptions);
				} else if (currentSizing === 'small') {
					sliderContainer.iosSlider(defaultSliderOptions);
				}

				$(window).off('orientationchange', me.orientationChange);
				$(window).on('orientationchange', me.orientationChange);
				$(window).resize();
			}, 1000, args);
		}
	});

};