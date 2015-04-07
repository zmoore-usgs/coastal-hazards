/*jslint browser: true*/
/*global CCH*/
/*global alertify*/
window.CCH = CCH || {};
CCH.Auth = {
	authTokenLabel : 'CoastalHazardsAuthCookie',
	checkAuthStatus: function () {
		"use strict";
		$.ajax({
			url: CCH.CONFIG.contextPath + '/security/auth/check/',
			type: 'GET',
			dataType: 'json'
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

				//forward
				window.location = forward || CCH.CONFIG.contextPath + '/publish/item';
			},
			error: function (xhr, status, error) {
				alertify.error(error, 3000);
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

				//forward
				window.location = CCH.CONFIG.contextPath + '/security/auth/login';
			},
			error: function () {
				//forward
				window.location = CCH.CONFIG.contextPath + '/security/auth/login';
			}
		});
	},
	setAuthToken: function (tokenId) {
		"use strict";
		if (!tokenId) {
			$.removeCookie(this.authTokenLabel);
		}
		$.cookie(this.authTokenLabel, tokenId, { expires : 1 });
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