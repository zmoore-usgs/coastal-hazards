CCH.Objects.Slideshow = function(args) {
	CCH.LOG.info('Slideshow.js::constructor:Slideshow class is initializing.');
	var me = (this === window) ? {} : this;
	args = args || {};
    
	me.SLIDE_CONTAINER_WRAPPER_ID = args.slideContainerId || 'slide-container-wrapper';
	me.isStopped = false;
    
    // Listeners: 
    // window : 'cch.data.items.loaded'
    // window : 'cch.ui.redimensioned'
    // window : 'cch.navbar.pinmenu.item.clear.click'
    // window : 'cch.navbar.pinmenu.button.pin.click'
    
    $(window).on({
        'cch.data.items.loaded': function(evt, args) {
            me.createSlideshow(evt, args);
            me.stop();
        },
        'cch.ui.redimensioned': function(evt) {
            me.createSlideshow(evt);
        },
        'cch.navbar.pinmenu.item.clear.click': function(evt) {
            me.createSlideshow(evt);
            me.stop();
        },
        'cch.navbar.pinmenu.button.pin.click': function(evt, items) {
            me.createSlideshow(evt, items);
            me.stop();
        }
    });
    
	return $.extend(me, {
		stop: function() {
			me.isStopped = true;
			var container = $('#iosslider-container'),
                isSmall = CCH.ui.isSmall();
			if (!isSmall) {
				container.iosSliderVertical('autoSlidePause');
			} else {
				container.iosSlider('autoSlidePause');
			}
		},
		start: function() {
			var container = $('#iosslider-container'),
                isSmall = CCH.ui.isSmall();
			if (!isSmall) {
				container.iosSliderVertical('autoSlidePlay');
			} else {
				container.iosSlider('autoSlidePlay');
			}
		},
		goToSlide: function(slide) {
			var container = $('#iosslider-container'),
                isSmall = CCH.ui.isSmall();
			if (!isSmall) {
				container.iosSliderVertical('goToSlide', slide);
			} else {
				container.iosSlider('goToSlide', slide);
			}
		},
		updateSlides: function() {
			var container = $('#iosslider-container'),
                isSmall = CCH.ui.isSmall();
			if (!isSmall) {
				container.iosSliderVertical('update');
			} else {
				container.iosSlider('update');
			}
		},
		destroySlider: function() {
			CCH.cards.getCards().length = 0;
			var container = $('#iosslider-container');
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
			// A new slide has come into focus. There are a few things that need 
			// to be done.
			var container = $('#iosslider-container');
			var currentSlide = container.data().args.currentSlideObject;
			var currentSlideNumber = container.data().args.currentSlideNumber;

			// Visually inactivate ALL the slides
			$('.slide').each(function(i, slide) {
				$(slide).removeClass('slider-slide-active');
				$(slide).addClass('slider-slide-inactive');
			});

			// Only for the active slide, add the active class
			currentSlide.toggleClass('slider-slide-inactive slider-slide-active');

			var cardId = $(currentSlide).attr('id');
			var card = CCH.cards.getById(cardId);

			CCH.map.clearBoundingBoxMarkers();
			var marker = CCH.map.addBoundingBoxMarker({
				card: card,
				fromProjection: 'EPSG:4326',
				slideOrder: currentSlideNumber
			});

			if (CCH.cards.getPinnedCount()) {
				// If a card is pinned, we don't want to have the bounding box 
				// over it to stick around. Fade it out the bounding box over 2 seconds
				// and then remove it from the map
				CCH.map.clearBoundingBoxMarker(marker);
			}
		},
		resize: function() {
			if (!CCH.ui.isSmall()) {
				me.resizeVertical();
			} else {
				me.resizeHorizontal();
			}
		},
		/**
		 * Displays the bounding boxes of all the cards for a short 
		 * amount of time, then fades them out
		 */
		flashBoundingBoxes: function() {
			var cards = CCH.cards.getCards();
			var markers = [];
			cards.each(function(card) {
				markers.push(CCH.map.addBoundingBoxMarker({
					card: card,
					fromProjection: 'EPSG:4326'
				}));
			});
			
			// Keep the markers around for 1 second, then begin fadeout
			setTimeout(function() {
				markers.each(function(marker) {
					CCH.map.clearBoundingBoxMarker(marker);
				});
			},1500);
		},
		resizeHorizontal: function() {
			var descriptionWrapper = $('#' + me.SLIDE_CONTAINER_WRAPPER_ID);
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
				'height': $('#' + me.SLIDE_CONTAINER_WRAPPER_ID).height() + 'px'
			});
			sliderList.css({
				'height': sliderContainer.height() + 'px'
			});
		},
		createSlideshow: function(evt, args) {
			// A timer is necessary here - Not having one here causes the browser to
			// crash. Guessing it is a resize loop issue
			setTimeout(function(args) {
				args = args || {};
				var isSmall = CCH.ui.isSmall(),
                    classname = isSmall ? 'iosSlider' : 'iosSliderVertical',
                    flashBb = args.flashBb || true,
                    sliderContainer = $('<div />').addClass(classname).attr('id', 'iosslider-container'),
                    slideList = $('<div />').addClass('slider').attr('id', 'iosslider-slider');
                    
				// The slider will be rebuilt so destroy the old one
				me.destroySlider();

				sliderContainer.append(slideList);
				$('#' + me.SLIDE_CONTAINER_WRAPPER_ID).append(sliderContainer);

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
							.append(card.getContainer());
					slideList.append(slide);

					// Append handlers to the card
					$(card).on({
						'card-button-pin-clicked': function(evt) {
							// When the card pin button is clicked, regardless of 
							// whether or not it was clicked on or off, stop the 
							// slideshow
							me.stop();
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
							var layers = CCH.map.getMap().getLayersByName(card.item.id);

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
					if (CCH.session.getPinnedItemIds().indexOf(card.getItemId()) !== -1) {
						card.pin();
					}
				});

				var defaultSliderOptions = {
					//  Desktop click and drag fallback for the desktop slider
					desktopClickDrag: true,
					// Slider will slide to the closest child element on touch release
					snapToChildren: true,
					// When snapToChildren is true, this option will snap the slide to the center of the draggable area
					snapSlideCenter: true,
					// Keyboard arrows can be used to navigate the slider
					keyboardControls: true,
					// The css height in 'px' of the scrollbar
					scrollbarWidth: '3px',
					// Tab key can be used to navigate the slider forward
					tabToAdvance: true,
					// Enables automatic cycling through slides
					autoSlide: !me.isStopped,
					// The time (in milliseconds) required for all automatic animations to move between slides
					autoSlideTransTimer: 1500,
					// A jQuery selection (ex. $('.unselectable') ), each element returned by the selector will become removed from touch/click move events
					unselectableSelector: $('.unselectable'),
					// Show or hide the scrollbar when it is idle
					scrollbar: true,
					scrollbarHide: true,
					scrollbarDrag: false,
					// Executed when the slider has entered the range of a new slide,
					onSlideChange: function(evt) {
						LOG.debug('Slideshow.js:: Slide Changed');
						$(window).trigger('cch-slideshow-slide-changed', evt);
						me.toggleClassForActiveSlide();
					},
					// Executed when slider has finished loading initially
					onSliderLoaded: function() {
						LOG.debug('Slideshow.js:: Slider Loaded');
						$(window).trigger('cch-slideshow-slider-loaded');
						me.resize();
						if (flashBb) {
							me.flashBoundingBoxes();
						}
						me.toggleClassForActiveSlide();
					},
					// Executed when the window has been resized or a device has been rotated
					onSliderResize: function() {
						LOG.debug('Slideshow.js:: Slider Resized');
						$(window).trigger('cch-slideshow-slider-resized');
						me.resize();
					}
				};
				if (!isSmall) {
					LOG.debug('Slideshow.js:: Vertical Slider Loading');
					sliderContainer.iosSliderVertical($.extend(defaultSliderOptions, {
						// Currently mouse wheel scrolling is not fully compatible with browsers.
						// Causes an infinite loop in the vertical script that causes a crash
						mousewheelScroll: true,
						mousewheelScrollOverflow : true
					}));
				} else {
					LOG.debug('Slideshow.js:: Horizontal Slider Loading');
					sliderContainer.iosSlider($.extend(defaultSliderOptions, {
						scrollbarLocation: 'bottom'
					}));
				}

				$(window).off('orientationchange', me.orientationChange);
				$(window).on('orientationchange', me.orientationChange);
				// Adding a resize trigger here will help the application resize 
				// properly after the slideshow has been created. Without this here
				// the application often causes weird sizing issues due to incomplete 
				// resizing. This trigger ensures proper sizing.
				$(window).resize();
			}, 1000, args);
		}
	});

};