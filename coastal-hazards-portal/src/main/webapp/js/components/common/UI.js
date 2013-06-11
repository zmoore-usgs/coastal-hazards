CCH.UI = function(args) {
	CCH.LOG.info('UI.js::constructor: UI class is initializing.');
	var me = (this === window) ? {} : this;
	me.spinner = args.spinner;
	me.searchbar = args.searchbar;
	me.mapdiv = args.mapdiv;
	me.descriptionDiv = args.descriptionDiv;
	me.magicResizeNumber = 767;
	me.minimumHeight = args.minimumHeight || 480;
	me.previousWidth = $(window).width();
	me.currentSizing = '';
	CCH.LOG.debug('UI.js::constructor: UI class initialized.');
	return $.extend(me, {
		init: function() {
			this.bindSearchInput();
			this.bindWindowResize();
			this.bindSubmenuButtons();

			var currWidth = me.previousWidth;
			if (currWidth <= me.magicResizeNumber) {
				me.currentSizing = 'small';
			} else if (currWidth > me.magicResizeNumber) {
				me.currentSizing = 'large';
			}

			$(window).resize();
		},
		bindWindowResize: function() {
			$(window).resize(function() {
				var currWidth = $(window).width();
				var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height();

				if (contentRowHeight < me.minimumHeight) {
					contentRowHeight = me.minimumHeight;
				}

				var updated = false;
				if (me.previousWidth > me.magicResizeNumber && currWidth <= me.magicResizeNumber) {
					CCH.LOG.debug('resize-small');
					me.currentSizing = 'small';
					updated = true;
				} else if (me.previousWidth <= me.magicResizeNumber && currWidth > me.magicResizeNumber) {
					CCH.LOG.debug('resize-large');
					me.currentSizing = 'large';
					updated = true;
				}

				if (me.currentSizing === 'small') {
					$('body').css({
						'padding-left': '0px',
						'padding-right': '0px'
					});
					$('#application-container').css({
						'padding-left': '0px',
						'padding-right': '0px'
					});
					var descriptionHeight = Math.round(contentRowHeight * .30);
					if (descriptionHeight < 280) {
						descriptionHeight = 280;
					}
					me.descriptionDiv.height(descriptionHeight);
					me.mapdiv.height(contentRowHeight - descriptionHeight);

				} else if (me.currentSizing === 'large') {
					$('body').css({
						'padding-left': '20px',
						'padding-right': '20px'
					});
					$('#application-container').css({
						'padding-left': '20px',
						'padding-right': '20px'
					});
					me.mapdiv.height(contentRowHeight);
					me.descriptionDiv.height(contentRowHeight);
				}

				if (updated) {
					CONFIG.ui.createSlideshow();
				}

				me.previousWidth = currWidth;
			});
		},
		popoverClickHandler: function(e) {
			var container = $(this);
			if (!CONFIG.popupHandling.isVisible) {
				$(container).popover('show');
				CONFIG.popupHandling.clickedAway = false;
				CONFIG.popupHandling.isVisible = true;
				e.preventDefault();
			}
		},
		popoverShowHandler: function() {
			var container = $(this);
			var closePopovers = function(e) {
				if (CONFIG.popupHandling.isVisible && CONFIG.popupHandling.clickedAway && !$(e.target.offsetParent).hasClass('popover')) {
					$(document).off('click', closePopovers);
					$(container).popover('hide');
					CONFIG.popupHandling.isVisible = false;
					CONFIG.popupHandling.clickedAway = false;
				} else {
					CONFIG.popupHandling.clickedAway = true;
				}
			};
			$(document).off('click', closePopovers);
			$(document).on('click', closePopovers);
		},
		bindSubmenuButtons: function() {
			['storms', 'vulnerability'].each(function(item) {
				$('#accordion-group-' + item + '-view').popover({
					html: true,
					placement: 'right',
					trigger: 'manual',
					title: 'View ' + item.capitalize(),
					container: 'body',
					content: "<ul><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li></ul>"
				}).on({
					click: CCH.CONFIG.ui.popoverClickHandler,
					shown: CCH.CONFIG.ui.popoverShowHandler
				});

				$('#accordion-group-' + item + '-learn').popover({
					html: true,
					placement: 'right',
					trigger: 'manual',
					title: 'Learn About ' + item.capitalize(),
					container: 'body',
					content: "<ul><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li><li>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem </li></ul>"
				}).on({
					click: CCH.CONFIG.ui.popoverClickHandler,
					shown: CCH.CONFIG.ui.popoverShowHandler
				});
			});
		},
		bindSearchInput: function() {
			me.searchbar.submit(function(evt) {
				var query = $('.search-query').val();
				if (query) {
					$.ajax({
						type: 'GET',
						url: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find',
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

								CCH.CONFIG.map.buildGeocodingPopup({
									locations: json.locations
								});

							} else {
							}
						}
					});
				}

			});
		},
		buildSlide: function(args) {
			var itemId = args.itemId;
			var item = CCH.CONFIG.popularity.getById({
				'id': itemId
			});

			if (item) {
				var containerDiv = $('<div />').addClass('description-container container-fluid');
				var toolbarRow = $('<div />').addClass('row-fluid description-button-row text-center');
				var buttonToolbar = $('<div />').addClass('btn-toolbar');
				var buttonGroup = $('<div />').addClass('btn-group');
				var titleRow = $('<div />').addClass('description-title-row row-fluid');
				var descriptionRow = $('<div />').addClass('description-description-row row-fluid');
				var info = $('<button />').addClass('btn').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-zoom-in icon-zoom-in slide-button muted'));
				var tweet = $('<button />').addClass('btn').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-twitter icon-twitter slide-button muted'));
				var pause = $('<button />').addClass('btn btn-pause-play').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-pause-play icon-pause slide-button muted'));
				var back = $('<button />').addClass('btn').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-fast-backward icon-fast-backward slide-button muted'));
				var buttons = [info, tweet, pause, back];

				buttons.each(function(btn) {
					$(btn).on('mouseover', function() {
						$(this).find('i').removeClass('muted');
					});
					$(btn).on('mouseout', function() {
						$(this).find('i').addClass('muted');
					});
				});
                info.on({
                    'click': function(evt) {
                        CCH.CONFIG.ui.slider('autoSlidePause');
                        CCH.CONFIG.map.clearBoundingBoxMarkers();
                        CCH.CONFIG.map.zoomToBoundingBox({
                            "bbox": item.bbox,
                            "fromProjection": "EPSG:4326"
                        });
                        CCH.CONFIG.ows.displayData({
                            "item": item,
                            "type": item.type
                        });
                    }
                });

				containerDiv.append(toolbarRow);
				toolbarRow.append(buttonToolbar);
				buttonToolbar.append(buttonGroup);
				buttonGroup.append(buttons);

				var imageColumn = $('<div />').addClass('description-image-column span1 hidden-phone');
				if (item.type === 'storms') {
					containerDiv.addClass('description-container-storms');
				} else if (item.type === 'vulnerability') {
					containerDiv.addClass('description-container-vulnerability');
				} else {
					containerDiv.addClass('description-container-historical');
				}
				
				var titleColumn = $('<div />').addClass('description-title-column').append($('<p />').addClass('description-title').html(item.name));

				titleRow.append(titleColumn);

                // TODO description should come from summary service (URL in item)
				descriptionRow.append($('<p />').addClass('slide-vertical-description unselectable').html(item.summary.medium));

				containerDiv.append(titleRow, descriptionRow);
				if (CCH.CONFIG.ui.currentSizing === 'large') {
					containerDiv.addClass('description-container-large');
				} else if (CCH.CONFIG.ui.currentSizing === 'small') {
					containerDiv.addClass('description-container-small');
				}
			}
			containerDiv.data('popItem', item);
			return containerDiv;
		},
		bindShareMenu: function(args) {
			var menuItem = args.menuItem;
			menuItem.popover({
				html: true,
				placement: 'right',
				trigger: 'manual',
				title: 'Share Session',
				container: 'body',
				content: "<div class='container-fluid' id='prepare-container'><div>Preparing session export...</div></div>"
			}).on({
				'click': CCH.CONFIG.ui.popoverClickHandler,
				'shown': function() {
					CCH.CONFIG.session.getMinifiedEndpoint({
						callbacks: [
							function(args) {
								var response = args.response;
								var url = args.url;

								// URL controlset
								var container = $('<div />').addClass('container-fluid');
								var row = $('<div />').addClass('row-fluid');
								var controlSetDiv = $('<div />');
								container.append(row.append(controlSetDiv));
								$('#prepare-container').replaceWith(container);


								var goUsaResponse = JSON.parse(response.response);
								if (goUsaResponse.response.statusCode && goUsaResponse.response.statusCode.toLowerCase() === 'error') {
									CCH.LOG.warn(response.response);
								} else {
									url = goUsaResponse.response.data.entry[0].short_url;
								}
								controlSetDiv.html('Use the following URL to share your current view<br /><br /><b>' + url + '</b>');
							}
						]
					});
					CCH.CONFIG.ui.popoverShowHandler.call(this);
				}
			});
		},
		showSpinner: function() {
			me.spinner.fadeIn();
		},
		hideSpinner: function() {
			me.spinner.fadeOut();
		},
		slider: function() {
			var iosslider = $('#iosslider-container');
			var sliderFunct;
			if (CCH.CONFIG.ui.currentSizing === 'large') {
				sliderFunct = iosslider.iosSliderVertical;
			} else if (CCH.CONFIG.ui.currentSizing === 'small') {
				sliderFunct = iosslider.iosSlider;
			}
			return sliderFunct.apply(iosslider, arguments);
		},
		createSlideshow: function(args) {
			setTimeout(function(args) {
				args = args || {};
				var results = args.results || CCH.CONFIG.popularity.results.sortBy(function(result) {
					return parseInt(result.hotness);
				}, true);

				$('#iosslider-container').iosSliderVertical('destroy');
				$('#iosslider-container').iosSlider('destroy');
				$('.iosSlider').remove();

				var sliderContainer = $('<div />').addClass('iosSlider').attr('id', 'iosslider-container');
				var sliderUl = $('<div />').addClass('slider').attr('id', 'iosslider-slider');
				sliderContainer.append(sliderUl);

				$('#description-wrapper').append(sliderContainer);

				results.each(function(result) {
					var item = CCH.CONFIG.ui.buildSlide({
						'itemId': result.id
					});

					var slide = $('<div />').addClass('slide well well-small').append(item);
					$('#iosslider-slider').append(slide);
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
						var buttons = $(slide).find('.description-button-row');
						var title = $(slide).find('.description-title-row');
						var descr = $(slide).find('.description-description-row');
						var descrDiv = $(descr).find('p');

						var slideHeight = buttons.height() + title.height() + descrDiv.height();
						if (slideHeight > (event.sliderContainerObject.height() - 10)) {
							slideHeight = event.sliderContainerObject.height() - 10;
						}

						$(slide).css({
							'height': slideHeight + 'px'
						});

						descr.css({
							'height': slideHeight - buttons.height() - title.height() + 'px'
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
						var buttons = $(slide).find('.description-button-row');
						var title = $(slide).find('.description-title-row');
						var descr = $(slide).find('.description-description-row');
						var descrDiv = $(descr).find('p');
						
						var slideHeight = event.sliderContainerObject.height() - 10;

						$(slide).css({
							'height': slideHeight + 'px'
						});

						descr.css({
							'height': slideHeight - buttons.height() - title.height() + 'px'
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


					CCH.CONFIG.map.boxLayer.markers.each(function(mrk) {
						$(mrk.div).removeClass('marker-active');
						$(mrk.div).addClass('marker-inactive');
					});
                    
                    var item = $(event.currentSlideObject[0].firstChild).data('popItem');
                    var marker = CCH.CONFIG.map.addBoundingBoxMarker({
						bbox: item.bbox,
						fromProjection: 'EPSG:4326'
					});

					$(marker.div).data('slideOrder', event.currentSlideNumber);
					$(marker.div).on({
						click: function(evt) {
							var target = $(evt.target);
							var slideOrder = target.data('slideOrder');
							CCH.CONFIG.ui.slider('goToSlide', slideOrder);
							CCH.CONFIG.ui.slider('autoSlidePause');
							$('.slide-menu-icon-pause-play').removeClass('icon-pause').addClass('icon-play').parent().on({
								'click': function(evt) {
									CCH.CONFIG.ui.slider('autoSlidePlay');
									$('.slide-menu-icon-pause-play').removeClass('icon-play').addClass('icon-pause');
								}
							});

						}
					});
					$('.slide-menu-icon-pause-play').parent().on({
						'click': function(evt) {
							CCH.CONFIG.ui.slider('autoSlidePause');
							$('.slide-menu-icon-pause-play').removeClass('icon-pause').addClass('icon-play').parent().on({
								'click': function(evt) {
									CCH.CONFIG.ui.slider('autoSlidePlay');
									$('.slide-menu-icon-pause-play').removeClass('icon-play').addClass('icon-pause');
								}
							});
						}
					});
				};

				if (CCH.CONFIG.ui.currentSizing === 'large') {
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
				} else if (CCH.CONFIG.ui.currentSizing === 'small') {
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
					CCH.CONFIG.ui.createSlideshow();
				};

				$(window).off('orientationchange', orientationChange);
				$(window).on('orientationchange', orientationChange);
				$(window).resize();
			}, 1000);
		}
	});
};