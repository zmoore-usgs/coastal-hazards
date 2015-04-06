/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global splashUpdate*/
/*global initializeLogging*/
/*global CCH*/
/*global LOG*/
/*global err*/
$(document).ready(function () {
	"use strict";
	try {
		splashUpdate("Initializing Logging...");
		initializeLogging({
			LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
		});
		CCH.LOG = LOG;

		// For any ajax call going out, change the mouse pointer to a wait cursors, change it back on ajax stop/error
		$(document).ajaxStart(function () {
			$('body').css('cursor', 'wait');
		});
		$(document).ajaxStop(function () {
			$('body').css('cursor', 'default');
		});
		$(document).ajaxError(function () {
			$('body').css('cursor', 'default');
		});

		splashUpdate("Initializing Session Subsystem...");
		CCH.session = new CCH.Objects.Session();

		splashUpdate("Initializing Map...");
		CCH.map = new CCH.Objects.Front.Map({
			mapDiv: 'map'
		}).init();

		splashUpdate("Initializing OWS Services...");
		CCH.ows = new CCH.Util.OWS().init();

		splashUpdate("Initializing Items...");
		CCH.items = new CCH.Objects.Items();

		splashUpdate("Initializing UI...");
		CCH.ui = CCH.Objects.Front.UI({
			applicationOverlayId: 'application-overlay',
			headerRowId: 'header-row',
			footerRowId: 'footer-row',
			contentRowId: 'content-row',
			mapdivId: 'map',
			slideContainerDivId: 'application-slide-items-content-container',
			shareModalId: 'modal-content-share',
			shareUrlButtonId: 'modal-share-summary-url-button',
			shareInputId: 'modal-share-summary-url-inputbox',
			shareTwitterBtnId: 'multi-card-twitter-button',
			helpModalId: 'helpModal',
			helpModalBodyId: 'help-modal-body',
			slideItemsContainerId: 'application-slide-items-container',
			slideBucketContainerId: 'application-slide-bucket-container',
			slideSearchContainerId: 'application-slide-search-container',
			combinedSearch: new CCH.Objects.Widget.CombinedSearch(),
			accordion: new CCH.Objects.Widget.Accordion({
				containerId: 'application-slide-items-content-container'
			})
		});

		$(window).trigger('cch.app.initialized');
	} catch(err) {
		splashUpdate("There was a problem loading the page. Please try to reload or <a href='mailto:CCH_Help@usgs.gov?subject=Page%20Load%20Error&body=Error:%20"+err.stack+"%0D%0A%0D%0ADescribe%20what%20you%20were%20doing%20when%20this%20error%20occcurred:%20'>contact us</a>");
		$('.splash-spinner').fadeOut();
		console.log(err.stack);
	}

});
