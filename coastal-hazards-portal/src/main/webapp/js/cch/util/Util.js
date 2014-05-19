window.CCH = CCH || {};
CCH.Util = CCH.Util || {};
CCH.Util.Util = {
	/** 
	 * Creates a legend for display on back of card
	 */
	getSLD: function (args) {
		args = args || {};
		args.callbacks = args.callbacks || {};
		args.callbacks.success = args.callbacks.success || [];
		args.callbacks.error = args.callbacks.error || [];
		return $.ajax({
			url: args.contextPath + '/data/sld/' + args.itemId,
			context: args.context || arguments.callee.caller,
			headers: {
				'Accept': "application/json; charset=utf-8",
				'Content-Type': "application/json; charset=utf-8"
			},
			dataType: 'json',
			success: function (data, status, jqXHR) {
				args.callbacks.success.each(function (cb) {
					cb.apply(args.context, [data, status, jqXHR]);
				});
			},
			error: function (jqXHR, textStatus, errorThrown) {
				args.callbacks.error.each(function (cb) {
					cb.apply(args.context, [jqXHR, textStatus, errorThrown]);
				});
			}
		});
	},
	getMinifiedEndpoint: function (args) {
		var location = args.location || window.location.href;
		var callbacks = args.callbacks || {
			success: [],
			error: []
		};

		$.ajax(CCH.CONFIG.contextPath + '/data/minifier/minify/' + location, {
			type: 'GET',
			dataType: 'json',
			success: function (json, textStatus, jqXHR) {
				if (callbacks.success && callbacks.success.length > 0) {
					callbacks.success.each(function (callback) {
						callback.call(null, json, textStatus, jqXHR);
					});
				}
			},
			error: function (data, textStatus, jqXHR) {
				if (callbacks.error && callbacks.error.length > 0) {
					callbacks.error.each(function (callback) {
						callback.call(null, data, textStatus, jqXHR);
					});
				}
			}
		});
	},
	getGeolocation: function (args) {
		args = args || {};
		var callbacks = args.callbacks || {
			success: function (pos) {
				CCH.LOG.debug("Latitude: " + pos.coords.latitude + ", Longitude: " + pos.coords.longitude);
			},
			error: function (err) {
				switch (err.code) {
					case err.PERMISSION_DENIED:
						CCH.LOG.warn("User denied the request for Geolocation.");
						break;
					case err.POSITION_UNAVAILABLE:
						CCH.LOG.warn("Location information is unavailable.");
						break;
					case err.TIMEOUT:
						CCH.LOG.warn("The request to get user location timed out.");
						break;
					case err.UNKNOWN_ERROR:
						CCH.LOG.warn("An unknown error occurred.");
						break;
				}
			}
		};

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(callbacks.success, callbacks.error);
		}
	}
};