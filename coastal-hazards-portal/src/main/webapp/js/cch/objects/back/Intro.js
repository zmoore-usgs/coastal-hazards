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
					intro: 'Return To Map',
					position: 'right',
					name: 'button-back'
				},
				{
					element: '#add-bucket-link-button',
					intro: 'Add To Bucket',
					position: 'right',
					name: 'button-bucket'
				},
				{
					element: '#print-button',
					intro: 'Print Button',
					position: 'right',
					name: 'button-print'
				},
				{
					element: '#map-services-link-button',
					intro: 'Map Services Button',
					position: 'right',
					name: 'button-map-svcs'
				},
				{
					element: '#metadata-link-button',
					intro: 'Metadata Button',
					position: 'right',
					name: 'button-metadata'
				},
				{
					element: '#download-link-button',
					intro: 'Download Button',
					position: 'right',
					name: 'button-download'
				},
				{
					element: '#share-button',
					intro: 'Share Button',
					position: 'right',
					name: 'button-share'
				},
				{
					element: '#summary-row',
					intro: 'Summary',
					position: 'left',
					name: 'summary'
				},
				{
					element: '#publications-row',
					intro: 'Publications',
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
	});
	intro.onexit(function () {
		$('html, body').css({
			'overflow-x': 'auto',
			'overflow-y': 'auto'
		});
		window.location.href = CCH.CONFIG.contextPath + "/ui/info/item/" + CCH.CONFIG.item.id;
	});
	intro.oncomplete(function () {
		$('html, body').css({
			'overflow-x': 'auto',
			'overflow-y': 'auto'
		});
		window.location.href = CCH.CONFIG.contextPath + "/ui/info/item/" + CCH.CONFIG.item.id;
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