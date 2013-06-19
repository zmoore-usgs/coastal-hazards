var CCH = CCH || {};
CCH.Objects.Session = function(args) {
	CCH.LOG.info('Session.js::constructor: Session class is initializing.');
	var me = (this === window) ? {} : this;
	args = args ? args : {};

	me.serviceEndpoint = 'rest/sessions';
	me.objects = {
		view: {
			itemIds: []
		},
		map: {
			baselayer: 'Not Yet Initialized',
			scale: 0,
			extent: [0, 0],
			center: {
				lat: 0,
				lon: 0
			}
		}
	};

	return $.extend(me, {
		toString: function() {
			var stringifyObject = {
				objects: this.objects
			};
			return JSON.stringify(stringifyObject);
		},
		getObjects: function() {
			return me.objects;
		},
		getMap: function() {
			return me.objects.map;
		},
		updateFromServer: function(args) {
			var sid = args.sid;
			var callbacks = args.callbacks || {};
			var successCallbacks = callbacks.success || [];
			var errorCallbacks = callbacks.error || [];
			CCH.LOG.info("Will try to load session '" + sid + "' from server");
			me.getSession({
				sid: sid,
				callbacks: {
					success: [
						// Update the session from the server
						function(session) {
							if (session) {
								CCH.LOG.info("Session found on server. Updating current session.");
								$.extend(true, me.objects, JSON.parse(session).objects);
							} else {
								CCH.LOG.info("Session not found on server.");
							}
						}
					].union(successCallbacks),
					error: errorCallbacks
				}
			});
		},
		readSession: function(args) {
			var sid = args.sid;
			var callbacks = args.callbacks || {};
			var successCallbacks = callbacks.success || [];
			var errorCallbacks = callbacks.error || [];
			var context = args.context;

			if (sid) {
				$.ajax('service/session', {
					type: 'POST',
					data: {
						'sid': sid,
						'action': 'read'
					},
					success: function(data, textStatus, jqXHR) {
						var session = null;
						if (data.success === 'true') {
							session = data.session;
						}

						if (successCallbacks && successCallbacks.length > 0) {
							successCallbacks.each(function(callback) {
								callback.call(context, session);
							});
						}
					},
					error: function(data, textStatus, jqXHR) {
						if (errorCallbacks && errorCallbacks.length > 0) {
							errorCallbacks.each(function(callback) {
								callback.call(context, null);
							});
						}
					}
				});
			}
		},
		writeSession: function(args) {
			args = args || {};
			var context = args.context || me;
			var callbacks = args.callbacks || [];
			$.ajax(me.serviceEndpoint, {
				type: 'POST',
				contentType: 'application/json;charset=utf-8',
				dataType: 'json',
				data: me.toString(),
				success: function(data, textStatus, jqXHR) {
					if (data.success === 'true') {
						var sid = data.sid;
						if (callbacks && callbacks.length > 0) {
							callbacks.each(function(callback) {
								callback.call(context, sid);
							});
						}
					}
				}
			});
		},
		getEndpoint: function(args) {
			var callbacks = args.callbacks || [];
			var context = args.context;
			this.getIdentifier({
				context: context,
				callbacks: callbacks
			});
		},
		getMinifiedEndpoint: function(args) {
			var location = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
			var callbacks = args.callbacks || [];
			var context = args.context;

			this.getEndpoint({
				context: this,
				callbacks: [
					function(sid) {
						var url = location + '?sid=' + sid;
						$.ajax('service/minify', {
							data: {
								action: 'minify',
								url: url
							},
							success: function(data, textStatus, jqXHR) {
								callbacks.each(function(callback) {
									callback.call(context, {
										response: data,
										url: url
									});
								});
							}
						});
					}
				]
			});
		},
		getIncomingSid: function() {
			var sidItem = window.location.search.substr(1).split('&').find(function(s) {
				return s.substring(0, 3).toLowerCase() === 'sid';
			});
			var sid = '';
			if (sidItem) {
				sid = sidItem.substr(4);
			}
			return sid;
		},
		toggleId: function(id) {
			var itemIds = me.objects.view.itemIds;
			var currIdIdx = itemIds.indexOf(id);
			var toggleOn = currIdIdx === -1;

			if (toggleOn) {
				itemIds.push(id);
			} else {
				itemIds.removeAt(currIdIdx);
			}

			$(me).trigger('session-id-toggled', {
				'on': toggleOn
			});

			return toggleOn;
		},
		clearPinnedIds: function() {
			me.objects.view.itemIds.length = 0;
		},
		getPinnedIdsCount: function() {
			return me.objects.view.itemIds.length;
		},
		getPinnedIds: function() {
			return me.objects.view.itemIds;
		}
	});
};