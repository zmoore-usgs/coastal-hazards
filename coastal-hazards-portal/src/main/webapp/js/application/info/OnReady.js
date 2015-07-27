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

	// Back To Portal Button
	$('#cch-back-to-portal-button').on('click', function () {
		ga('send', 'event', {
			'eventCategory': 'info',
			'eventAction': 'backToPortalButtonClicked',
			'eventLabel': 'info page button'
		});
	});
	$('#cch-back-to-portal-link').on('click', function () {
		ga('send', 'event', {
			'eventCategory': 'info',
			'eventAction': 'backToPortalButtonClicked',
			'eventLabel': 'info page button'
		});
	});
	

	$(window).on('resize', resizeHandler);
	resizeHandler();
});