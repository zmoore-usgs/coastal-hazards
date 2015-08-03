/**
 * Represents the functionality used to walk through the tutorial on the front 
 */
var CCH = CCH === undefined ? {} : CCH;

CCH.intro = (function () {

	var intro = new introJs(),
			steps = [
				{
					element: '.panel:nth-child(1)',
					intro: 'This is an item. Information and products are organized within three coastal change hazard themes: 1) extreme storms, 2) shoreline change, and 3) sea-level rise. Each data item represents an individual research product, with some items grouped together to show the breadth of the topic and make it easy to explore.',
					position: 'left',
					name: 'map',
					onbeforechange: function (targetEle) {
						$('#application-slide-items-container').css('display', 'block');
						if (!$('.panel-collapse').hasClass('in')) {
							var firstBellowId = $(CCH.ui.accordion.getBellows()[0]).data().id;
							CCH.ui.accordion.explore(null, {
								id: firstBellowId
							});
						}
						if ($('.modal-content-share').css('display', 'block')) {
							$('.close').click();
						}
						CCH.ui.bucketSlide.close();
					}
				},
				{
					element: '.application-card-add-bucket-btn',
					intro: 'Click the "Add To Bucket icon" to save the current item or aggregation in your bucket and interact with it there.',
					position: 'left',
					name: 'add-to-bucket',
					onbeforechange: function (targetEle) {
						$('#application-slide-items-container').css('display', 'block');
						if (!$('.panel-collapse').hasClass('in')) {
							var firstBellowId = $(CCH.ui.accordion.getBellows()[0]).data().id;
							CCH.ui.accordion.explore(null, {
								id: firstBellowId
							});
						}
						if ($('.modal-content-share').css('display', 'block')) {
							$('.close').click();
						}
						CCH.ui.bucketSlide.close();
					},
					onafterchange: function () {
						setTimeout(function () {
							$('.introjs-tooltip').addClass('addMobileTip');
						}, 355);
					}
				},
				{
					element: '.application-card-zoom-to-btn',
					intro: 'Click the "Zoom To" button to zoom to the extent of the data item.',
					position: 'left',
					name: 'zoom-to',
					onbeforechange: function (targetEle) {
						$('#application-slide-items-container').css('display', 'block');
						if (!$('.panel-collapse').hasClass('in')) {
							var firstBellowId = $(CCH.ui.accordion.getBellows()[0]).data().id;
							CCH.ui.accordion.explore(null, {
								id: firstBellowId
							});
						}
						if ($('.modal-content-share').css('display', 'block')) {
							$('.close').click();
						}
						CCH.ui.bucketSlide.close();
						if ($(window).width() > 991) {
							$(targetEle).click();
						}
					},
					onafterchange: function () {
						setTimeout(function () {
							$('.introjs-tooltip').addClass('zoomMobileTip');
						}, 355);
					}
				},
				{
					element: '.application-card-more-info-btn',
					intro: 'Click the "More Info" icon to get more details about the data item.',
					position: 'left',
					name: 'more-info',
					onbeforechange: function (targetEle) {
						$('#application-slide-items-container').css('display', 'block');
						if (!$('.panel-collapse').hasClass('in')) {
							var firstBellowId = $(CCH.ui.accordion.getBellows()[0]).data().id;
							CCH.ui.accordion.explore(null, {
								id: firstBellowId
							});
						}
						if ($('.modal-content-share').css('display', 'block')) {
							$('.close').click();
						}
						CCH.ui.bucketSlide.close();
						$('#application-slide-items-container').css('display', 'block');
					}
				},
				{
					element: '#OpenLayers_Control_Zoom_34',
					intro: 'Click these icons to zoom in or out on the map.',
					position: 'right',
					name: 'zoom-in-out',
					onbeforechange: function () {
						// If we currently have an item open, switch back to first item and close it
						var firstBellowId = $(CCH.ui.accordion.getBellows()[0]).data().id;
						if (CCH.ui.accordion.getCurrent()) {
							CCH.ui.accordion.explore(null, {id: firstBellowId});
						}
					}
				},
				{
					element: '#ol-zoom-to-location_innerImage',
					intro: 'Click this icon in order to zoom to your location. Some browsers and smartphones may request your permission to share your location.',
					position: 'right',
					name: 'zoom-to-you',
					onbeforechange: function (targetEle) {
						$(targetEle).click();
						if ($(window).width() < 992) {
							$('#application-slide-items-container').css('display', 'none');
						}
						if ($('.modal-content-share').css('display', 'block')) {
							$('.close').click();
						}
					}
				},
				{
					element: '#OpenLayers_Control_MaximizeDiv_innerImage',
					intro: 'Choose a base layer from World Imagery, Street, Topo, or Ocean here. You can also choose to hide or display Place Names.',
					position: 'right',
					name: 'baselayer',
					onbeforechange: function (targetEle) {
						if (!$('.cchMapLegendElement').is(':visible')) {
							var ribbonedId = Object.values(CCH.items.getItems()).reverse().find(function (i) {
								return i.ribboned;
							}).id;
							CCH.ui.accordion.explore(null, {id: ribbonedId});
						}
					}
				},
				{
					element: '.cchMapLegendContainer',
					intro: 'This is the legend, it displays information about the active map items. Bonus: When viewing the three coastal change probability data items on the map you can also scroll over the titles in the legend to highlight the layers on the map.',
					position: 'left',
					name: 'legend',
					onbeforechange: function (targetEle) {
						if (!$('.cchMapLegendElement').is(':visible')) {
							var ribbonedId = Object.values(CCH.items.getItems()).reverse().find(function (i) {
								return i.ribboned;
							}).id;
							CCH.ui.accordion.explore(null, {id: ribbonedId});
						}
						if ($(window).width() < 992) {
							$('#application-slide-items-container').css('display', 'none');
							if ($('application-slide-bucket-container').is(':visible')) {
								$('#animated-bucket-object').click();
							}
						}
					}
				},
				{
					element: '#app-navbar-search-container',
					intro: 'Use this search bar to find data and information in one or more coastal change hazards themes by name or location.',
					position: 'bottom',
					name: 'search-me',
					onbeforechange: function (targetEle) {
						$('#application-slide-items-container').css('display', 'block');
						if ($('.modal-content-share').css('display', 'block')) {
							$('.close').click();
						}
					}
				},
				{
					element: '.input-group-btn',
					intro: 'Click on this icon for a drop down menu of search options.',
					position: 'left',
					name: 'search-me-more',
					onbeforechange: function (targetEle) {
						$('#tourButton').remove();
					}
				},
				{
					element: '#app-navbar-search-dropdown-menu',
					intro: 'Choose one of these menu items to narrow down your search.',
					position: 'bottom',
					name: 'search-me-options',
					onbeforechange: function (targetEle) {
						CCH.ui.bucketSlide.close();
						$('#app-navbar-search-dropdown-toggle').dropdown('toggle');
						var button = $('<a id="tourButton" class="introjs-button">End Tour</a>');
						button.attr('href', CCH.CONFIG.contextPath + '/info/#mapContentArea');
						$('.introjs-tooltipbuttons').append(button);
						$('#application-slide-items-container').css('display', 'block');
					},
					onafterchange: function (targetEle) {
						setTimeout(function () {
							$('.input-group-btn').addClass('open');
						}, 450);
						setTimeout(function () {
							$('.introjs-tooltip').addClass('searchMobileTip');
						}, 355);
					}
				},
				{
					element: '#animated-bucket-object',
					intro: 'This is your bucket, it’s like a shopping cart for your data. Use the bucket to collect and download data, as well as to customize your map.',
					position: 'left',
					name: 'bucket',
					onbeforechange: function (targetEle) {
						if (CCH.CONFIG.params.id === "map") {
							window.location.href = CCH.CONFIG.contextPath + "/info/#mapContentArea";
						}
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						CCH.ui.bucketSlide.open();
						$('#tourButton').remove();

						if ($('.modal-content-share').css('display', 'block')) {
							$('.close').click();
						}
					}
				},
				{
					element: '#application-slide-bucket-container',
					intro: 'When you click on the bucket icon, data items you have added to your bucket will be visible here.',
					position: 'left',
					name: 'bucket-content',
					onbeforechange: function (targetEle) {
						CCH.ui.bucketSlide.open();
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						if ($(window).width() < 992) {
							$('#application-slide-items-container').css('display', 'none');
						}
					}

				},
				{
					element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-layer',
					intro: 'Click the eyeball icon to turn a data item on or off.',
					position: 'bottom',
					name: 'visibility',
					onEnter: function () {
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						return CCH.ui.bucketSlide.open();
					},
					onbeforechange: function (targetEle) {
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}

						intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
						intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
					}
				},
				{
					element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-navigation-container',
					intro: 'Click the up or down arrows to move the item above or below other layers. This affects the order of the data on the map.',
					position: 'left',
					name: 'move',
					onEnter: function () {
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						return CCH.ui.bucketSlide.open();
					},
					onbeforechange: function (targetEle) {
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
						intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
					}
				},
				{
					element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-download',
					intro: 'Click on the download icon to download a zipped (.zip) shapefile (.shp) of the item or aggregation of interest.',
					position: 'left',
					name: 'download',
					onEnter: function () {
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						return CCH.ui.bucketSlide.open();
					},
					onbeforechange: function (targetEle) {
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
						intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
					}
				},
				{
					element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-info',
					intro: 'Click on the information icon to get more details about the item. It will take you to the action center.',
					position: 'left',
					name: 'info',
					onEnter: function () {
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						return CCH.ui.bucketSlide.open();
					},
					onbeforechange: function (targetEle) {
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						if ($('.modal-content-share').css('display', 'block')) {
							$('.close').click();
						}
						intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
						intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
					},
					onafterchange: function () {
						setTimeout(function () {
							$('.introjs-tooltip').addClass('infoMobileTip');
						}, 355);
					}
				},
				{
					element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-share',
					intro: 'Click the share icon to get a short link useful for sharing this item on social media, or to send to colleagues and friends.',
					position: 'left',
					name: 'share',
					onEnter: function () {
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						return CCH.ui.bucketSlide.open();
					},
					onbeforechange: function (targetEle) {
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						$('#' + CCH.ui.SHARE_TWITTER_BUTTON_ID).empty();
						CCH.ui.displayShareModal(CCH.CONFIG.ui.endpoints.tutorial);
						intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
						intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
					},
					onafterchange: function () {
						setTimeout(function () {
							$('.introjs-tooltip').addClass('shareMobileTip');
						}, 355);
					}
				},
				{
					element: '.modal-content',
					intro: 'You can also tweet the item directly from here.',
					position: 'bottom',
					name: 'share-url',
					onEnter: function () {
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						return CCH.ui.bucketSlide.open();
					},
					onbeforechange: function (targetEle) {
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						$('#' + CCH.ui.SHARE_TWITTER_BUTTON_ID).empty();
						if ($('.modal-content-share').css('display', 'none')) {
							CCH.ui.displayShareModal(CCH.CONFIG.ui.endpoints.tutorial);
						}
						intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
						intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
					}
				},
				{
					element: '.modal-content #modal-share-summary-url-inputbox',
					intro: 'Copy this URL to save your session and share it with a friend or colleague.',
					position: 'bottom',
					name: 'url-box',
					onEnter: function () {
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						return CCH.ui.bucketSlide.open();
					},
					onbeforechange: function (targetEle) {
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						$('#' + CCH.ui.SHARE_TWITTER_BUTTON_ID).empty();
						if ($('.modal-content-share').css('display', 'none')) {
							CCH.ui.displayShareModal(CCH.CONFIG.ui.endpoints.tutorial);
						}
						$('.modal-content').css('display', 'block');
						intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
						intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
					},
					onafterchange: function () {
						setTimeout(function () {
							$('.introjs-tooltip').addClass('urlMobileTip');
						}, 355);
					}
				},
				{
					element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-remove',
					intro: 'Click the trash can icon to remove an item from your bucket.',
					position: 'left',
					name: 'remove',
					onEnter: function () {
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						return CCH.ui.bucketSlide.open();
					},
					onbeforechange: function (targetEle) {
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						$('#tourButton').remove();
						$('.modal-content').css('display', 'none');

						intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
						intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
					}
				},
				{
					element: '#share-bucket',
					intro: 'To get a short URL for the contents for all items in the bucket, click the Share Bucket button.',
					position: 'left',
					name: 'share-bucket',
					onbeforechange: function (targetEle) {
						CCH.ui.bucketSlide.open();
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
					}
				},
				{
					element: '#clear-bucket',
					intro: 'To clear the contents for all items in the bucket, click the Clear Bucket button.',
					position: 'left',
					name: 'clear-bucket',
					onbeforechange: function (targetEle) {
						CCH.ui.bucketSlide.open();
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						$('#tourButton').remove();
					},
					onafterchange: function () {
						setTimeout(function () {
							$('.introjs-tooltip').addClass('clearMobileTip');
						}, 355);
					}
				},
				{
					element: '#hide-your-bucket',
					intro: 'To collapse the Bucket and return to the three coastal change hazards themes, click the Hide Bucket button.',
					position: 'right',
					name: 'hide-bucket',
					onbeforechange: function (targetEle) {
						CCH.ui.bucketSlide.open();
						if ($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')) {
							$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
						}
						var button = $('<a id="tourButton" class="introjs-button">End Tour</a>');
						button.attr('href', CCH.CONFIG.contextPath + '/info/#bucketContentArea');
						$('.introjs-tooltipbuttons').append(button);
					}
				}
			],
			updateForMobile = function () {

				//Removing Steps that don't exist on mobile
				steps.removeAt(4);

				//Changing position of text to fit on mobile
				steps[0].position = 'bottom';
				steps[1].position = 'top';
				steps[2].position = 'top';
				steps[3].position = 'top';
				steps[6].position = 'top';
				steps[8].position = 'right';
				steps[9].position = 'bottom';
				steps[11].position = 'top';
				steps[12].position = 'top';
				steps[14].position = 'top';
				steps[15].position = 'top';
				steps[16].position = 'top';
				steps[21].position = 'top';
				steps[22].position = 'top';
			};


	intro.onbeforechange(function (targetEle) {
		var func = this._introItems[intro._currentStep].onbeforechange;
		if (func) {
			func.call(this, targetEle);
		}
	});

	intro.onafterchange(function (targetEle) {
		var func = this._introItems[intro._currentStep].onafterchange;
		if (func) {
			func.call(this, targetEle);
		}
	});

	intro.onchange(function (targetEle) {
		var func = this._introItems[intro._currentStep].onchange;
		if (func) {
			func.call(this, targetEle);
		}
		ga('send', 'event', {
			'eventCategory': 'search',
			'eventAction': 'frontTutorialStepChanged',
			'eventLabel': 'tutorial event'
		});
	});

	intro.onexit(function () {
		if ($('#application-slide-items-container').css('display', 'none')) {
			$('#application-slide-items-container').css('display', 'block');
		}
		ga('send', 'event', {
			'eventCategory': 'search',
			'eventAction': 'frontTutorialExited',
			'eventLabel': 'tutorial event'
		});
		window.location.href = CCH.CONFIG.contextPath;
	});
	intro.oncomplete(function () {
		if ($('#application-slide-items-container').css('display', 'none')) {
			$('#application-slide-items-container').css('display', 'block');
		}
		ga('send', 'event', {
			'eventCategory': 'search',
			'eventAction': 'frontTutorialExited',
			'eventLabel': 'tutorial event'
		});
		window.location.href = CCH.CONFIG.contextPath;
	});

	return {
		intro: intro,
		start: function (step) {
			CCH.CONFIG.ui.isTouring = true;
			var startingStep = step;

			if (CCH.ui.isSmall()) {
				updateForMobile();
			}

			intro.setOptions({
				showStepNumbers: false,
				showBullets: false,
				showProgress: true,
				steps: steps
			});

			// The starting will start as a string. The string may be a number
			// or a name of a step. 
			if (startingStep) {
				if (isNaN(startingStep)) {
					// Find the index of the step with a given name
					var idx = steps.findIndex(function (s) {
						return s.name === startingStep;
					});
					// If the name matches a step, start at that step
					if (idx !== -1) {
						var step = steps[idx];

						if (step.hasOwnProperty('onEnter')) {
							step.onEnter().done(function () {
								intro.start();
								intro.goToStep(idx + 1); // Steps are 1-based
							});
						} else {
							intro.start();
							intro.goToStep(idx + 1);
						}
					}
				} else {
					// Starting step is a number. Make sure it's a valid integer 
					// greater than 0 and it is within the range of our steps
					startingStep = parseFloat(startingStep);
					if (startingStep - 1 <= steps.length + 1 && startingStep > 1 && Number.isInteger(startingStep)) {
						var step = steps[startingStep - 1];
						if (step.hasOwnProperty('onEnter')) {
							step.onEnter().done(function () {
								intro.goToStep(startingStep); // Steps are 1-based
							});
							intro.start();
						} else {
							intro.start();
							intro.goToStep(startingStep);
						}
					}
					intro.start();
				}
			}

			$(window).on('cch.ui.resizing', function () {
				intro.exit();
			});
		}
	};
})();
