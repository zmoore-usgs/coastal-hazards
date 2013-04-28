var Session = function(args) {
	LOG.info('Session.js::constructor: Session class is initializing.');
	var me = (this === window) ? {} : this;
	args = args ? args : {};

	me.objects = Object.extended({
		map: Object.extended({
			baselayer: 'Not Yet Initialized',
			scale: 0,
			extent: [0, 0],
			center: {
				lat: 0,
				lon: 0
			}
		})
	});

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
			var sid = CONFIG.session.getIncomingSid();
			if (sid) {
				var callbacks = args.callbacks || [];
				LOG.info("Will try to load session '" + sid + "' from server");
				this.getSession({
					sid: sid,
					callbacks: [
						// Update the session from the server
						function(session) {
							if (session) {
								LOG.info("Session found on server. Updating current session.");
								$.extend(true, me.objects, JSON.parse(session).objects);
							} else {
								LOG.info("Session not found on server.");
							}
						}
					].union(callbacks)
				});
			}
		},
		getSession: function(args) {
			var sid = args.sid;
			var callbacks = args.callbacks || [];
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

						if (callbacks && callbacks.length > 0) {
							callbacks.each(function(callback) {
								callback.call(context, session);
							});
						}

					}
				});
			}
		},
		getIdentifier: function(args) {
			var context = args.context;
			var callbacks = args.callbacks || [];
			$.ajax('service/session', {
				type: 'POST',
				data: {
					'session': this.toString(),
					'action': 'write'
				},
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
				return s.substring(0, 3).toLowerCase() === 'sid'
			});
			var sid = '';
			if (sidItem) {
				sid = sidItem.substr(4);
			}
			return sid;
		}
	});
};