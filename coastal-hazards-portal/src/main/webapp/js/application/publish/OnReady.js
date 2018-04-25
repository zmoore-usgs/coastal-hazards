/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global initializeLogging*/
$(document).ready(function () {
	"use strict";

	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
	});

	CCH.LOG = LOG;

	$(document).ajaxStart(function () {
		$('body').css('cursor', 'wait');
	});
	$(document).ajaxStop(function () {
		$('body').css('cursor', 'default');
	});

	CCH.ows = new CCH.Util.OWS().init();

	CCH.ui = new CCH.Objects.Publish.UI();

	CCH.publish = new CCH.Publish({
		item: CCH.itemid || ''
	});

	CCH.Auth.checkAuthStatus().then(CCH.publish.init);
});