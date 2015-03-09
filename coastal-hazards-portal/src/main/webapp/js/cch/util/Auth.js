/*jslint browser: true*/
/*global CCH*/
window.CCH = CCH || {};
CCH.Auth = {
	checkAuthStatus : function() {
		$.ajax({
			url: CCH.CONFIG.contextPath + '/security/auth/check/',
			type: 'GET',
			dataType: 'json'
		});
	}, 

	submitLogin : function(forward) {
		$.ajax({
			url: CCH.CONFIG.contextPath + '/security/auth/authenticate',
			type: 'POST',
			dataType: 'json',
			data: {
				username: $('#username').val(),
				password: $('#password').val()
			},
			success: function(data) {
				//set authtoken
				CCH.Auth.setAuthToken(data.tokenId);
				
				//forward
				window.location = forward || CCH.CONFIG.contextPath + '/publish/item';
			}, 
			error: function(xhr, status, error) {
				if(error == "Unauthorized") {
					alertify.error("Username and password invalid.", 3000);
				}
			}
		});
	},
	
	setAuthToken : function (tokenId) {
		if(!tokenId) {
			$.removeCookie('CoastalHazardsAuthCookie', { path: '/' });
		}
		$.cookie("CoastalHazardsAuthCookie", tokenId, { path: '/' });
	},
	
	getAuthToken : function () {
		var token = $.cookie("CoastalHazardsAuthCookie");
		return token;
	}
};

//set global JQuery handler to always intercept 401/403s
$( document ).ajaxError(function(event, jqxhr, settings, thrownError){
	if(thrownError == "Forbidden" || thrownError == "Unauthorized") {
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