CCH.Objects.Items = function(args) {
	args = args ? args : {};
	var me = this === window ? {} : this;
	me.items = [];
	return $.extend(me, {
		init: function(args) {
			return me;
		},
		load: function(args) {
			args = args || {};
			var items = args.items || [];

			var callbacks = args.callbacks || {
				success: [],
				error: []
			};

			if (!items.length) {
				callbacks.success.unshift(function(data, status, jqXHR) {
					me.items = data.items;
					$(window).trigger('cch.data.items.loaded');
				});
			} else {
				callbacks.success.unshift(function(data, status, jqXHR) {
					me.items.push(data);
					if (items.length) {
						me.search({
							items: items,
							callbacks: callbacks
						});
					} else {
						$(window).trigger('cch.data.items.loaded');
					}
				});
			}

			me.search({
				items: items,
				callbacks: callbacks
			});

		},
		search: function(args) {
			args = args || {};

			var count = args.count || '';
			var bbox = args.bbox || '';
			var sortBy = args.sortBy || '';
			var items = args.items || [];
			var itemId = items.pop() || '';
			var item = '/' + itemId || '';

			var callbacks = args.callbacks || {
				success: [],
				error: []
			};

			$.ajax({
				url: CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.item.endpoint + item,
				dataType: 'json',
				data: {
					count: count,
					bbox: bbox,
					sortBy: sortBy
				},
				success: function(data, status, jqXHR) {
					callbacks.success.each(function(cb) {
						cb.apply(this, [data, status, jqXHR]);
					});
				},
				error: function(data, status, errorThrown) {
					callbacks.error.each(function(cb) {
						cb.apply(this, [data, status, errorThrown]);
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