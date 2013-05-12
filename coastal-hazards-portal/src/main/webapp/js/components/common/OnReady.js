$(document).ready(function() {
	splashUpdate("Loading Main module...");

	splashUpdate("Initializing Logging...");
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CONFIG.development ? 'debug' : 'info'
	});

	splashUpdate("Initializing Session...");
	CONFIG.session = new Session();

	splashUpdate("Initializing UI...");
	CONFIG.ui = new UI({
		spinner: $("#application-spinner"),
		searchbar: $('#app-navbar-search-form'),
		mapdiv: $('#map'),
		descriptionDiv: $('#description-wrapper')
	});
	CONFIG.ui.init();

	splashUpdate("Initializing Map...");
	CONFIG.map = new Map({
		mapDiv: 'map'
	});

	splashUpdate("Initializing OWS Services");
	CONFIG.ows = new OWS();
	CONFIG.popularity.populate({
		callbacks: {
			success: [
				function() {
					var flexslider = false;
					if (flexslider) {
						if (CONFIG.popularity.results) {
							var results = CONFIG.popularity.results.sortBy(function(result) {
								return parseInt(result.hotness);
							}, true);

							var sliderContainer = $('<div />').addClass('flexslider').attr('id', 'flex-slider-container');
							var sliderUl = $('<ul />').addClass('slides').attr('id', 'flex-slider-ul');
							sliderContainer.append(sliderUl);

							$('#description-wrapper').append(sliderContainer);

							results.each(function(result) {
								var item = CONFIG.ui.buildDescription({
									'cswId': result.id
								});
								var li = $('<li />').addClass('flexslider-li').append(item);
								$('#flex-slider-ul').append(li.append(item));
							});

							$('.flexslider').flexslider({
								direction: 'vertical',
								animation: 'slide'
							});
						}
					} else {
						if (CONFIG.popularity.results) {
							var results = CONFIG.popularity.results.sortBy(function(result) {
								return parseInt(result.hotness);
							}, true);

							var sliderContainer = $('<div />').addClass('iosSlider').attr('id', 'iosslider-container');
							var sliderUl = $('<div />').addClass('slider').attr('id', 'iosslider-slider');
							sliderContainer.append(sliderUl);

							$('#description-wrapper').append(sliderContainer);

							results.each(function(result) {
								var item = CONFIG.ui.buildDescription({
									'cswId': result.id
								});

								var slide = $('<div />').addClass('slide well').append(item);
								$('#iosslider-slider').append(slide);
							});

							sliderContainer.iosSliderVertical({
								desktopClickDrag: true,
								snapToChildren: true,
								snapSlideCenter: true,
								unselectableSelector: $('.unselectable'),
								onSliderLoaded: function(event) {

									$('.slide').each(function(index, slide) {
										$(slide).addClass('slider-vertical-slide-inactive');
										$(slide).css({
											'max-height': event.sliderContainerObject.height()
										});
										$(slide).find('.description-description-row').css({
											'max-height' : $(slide).height() - $(slide).find('.description-title-row').height(),
											'min-height' : '150px'	
										});
									});

									event.currentSlideObject.removeClass('slider-vertical-slide-inactive');
									event.currentSlideObject.removeClass('slider-vertical-slide-active');

								},
								onSliderResize: function(event) {
									$('#iosslider-container').css('width', $('#description-wrapper').width() + 'px');
									$('#iosslider-container').css('height', $('#description-wrapper').height() + 'px');

									$('#iosslider-slider').css('width', $('#iosslider-container').width() + 'px');
									$('#iosslider-slider').css('height', $('#iosslider-container').height() + 'px');

									$('.slide').each(function(index, slide) {
										$(slide).css({
											'max-height': event.sliderContainerObject.height(),
											'height': '40%',
											'width' : '100%'
										});
										$(slide).find('.description-description-row').css({
											'max-height': $(slide).height() - $(slide).find('.description-title-row').height()
										});
									});
								},
								onSlideChange: function(event) {
									$('.slide').each(function(i, slide) {
										$(slide).removeClass('slider-vertical-slide-active');
										$(slide).addClass('slider-vertical-slide-inactive');
									});

									event.currentSlideObject.removeClass('slider-vertical-slide-inactive');
									event.currentSlideObject.addClass('slider-vertical-slide-active');
								}
							});

							$('#iosslider-container').resize();
						}
					}

				}
			]
		}
	});

	var initAllStages = function() {
		splashUpdate("Initializing Application sections...");
		[CONFIG.storms, CONFIG.vulnerability, CONFIG.historical].each(function(item) {
			item.init();
		});
	};
	var sid = CONFIG.session.getIncomingSid();
	if (sid) {
		splashUpdate("Reading session information from server...");
		CONFIG.session.updateFromServer({
			sid: sid,
			callbacks: {
				success:
						[
							function() {
								splashUpdate("Applying session information to application...");
//								initAllStages();
//								[CONFIG.storms, CONFIG.vulnerability, CONFIG.historical, CONFIG.map].each(function(item) {
//									item.updateFromSession();
//								});
							}
						],
				error: []
			}
		});
	} else {
//		initAllStages();
//		CONFIG.storms.enterSection();
	}

	splashUpdate("Starting Application...");
	$('#application-overlay').fadeOut(2000, function() {
		$('#application-overlay').remove();
		splashUpdate = undefined;
	});

});