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
	},
	linkbackClassElements,
	linkbackClickHandler = function (label) {
		ga('send', 'event', {
			'eventCategory': 'click',
			'eventAction': label
		});
		console.info(label);
	},
	linkbackClassEventLabels = {
		'cch-portal-link-storms': 'extremeStormsLinkClicked',
		'cch-portal-link-shoreline': 'shorelineChangeLinkClicked',
		'cch-portal-link-sealevel': 'seaLevelRiseLinkClicked'
	};

	// Back To Portal Button
	$('#cch-back-to-portal-button').on('click', function () {
		ga('send', 'event', {
			'eventCategory': 'click',
			'eventAction': 'backToPortalButtonClicked'
		});
	});
	$('#cch-back-to-portal-link').on('click', function () {
		ga('send', 'event', {
			'eventCategory': 'click',
			'eventAction': 'backToPortalButtonClicked'
		});
	});

	// Item-specific back to portal links
	// TODO- I tried doing this in a for-in loop using the linkbackClassEventLabels object
	// but all elements had their event handlers 
	linkbackClassElements = document.getElementsByClassName('cch-portal-link-storms');
	for (var ceIdx = 0; ceIdx < linkbackClassElements.length; ceIdx++) {
		linkbackClassElements[ceIdx].onclick = function () {
			linkbackClickHandler(linkbackClassEventLabels['cch-portal-link-storms']);
		};
	}

	linkbackClassElements = document.getElementsByClassName('cch-portal-link-shoreline');
	for (var ceIdx = 0; ceIdx < linkbackClassElements.length; ceIdx++) {
		linkbackClassElements[ceIdx].onclick = function () {
			linkbackClickHandler(linkbackClassEventLabels['cch-portal-link-shoreline']);
		};
	}

	linkbackClassElements = document.getElementsByClassName('cch-portal-link-sealevel');
	for (var ceIdx = 0; ceIdx < linkbackClassElements.length; ceIdx++) {
		linkbackClassElements[ceIdx].onclick = function () {
			linkbackClickHandler(linkbackClassEventLabels['cch-portal-link-sealevel']);
		};
	}

	window.onresize = resizeHandler;

	resizeHandler();
});