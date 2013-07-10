CCH.Util = {
	getSLD: function(args) {
		args = args || {};
		args.callbacks = args.callbacks || {};
		args.callbacks.success = args.callbacks.success || [];
		args.callbacks.error = args.callbacks.error || [];
		$.ajax({
			url: args.contextPath + '/data/sld/' + args.itemId,
			headers: {
				'Accept': "application/json; charset=utf-8",
				'Content-Type': "application/json; charset=utf-8"
			},
			dataType: 'json',
			success: function(data, status, jqXHR) {
				args.callbacks.success.each(function(cb) {
					cb.apply(this, [data, status, jqXHR]);
				});
			},
			error: function(jqXHR, textStatus, errorThrown) {
				args.callbacks.error.each(function(cb) {
					cb.apply(this, [jqXHR, textStatus, errorThrown]);
				});
			}
		});
	},
	updateItemPopularity: function(args) {
		args = args || {};
		var contextPath = args.contextPath;
		var itemId = args.item || '';
		var useType = args.type || '';

		if (!contextPath && CCH && CCH.CONFIG) {
			contextPath = CCH.CONFIG.contextPath;
		}
		if (itemId &&
				(useType.toLowerCase() === 'tweet'
						|| useType.toLowerCase() === 'use'
						|| useType.toLowerCase() === 'publish'
						|| useType.toLowerCase() === 'insert'
						)) {
			$.ajax({
				url: contextPath + '/data/activity/' + useType.toLowerCase() + '/' + itemId,
				type: 'PUT'
			});
		}
	},
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
						callback.call(null, json, textStatus, jqXHR);
					});
				}
			},
			error: function(data, textStatus, jqXHR) {
				if (callbacks.error && callbacks.error.length > 0) {
					callbacks.error.each(function(callback) {
						callback.call(null, data, textStatus, jqXHR);
					});
				}
			}
		});

	}
}