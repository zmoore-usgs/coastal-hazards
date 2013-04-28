var Session = function(args) {
	LOG.info('Session.js::constructor: Session class is initializing.');
	var me = (this === window) ? {} : this;
	var args = args ? args : {};


	if (args.map) {
		$.extend(true, me.map, args.map);
	} else {
		me.map = Object.extended({
			baselayer: 'Not Yet Initialized',
			scale: 0,
			extent: [],
			center: {
				lat: 0,
				lon: 0
			}
		});
	}

	return {
		toString: function() {
			var stringifyObject = {
				map: this.getMap()
			}
			return JSON.stringify(stringifyObject);
		},
		getMap: function() {
			return me.map;
		},
		getSession: function(agrs) {
			var id = args.id;
			var callbacks = args.callbacks || [];
			var context = args.context;
			$.ajax('service/session', {
				type: 'POST',
				data: {
					'id': id,
					'action': 'read'
				},
				success: function(data, textStatus, jqXHR) {
					if (data.success === 'true') {
						var session = new Session({
							'map': JSON.parse(data.session).map
						});
						if (callbacks && callbacks.length > 0) {
							callbacks.each(function(callback) {
								callback.call(context, session);
							});
						}
					}
				}
			});
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
						var id = data.id;
						if (callbacks && callbacks.length > 0) {
							callbacks.each(function(callback) {
								callback.call(context, id);
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
				context : context,
				callbacks : callbacks
			});
		},
		getMinifiedEndpoint: function(args) {
			var location = window.location.href;
			
			this.getEndpoint({
				context: this,
				callbacks: [
					function(id) {
						$.ajax('service/minifier', {
							data : '',
							success : {
								
							}
						})
					}
				]
			})
		}
	};
};