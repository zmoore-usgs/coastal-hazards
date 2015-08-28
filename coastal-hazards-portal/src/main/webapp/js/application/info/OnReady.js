/* global ga */
$(document).ready(function () {
	"use strict";
	var resizeHandler = function () {
		document.getElementById("content").style.height = '';
		var footer = document.getElementsByTagName('footer')[0],
			header = document.getElementsByTagName('header')[0],
			content = document.getElementById("content"),
			headerHeight = header.clientHeight,
			footerHeight = footer.clientHeight,
			windowHeight = window.innerHeight,
			contentHeight = content.clientHeight;

		if (headerHeight + contentHeight + footerHeight > windowHeight) {
			footer.style.top = headerHeight + contentHeight + 28 + 'px';
		} else {
			content.style.height = windowHeight - headerHeight - footerHeight - 2 + 'px';
		}
	};
	
	var sendGa = function(ea) {
		ga('send', 'event', {
			'eventCategory': 'info',
			'eventAction': ea,
			'eventLabel': 'info page button'
		});
	};

	$('a[href="#content"]').on('click', function () {
		sendGa('returnToTopClicked');
	});
	$('#cch-back-to-portal-button').on('click', function () {
		sendGa('backToPortalButtonClicked');
	});
	$('#cch-back-to-portal-link').on('click', function () {
		sendGa('backToPortalButtonClicked');
	});
	$('#learn-more-map').on('click', function () {
		sendGa('learnMoreMapClicked');
	});
	$('#learn-more-bucket').on('click', function () {
		sendGa('learnMoreBucketClicked');
	});
	$('#learn-more-ac').on('click', function () {
		sendGa('learnMoreActionCenterClicked');
	});
	$('#button-tour-map').on('click', function () {
		sendGa('buttonTourMapClicked');
	});
	$('#button-tour-bucket').on('click', function () {
		sendGa('buttonTourBucketClicked');
	});
	$('#button-tour-ac').on('click', function () {
		sendGa('buttonTourAcClicked');
	});
	
	
	

	$(window).on('resize', resizeHandler);
	resizeHandler();
});