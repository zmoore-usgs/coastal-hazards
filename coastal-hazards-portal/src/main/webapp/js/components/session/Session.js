var CCH = CCH || {};
CCH.Objects.Session = function(args) {
	CCH.LOG.info('Session.js::constructor: Session class is initializing.');
	var me = (this === window) ? {} : this;
	args = args ? args : {};

	me.session = {
		items: [],
		baselayer: 'Not Yet Initialized',
		scale: 0,
		bbox: [0.0, 0.0, 0.0, 0.0],
		center: [0.0, 0.0]
	};

	return $.extend(me, {
		init: function() {
			$(window).on('cch.data.items.loaded', function() {
				if (CCH.CONFIG.incomingSessionId) {
					me.load({
						sid: CCH.CONFIG.incomingSessionId,
						callbacks: {
							success:
									[
										function(session) {

										}
									],
							error: []
						}
					});
				}
			});
		},
		toString: function() {
			return JSON.stringify(me.session);
		},
		getSession: function() {
			return me.session;
		},
		load: function(args) {
			var sid = args.sid;
			var callbacks = args.callbacks || {};
			var successCallbacks = callbacks.success || [];
			var errorCallbacks = callbacks.error || [];
			CCH.LOG.info("Will try to load session '" + sid + "' from server");
			me.readSession({
				sid: sid,
				callbacks: {
					success: [
						// Update the session from the server
						function(session) {
							if (session) {
								CCH.LOG.info("Session found on server. Updating current session.");
								$.extend(true, me.session, JSON.parse(session));
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
				$.ajax(CCH.CONFIG.data.sources.session.endpoint + sid, {
					type: 'GET',
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function(json, textStatus, jqXHR) {
						var session = null;
						if (json) {
							me.session = json;
							if (successCallbacks && successCallbacks.length > 0) {
								successCallbacks.each(function(callback) {
									callback.call(context, session);
								});
							}
						} else {
							if (errorCallbacks && errorCallbacks.length > 0) {
								errorCallbacks.each(function(callback) {
									callback.call(context, null);
								});
							}
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
		toggleItem: function(item) {
			var items = me.session.items;
			var currIdIdx = items.indexOf(item);
			var toggleOn = currIdIdx === -1;

			if (toggleOn) {
				items.push(item);
			} else {
				items.removeAt(currIdIdx);
			}

			$(me).trigger('session-id-toggled', {
				'on': toggleOn
			});

			return toggleOn;
		},
		clearPinnedItems: function() {
			me.session.items.length = 0;
		},
		getPinnedCount: function() {
			return me.session.items.length;
		},
		getPinnedItems: function() {
			return me.session.items;
		}
	});
};