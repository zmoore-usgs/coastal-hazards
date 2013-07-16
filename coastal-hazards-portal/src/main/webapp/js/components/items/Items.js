CCH.Objects.Items = function(args) {
	args = args ? args : {};
	var me = this === window ? {} : this;
	me.items = [];
	return $.extend(me, {
		init: function(args) {
			$(window).on('cch.search.item.submit', function(evt, data) {
				me.search({
					bbox: data.left ? [data.left, data.bottom, data.right, data.top].toString() : '',
					query: data.keywords || '',
					type: data.themes.toString() || '',
					sortBy: data.popularity ? 'popularity' : '',
					callbacks: {
						success: [
							function(data, status, jqXHR) {
								if (data && data.items && data.items.length) {
									var items = data.items;

									// We don't want to kill off the pinned items 
									// after a search. We wamt them to end up on the
									// bottom of the slide, so append them to the 
									// items array before we rebuild the slideshoe
									var pinnedItems = CCH.cards.getPinnedCards().map(function(card) {
										return card.item;
									});
									items = items.concat(pinnedItems);

									// The expected behavior is for pinned items to 
									// show up at the bottom of the list. concat() 
									// does not care about uniqueness so we may have 
									// pinned items that are duplicates of what came 
									// in through the search. Go through the array and 
									// delete off the top any duplicates which will be
									// the unpinned version of the pinned item

									// We are also currently filtering geospatial
									// using the front-end due to hibernate being 
									// a little b :/
									items.remove(function(item) {
										var isDupe = this.count(item) > 1;
										var intersectsBoundBox = new OpenLayers.Bounds(item.bbox).intersectsBounds(new OpenLayers.Bounds(CCH.search.getCurrentBBOX()));
										return isDupe || !intersectsBoundBox;
									});
									
									// If items were found, return the items that were found
									// and load them in the view
									if (items.length) {
										me.items = items;
										$(window).trigger('cch.data.items.searched', me.items.length);
										$(window).trigger('cch.data.items.loaded', {
											items: me.items
										});
										CCH.slideshow.stop();
									} else {
										// Otherwise, just respond that we returned 0 results
										$(window).trigger('cch.data.items.searched', 0);
									}
								} else {
									$(window).trigger('cch.data.items.searched', 0);
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
			var data = item ? '' : {
				count: count,
				bbox: bbox,
				sortBy: sortBy,
				query: query.split(','),
				type: type.split(',')
			};

			if (!item) {
				if (!count) {
					delete data.count;
				}
				if (!bbox) {
					delete data.bbox;
				}
				if (!sortBy) {
					delete data.sortBy;
				}
				if (!query || query.length === 0) {
					delete data.query;
				}
				if (!type || type.length === 0) {
					delete data.type;
				}
			}
			$.ajax({
				url: CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.item.endpoint + item,
				dataType: 'json',
				data: data,
				traditional: true,
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