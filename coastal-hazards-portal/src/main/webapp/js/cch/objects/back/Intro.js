/**
 * Represents the functionality used to walk through the tutorial on the back 
 */
var CCH = CCH === undefined ? {} : CCH;
CCH.intro = (function () {
	"use strict";
	var intro = new introJs(),
			steps = [
				{
					element: '#application-link-button',
					intro: 'Return to the Map view of the Portal.',
					position: 'right',
					name: 'button-back'
				},
				{
					element: '#add-bucket-link-button',
					intro: 'Add the current item to your Bucket.',
					position: 'right',
					name: 'button-bucket'
				},
				{
					element: '#print-button',
					intro: 'Get a customizable printer-friendly summary of the data item.',
					position: 'right',
					name: 'button-print'
				},
				{
					element: '#map-services-link-button',
					intro: 'View available services that can be added to other mapping applications.',
					position: 'right',
					name: 'button-map-svcs'
				},
				{
					element: '#metadata-link-button',
					intro: 'View detailed information about this data item in a standardized format.',
					position: 'right',
					name: 'button-metadata'
				},
				{
					element: '#download-link-button',
					intro: 'Download the current item to your computer in shapefile format (.shp) for use in geospatial applications.',
					position: 'right',
					name: 'button-download'
				},
				{
					element: '#share-button',
					intro: 'Get a short URL to share this information with colleagues or bookmark it to come back later.',
					position: 'right',
					name: 'button-share'
				},
				{
					element: '#summary-row',
					intro: 'Here is a description of the item including details about how it was created and the geographic location the data pertain to.',
					position: 'left',
					name: 'summary'
				},
				{
					element: '#publications-row',
					intro: 'Provides a list of publications where the data were released and addiitonal resources of interest.',
					position: 'left',
					name: 'publications'
				}
			],
			updateForMobile = function () {
				CCH.ui.toggleControlCenterVisibility(true);
				CCH.ui.rotateArrow('down');
				[0, 1, 2, 3, 4, 5, 6].each(function (e) {
					steps[e].position = 'bottom';
				});
				[7, 8].each(function (e) {
					steps[e].position = 'top';
				});

				$('html, body').css({
					'overflow-x': 'visible',
					'overflow-y': 'visible'
				});
				
				// Because a user can get a tutorial going on any item, I need to 
				// check to figure out if the item has had buttons removed
				[5,3,2].each(function (e) {
					if ($(steps[e].element).hasClass('hidden')) {
						steps.removeAt(e);
					}
				});
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
			'eventAction': 'backTutorialStepChanged',
			'eventLabel': 'tutorial event'
		});
	});
	intro.onexit(function () {
		$('html, body').css({
			'overflow-x': 'auto',
			'overflow-y': 'auto'
		});
		ga('send', 'event', {
			'eventCategory': 'search',
			'eventAction': 'backTutorialExited',
			'eventLabel': 'tutorial event'
		});
		window.location.href = CCH.CONFIG.contextPath + "/info/#acContentArea";
	});
	intro.oncomplete(function () {
		$('html, body').css({
			'overflow-x': 'auto',
			'overflow-y': 'auto'
		});
		ga('send', 'event', {
			'eventCategory': 'search',
			'eventAction': 'backTutorialExited',
			'eventLabel': 'tutorial event'
		});
		window.location.href = CCH.CONFIG.contextPath + "/info/#acContentArea";
	});
	return {
		intro: intro,
		start: function () {
			
			if (CCH.ui.isSmall()) {
				updateForMobile();
			}

			intro.setOptions({
				showStepNumbers: false,
				steps: steps,
				scrollToElement: true
			});
			intro.start();
			$(window).on('resize', function () {
				intro.exit();
			});
		}
	};
})();
