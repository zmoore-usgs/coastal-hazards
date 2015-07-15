/**
 * Represents the functionality used to walk through the tutorial on the front 
 */
var CCH = CCH === undefined ? {} : CCH;

CCH.intro = (function () {
	
    var intro = new introJs(),
		steps = [
			{
				element: '.panel:nth-child(1)',
				intro: 'This is an item',
				position: 'left',
				name: 'show-item',
				onbeforechange: function (targetEle) {
					if(!$('.panel-collapse').hasClass('in')){
						$(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
					}
				}
			},
			{
				element: '.application-card-add-bucket-btn',
				intro: 'This is add to your bucket',
				position: 'left',
				name: 'add-to-bucket',
				onbeforechange: function (targetEle) {
					if(!$('.panel-collapse').hasClass('in')){
						$(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
					}
					if($('#application-slide-bucket-content').is(':visible')){
						$('#animated-bucket-object').click();
					}
				}
			},
			{
				element: '.application-card-zoom-to-btn',
				intro: 'This is zoom to button',
				position: 'left',
				name: 'zoom-to',
				onbeforechange: function (targetEle) {
					if(!$('.panel-collapse').hasClass('in')){
						$(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
					}
					if($('#application-slide-bucket-content').is(':visible')){
						$('#animated-bucket-object').click();
					}
					if($(window).width() > 991){
						$(targetEle).click();
					}

				}
			},
			{
				element: '.application-card-more-info-btn',
				intro: 'This is more info button',
				position: 'left',
				name: 'more-info',
				onbeforechange: function (targetEle) {
					if(!$('.panel-collapse').hasClass('in')){
						$(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
					}
					if($('#application-slide-bucket-content').is(':visible')){
						$('#animated-bucket-object').click();
					}
                                        $('#application-slide-items-container').css('display', 'block');
				}
			},
			{
				element: '#OpenLayers_Control_Zoom_34',
				intro: 'Zoom in and Out of the Map',
				position: 'right',
				name: 'zoom-in-out'
			},
			{
				element: '#ol-zoom-to-location_innerImage',
				intro: 'Zoom to your personal location',
				position: 'right',
				name: 'zoom-to-you',
				onbeforechange: function (targetEle) {
					$(targetEle).click();
                                        $('#application-slide-items-container').css('display', 'none');
				}
			},
			{
				element: '#OpenLayers_Control_MaximizeDiv_innerImage',
				intro: 'Change maps baselayer',
				position: 'right',
				name: 'baselayer'
			},
			{
				element: '.cchMapLegendContainer',
				intro: 'Maps legend',
				position: 'left',
				name: 'legend',
				onbeforechange: function(targetEle){
					if(!$('.cchMapLegendElement').is(':visible')){
						$(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
					}
                                        $('#application-slide-items-container').css('display', 'none');
				}
			},
			{
				element: '#app-navbar-search-container',
				intro: 'Search Here',
				position: 'bottom',
				name: 'search-me',
                                onbeforechange: function(targetEle){
                                     $('#application-slide-items-container').css('display', 'block');
                                }
			},
			{
				element: '.input-group-btn',
				intro: 'Switch Search Preference Here',
				position: 'left',
				name: 'search-me-more',
                                onbeforechange: function(targetEle){
                                    $('#tourButton').remove();
                                }
			},
			{
				element: '#app-navbar-search-dropdown-menu',
				intro: 'Search Options',
				position: 'bottom',
				name: 'search-me-options',
				onbeforechange: function(targetEle){
					$('#app-navbar-search-dropdown-toggle').dropdown('toggle');
                                        var button = $('<a id="tourButton" class="introjs-button">Info Page</a>');
                                        button.attr('href', CCH.CONFIG.contextPath + '/info/#mapContentArea');
                                        $('.introjs-tooltipbuttons').append(button);
				},
				onafterchange: function(targetEle){
					setTimeout(function(){ $('.input-group-btn').addClass('open'); }, 450);
				}
			},
			{
				element: '#animated-bucket-object',
				intro: 'This is your bucket, think of it as a shopping cart for data',
				position: 'left',
				name: 'bucket',
				onbeforechange: function(targetEle){
                                    if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
					$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
                                    }
					CCH.ui.bucketSlide.open();
                                        $('#tourButton').remove();
				}
			},
			{
				element: '#application-slide-bucket-container',
				intro: 'View saved data here',
				position: 'left',
				name: 'bucket-content',
				onbeforechange: function(targetEle){
					CCH.ui.bucketSlide.open();
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					}
				}

			},
			{
				element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-layer',
				intro: 'Toggle visibility',
				position: 'bottom',
				name: 'visibility',
				onEnter: function () {
					$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					return CCH.ui.bucketSlide.open();
				},
				onbeforechange: function(targetEle){
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					 }
					 
					intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
					intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
				}
			},
                        {
				element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-navigation-container',
				intro: 'Drawing Order',
				position: 'left',
				name: 'move',
				onEnter: function () {
					$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					return CCH.ui.bucketSlide.open();
				},
				onbeforechange: function(targetEle){
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					 }
					intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
					intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
				}
			},
                        {
				element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-download',
				intro: 'Download Item',
				position: 'left',
				name: 'download',
				onEnter: function () {
					$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					return CCH.ui.bucketSlide.open();
				},
				onbeforechange: function(targetEle){
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					 }
					intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
					intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
				}
			},
                        {
				element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-info',
				intro: 'Info Button',
				position: 'left',
				name: 'info',
				onEnter: function () {
					$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					return CCH.ui.bucketSlide.open();
				},
				onbeforechange: function(targetEle){
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					 }
                                         if($('.modal-content-share').css('display', 'block')){
                                             $('.close').click();
                                         }
					intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
					intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
				}
			},
                        {
				element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-share',
				intro: 'Share Bucket',
				position: 'left',
				name: 'share',
				onEnter: function () {
					$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					return CCH.ui.bucketSlide.open();
				},
				onbeforechange: function(targetEle){
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					 }
                                          $('#' + CCH.ui.SHARE_TWITTER_BUTTON_ID).empty();
                                         CCH.ui.displayShareModal(CCH.CONFIG.ui.endpoints.tutorial);
					intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
					intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
				}
			},
                        {
				element: '.modal-content',
				intro: 'Share Bucket with friends',
				position: 'bottom',
				name: 'share-url',
				onEnter: function () {
					$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					return CCH.ui.bucketSlide.open();
				},
				onbeforechange: function(targetEle){
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					 }
                                         $('#' + CCH.ui.SHARE_TWITTER_BUTTON_ID).empty();
                                         if($('.modal-content-share').css('display', 'none')){
                                             CCH.ui.displayShareModal(CCH.CONFIG.ui.endpoints.tutorial);
                                         }
					intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
					intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
				}
			},
                        {
				element: '.modal-content #modal-share-summary-url-inputbox',
				intro: 'Use the url to save a session and share',
				position: 'bottom',
				name: 'url-box',
				onEnter: function () {
					$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					return CCH.ui.bucketSlide.open();
				},
				onbeforechange: function(targetEle){
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					 }
                                         $('#' + CCH.ui.SHARE_TWITTER_BUTTON_ID).empty();
                                         if($('.modal-content-share').css('display', 'none')){
                                             CCH.ui.displayShareModal(CCH.CONFIG.ui.endpoints.tutorial);
                                         }
					intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
					intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
				}
			},
                        {
				element: '#application-slide-bucket-content-container .well:nth-child(2) .application-slide-bucket-container-card-button-remove',
				intro: 'Remove Item',
				position: 'left',
				name: 'remove',
				onEnter: function () {
					$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					return CCH.ui.bucketSlide.open();
				},
				onbeforechange: function(targetEle){
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					 }
                                         if($('.modal-content-share').css('display', 'block')){
                                             $('.close').click();
                                         }
                                         $('#tourButton').remove();
					 
					intro._introItems[intro._currentStep].element = document.querySelector(steps[intro._currentStep].element);
					intro._introItems[intro._currentStep].position = steps[intro._currentStep].position;
				}
			},
                        {
				element: '#bucket-manage-menu-drop',
				intro: 'Manage your bucket here',
				position: 'left',
				name: 'manage-bucket',
				onbeforechange: function(targetEle){
					CCH.ui.bucketSlide.open();
					if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
						$('.application-card-add-bucket-btn:not(.disabled):lt(3)').click();
					}
                                        var button = $('<a id="tourButton" class="introjs-button">Info Page</a>');
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
			steps[1].position = 'left';
			steps[2].position = 'top';
			steps[3].position = 'right';
			steps[6].position = 'top';
			steps[8].position = 'right';
			steps[9].position = 'bottom';
			steps[11].position = 'top';
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
    });

    return {
        intro: intro,
        start: function (step) {
            var startingStep = step;

            if (CCH.ui.isSmall()) {
                updateForMobile();
            }

            intro.setOptions({
                showStepNumbers: false,
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