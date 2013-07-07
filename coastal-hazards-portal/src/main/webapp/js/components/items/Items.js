CCH.Objects.Items = function(args) {
	args = args ? args : {};
	var me = this === window ? {} : this;
	me.items = [];
	return $.extend(me, {
		init: function(args) {
			$(window).on('cch.search.item.submit', function(evt, data) {
				me.search({
					bbox: [data.left, data.bottom, data.right, data.top].toString(),
					query: data.keywords || '',
					type: data.themes.toString() || '',
					sortBy: data.popularity ? 'popularity' : '',
					callbacks: {
						success: [
							function(data, status, jqXHR) {
								$(window).trigger('cch.data.items.searched', data.items.length);
								if (data && data.items && data.items.length) {
									me.items = data.items;
									$(window).trigger('cch.data.items.loaded', {
										items: me.items
									});
								}
							}
						],
						error: [
							function(xhr, status, error) {
								$.pnotify({
									text: 'Could not perform search. Check logs for details.',
									styling: 'bootstrap',
									type: 'error',
									nonblock: true
								});
								LOG.info('An error occurred during search: ' + error);
							}
						]
					}
				});
			});
			return me;
		},
		load: function(args) {
			args = args || {};
			args.items = args.items || [];

			args.callbacks = args.callbacks || {};
			args.callbacks.success = args.callbacks.success || [];
			args.callbacks.error = args.callbacks.error || [];

			if (!args.items.length) {
				args.callbacks.success.unshift(function(data, status, jqXHR) {
					me.items = data.items;
					$(window).trigger('cch.data.items.loaded', {
						items: me.items
					});
				});
			} else {
				args.callbacks.success.unshift(function(data, status, jqXHR) {
					me.items.push(data);
					if (args.items.length) {
						me.search(args);
					} else {
						$(window).trigger('cch.data.items.loaded', {
							items: me.items
						});
					}
				});
			}

			me.search(args);

		},
		search: function(args) {
			args = args || {};

			var count = args.count || '';
			var bbox = args.bbox || '';
			var sortBy = args.sortBy || '';
			var items = args.items || [];
			var itemId = items.pop() || '';
			var item = itemId ? '/' + itemId : '';
			var query = args.query || '';
			var type = args.type || '';

			var callbacks = args.callbacks || {
				success: [],
				error: []
			};

			$.ajax({
				url: CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.item.endpoint + item,
				dataType: 'json',
				data: item ? '' : {
					count: count,
					bbox: bbox,
					sortBy: sortBy,
					query: query,
					type: type
				},
				success: function(data, status, jqXHR) {
					callbacks.success.each(function(cb) {
						cb.apply(this, [data, status, jqXHR]);
					});
				},
				error: function(xhr, status, error) {
					callbacks.error.each(function(cb) {
						cb.apply(this, [xhr, status, error]);
					});
				}
			});
		},
		getItems: function() {
			return me.items;
		},
		getById: function(args) {
			var id = args.id;
			return me.items.find(function(item) {
				return item.id === id;
			});
		}
	});
};