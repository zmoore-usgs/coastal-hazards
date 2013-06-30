CCH.Util = {
	getMinifiedEndpoint: function(args) {
		var contextPath = args.contextPath;
		var location = args.location || window.location.href;
		var callbacks = args.callbacks || {
			success: [],
			error: []
		};

		$.ajax(contextPath + '/data/minifier/minify/' + location, {
			type: 'GET',
			dataType: 'json',
			success: function(json, textStatus, jqXHR) {
				if (callbacks.success && callbacks.success.length > 0) {
					callbacks.success.each(function(callback) {
						callback.call(json, textStatus, jqXHR);
					});
				}
			},
			error: function(data, textStatus, jqXHR) {
				if (callbacks.error && callbacks.error.length > 0) {
					callbacks.error.each(function(callback) {
						callback.call(data, textStatus, jqXHR);
					});
				}
			}
		});

	}
}