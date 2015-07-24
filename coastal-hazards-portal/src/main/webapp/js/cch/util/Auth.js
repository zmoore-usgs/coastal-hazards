/*jslint browser: true*/
/*global CCH*/
/*global alertify*/
window.CCH = CCH || {};
CCH.Auth = {
	authTokenLabel: 'CoastalHazardsAuthCookie',
	cookiePath: '/',
	checkAuthStatus: function () {
		"use strict";
		return $.ajax({
			url: CCH.CONFIG.contextPath + '/security/auth/check/',
			type: 'GET'
		});
	},
	submitLogin: function (forward) {
		"use strict";
		$.ajax({
			url: CCH.CONFIG.contextPath + '/authentication/auth/authenticate',
			type: 'POST',
			dataType: 'json',
			data: {
				username: $('#username').val(),
				password: $('#password').val()
			},
			success: function (data) {
				//set authtoken
				CCH.Auth.setAuthToken(data.tokenId);
				
				ga('send', 'event', {
					'eventCategory': 'auth',
					'eventAction': 'userAuthenticated',
					'eventLabel': 'auth event'
				});
				
				//forward
				window.location = forward || CCH.CONFIG.contextPath + '/publish/item';
			},
			error: function (xhr, status, error) {
				alertify.error(error, 3000);
				ga('send', 'exception', {
					'exDescription': 'AuthenticationFailed',
					'exFatal': false
				});
			}
		});
	},
	logout: function () {
		"use strict";
		$.ajax({
			url: CCH.CONFIG.contextPath + '/authentication/auth/logout',
			type: 'POST',
			dataType: 'json',
			success: function () {
				//set authtoken
				CCH.Auth.setAuthToken("");

				ga('send', 'event', {
					'eventCategory': 'auth',
					'eventAction': 'userLoggedOut',
					'eventLabel': 'auth event'
				});

				//forward
				window.location = CCH.CONFIG.contextPath + '/security/auth/login';
			},
			error: function () {
				//forward
				window.location = CCH.CONFIG.contextPath + '/security/auth/login';
				
				ga('send', 'exception', {
					'exDescription': 'LogoutFailed',
					'exFatal': false
				});
			}
		});
	},
	setAuthToken: function (tokenId) {
		"use strict";
		if (!tokenId) {
			$.removeCookie(this.authTokenLabel, {path: this.cookiePath});
		}
		$.cookie(this.authTokenLabel, tokenId, {expires: 1, path: this.cookiePath});
	},
	getAuthToken: function () {
		"use strict";
		var token = $.cookie(this.authTokenLabel);
		return token;
	}
};

//set global JQuery handler to always intercept 401/403s
$(document).ajaxError(function (event, jqxhr, settings, thrownError) {
	"use strict";
	if (thrownError === "Forbidden" || thrownError === "Unauthorized") {
		CCH.Auth.setAuthToken(""); //clear token
		var currentLocation = window.location;
		
		ga('send', 'event', {
			'eventCategory': 'auth',
			'eventAction': 'redirectedToLogin',
			'eventLabel': 'auth event'
		});
		
		//reroute to login page
		window.location = CCH.CONFIG.contextPath + "/security/auth/login/?forward=" + encodeURI(currentLocation) + "&cause=" + thrownError;
	}
});

//always use token as header
$.ajaxSetup({
	headers: {
		"Authorization": "Bearer " + CCH.Auth.getAuthToken()
	}
});

