/*global $, document, splashUpdate, initializeLogging, CONFIG, LOG, Session, UI, OWS, CCH */
$(document).ready(function () {
	"use strict";

	splashUpdate("Initializing Logging...");
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CONFIG.development ? 'debug' : 'info'
	});

	// Set up global jQuery AJAX properties
	$(document).ajaxStart(function () {
		LOG.trace('AJAX Call Started');
		$("#application-spinner").fadeIn();
	});
	$(document).ajaxStop(function () {
		LOG.trace('AJAX Call Finished');
		$("#application-spinner").fadeOut();
	});
	$.ajaxSetup({
		timeout: CONFIG.ajaxTimeout
	});

	splashUpdate("Initializing Sessions...");
	try {
		LOG.info('OnReady.js:: Initializing session objects');
		// Contains the pemanent session object which holds one or more sessions
		CONFIG.permSession = new CCH.Session('coastal-hazards', true);
		// Contains the non-permanent single-session object
		CONFIG.tempSession = new CCH.Session('coastal-hazards', false);
		var currentSessionKey = CONFIG.permSession.getCurrentSessionKey();
		LOG.info('OnReady.js:: Sessions created. User session list has ' + Object.keys(CONFIG.permSession.session.sessions).length + ' sessions.');
		LOG.info('OnReady.js:: Current session key: ' + currentSessionKey);
		CONFIG.tempSession.persistSession();
	} catch (e) {
		LOG.error('OnReady.js:: Session could not be read correctly');
		LOG.error(e);
		// This could probably be hardcoded into index but... here it is
		var modal = $('<div />').addClass('modal fade').attr('id', 'session-reset-modal')
			.append($('<div />').addClass('modal-header')
				.append($('<button />').attr({
					'type': 'button',
					'data-dismiss': 'modal',
					'aria-hidden': 'true'
				}).html('&times;').addClass('close'))
				.append($('<h3 />').html('Invalid Session State')))
			.append($('<div />').addClass('modal-body')
				.append('<p />')
				.html('Your session information is invalid or out of date. We strongly suggest you reset your session. You may also try reloading the application. We can not garuantee proper application functionality if you choose to keep your current session. For further information, check the browser logs.'))
			.append($('<div />').addClass('modal-footer')
				.append($('<a />').attr({
					'href': '#',
					'data-dismiss': 'modal',
					'aria-hidden': 'true'
				}).addClass('btn').html('Close'))
				.append($('<a />').attr('href', '#').addClass('btn').html('Reload').on('click', function () {
					location.reload();
				}))
				.append($('<a />').attr('href', '#').addClass('btn btn-primary').html('Reset Session').css('color', '#FFFFFF').on('click', function () {
					localStorage.removeItem('coastal-hazards');
					sessionStorage.removeItem('coastal-hazards');
					location.reload(true);
				})));
		$('body').append(modal);
		$('#application-overlay').fadeOut();
		$('#session-reset-modal').modal('show');
		return;
	}

	var setupAjaxError = function () {
		$(document).ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
			LOG.debug('AJAX Call Error: ' + thrownError);
			CONFIG.ui.showAlert({
				message: 'There was an error while communicating with the server. Check logs for more info. Please try again.',
				displayTime: 0
			});
			$("#application-spinner").fadeOut();
		});
	};

	// Utility class for the user interface
	splashUpdate("Initializing User Interface...");
	CONFIG.ui = new UI();

	// Map interaction object. Holds the map and utilities 
	splashUpdate("Initializing Map...");
	CONFIG.map = new Map();

	// Primarily a utility class
	splashUpdate("Initializing OWS services...");
	CONFIG.ows = new OWS();

	var interrogateSessionResources = function () {
		var loadApp = function (data, textStatus, jqXHR) {
			CONFIG.ui.work_stages_objects.each(function (stage) {
				stage.appInit();
				stage.populateFeaturesList(data, textStatus, jqXHR);
			});

			$('.qq-upload-button').addClass('btn btn-success');
			$('#application-overlay').fadeOut(2000, function () {
				$('#application-overlay').remove();
			});
		};

		CONFIG.ows.getWMSCapabilities({
			namespace: currentSessionKey,
			callbacks: {
				success: [
					CONFIG.tempSession.updateLayersFromWMS,
					loadApp
				],
				error: [loadApp]
			}
		});
	};
	
	var getPublishedLayers = function(){
		CONFIG.ows.getWMSCapabilities({
			namespace: CONFIG.name.published,
			callbacks: {
				success: [
					function () {
						LOG.debug('OnReady.js:: WMS Capabilities retrieved for published workspace');
						interrogateSessionResources();
						CONFIG.ui.precacheImages();
						setupAjaxError();
					}
				],
				error: [
					function (responseObj) {
						if (responseObj.data.status === 404) {
							CONFIG.ui.createModalWindow({
								headerHtml: 'Unable to interrogate OWS server',
								bodyHtml: 'The application could not interrogate the OWS server to get published layers.'
							});
							interrogateSessionResources();
							CONFIG.ui.precacheImages();
						} else {
						}
					}
				]
			}
		});
	};
	
	var getPublishedLayers = function(){
		CONFIG.ows.getWMSCapabilities({
			namespace: CONFIG.name.published,
			callbacks: {
				success: [
					function () {
						LOG.debug('OnReady.js:: WMS Capabilities retrieved for ' + CONFIG.name.published + ' workspace');
						interrogateSessionResources();
						CONFIG.ui.precacheImages();
						setupAjaxError();
					}
				],
				error: [
					function (responseObj) {
						if (responseObj.data.status === 404) {
							CONFIG.ui.createModalWindow({
								headerHtml: 'Unable to interrogate OWS server',
								bodyHtml: 'The application could not interrogate the OWS server to get published layers.'
							});
							interrogateSessionResources();
							CONFIG.ui.precacheImages();
						} else {
						}
					}
				]
			}
		});
	};
	
	var checkBiasWorkspace = function() {
		CONFIG.ows.getWMSCapabilities({
			namespace: CONFIG.name.proxydatumbias,
			callbacks: {
				success: [
					function () {
						LOG.debug('OnReady.js:: WMS Capabilities retrieved for ' + CONFIG.name.proxydatumbias + ' workspace');
						getPublishedLayers();
					}
				],
				error: [
					function (responseObj) {
						if (responseObj.data.status === 404) {
							CONFIG.ui.createModalWindow({
								headerHtml: 'Unable to interrogate OWS server',
								bodyHtml: 'The application could not interrogate the OWS server to get ' + CONFIG.name.proxydatumbias + ' layers.'
							});
						} 
					}
				]
			}
		});
	};

	CONFIG.ows.getWFSCapabilities({
		callbacks: {
			success: [
				function () {
					CONFIG.ui.appInit();

					LOG.info('OnReady.js:: Preparing call to OWS GetCapabilities');
					splashUpdate("Interrogating OWS server...");
					checkBiasWorkspace();
					splashUpdate("Starting Application...");
				}
			],
			error: [
				function (responseObj) {
					// At this point, we won't be able to properly run the application
					// so just show the error without removing the splash screen
					var errorMessage = '<br /> Error: ';
					
					if (responseObj && responseObj.data && responseObj.data.responseText) {
						errorMessage += responseObj.data.responseText;
					}
					
					splashUpdate("The OWS server could not be contacted. The application cannot be loaded. " + errorMessage);
					CONFIG.ui.removeSplashSpinner();
				}
			]
		}
	});

});
