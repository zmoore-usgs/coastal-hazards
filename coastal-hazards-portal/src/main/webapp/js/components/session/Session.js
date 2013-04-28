var Session = function(args) {
	LOG.info('Session.js::constructor: Session class is initializing.');
	var me = (this === window) ? {} : this;
	var args = args ? args : {};

	me.map = Object.extended({
		baselayer: 'Not Yet Initialized',
		scale: 0,
		extent: [0, 0],
		center: {
			lat: 0,
			lon: 0
		}
	});

	return $.extend(me, {
		toString: function() {
			var stringifyObject = {
				map: this.getMap()
			}
			return JSON.stringify(stringifyObject);
		},
		getMap: function() {
			return me.map;
		},
		updateFromServer: function() {
			var sid = CONFIG.session.getIncomingSid();
			if (sid) {
				this.getSession({
					sid: sid,
					callbacks: [
						function(session) {
							if (session) {
								$.extend(true, this.map, session.map);
							}
						}
					]
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
							session = new Session({
								'map': JSON.parse(data.session).map
							});
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