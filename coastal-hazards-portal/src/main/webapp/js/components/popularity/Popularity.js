var CCH = CCH || {};
CCH.CONFIG.popularity = {
	results: [],
	populate: function(args) {
		args = args ? args : {};
		var populateResults = function(data, status, jqXHR) {
			var success = data.success;
			if (success === 'true') {
				CCH.CONFIG.popularity.results = data.results;
			} else {
				// Handle an error
			}
		};
		var callbacks = args.callbacks || {
			success: [],
			error: []
		};

		callbacks.success.unshift(populateResults);

		var runSuccessCallbacks = function(data, status, jqXHR) {
			callbacks.success.each(function(cb) {
				cb.apply(this, [data, status, jqXHR]);
			});
		};

		var runErrorCallbacks = function(data, status, errorThrown) {
			callbacks.error.each(function(cb) {
				cb.apply(this, [data, status, errorThrown]);
			});
		};


		$.ajax({
			url: CCH.CONFIG.data.sources.popularity.endpoint,
			isLocal: true,
			dataType: 'json',
			data: {
				count: '', // not yet supported
				bbox: '', // not yet supported
				sortBy: ''
			},
			success: runSuccessCallbacks,
			error: runErrorCallbacks
		});
	},
	getById: function(args) {
		var id = args.id;
		return this.results.find(function(result) {
			return result.id === id;
		});
	}
};