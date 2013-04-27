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
				map: CONFIG.session.getMap()
			}
			return JSON.stringify(stringifyObject);
		},
		getMap: function() {
			return me.map;
		},
		getSession: function(id, callbacks) {
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
								callback.call(undefined, session);
							})
						}
					}
				}
			})
		},
		getIdentifier: function(callbacks) {
			$.ajax('service/session', {
				type: 'POST',
				data: {
					'session': CONFIG.session.toString(),
					'action': 'write'
				},
				success: function(data, textStatus, jqXHR) {
					if (data.success === 'true') {
						var id = data.id;
						if (callbacks && callbacks.length > 0) {
							callbacks.each(function(callback) {
								callback.call(undefined, id);
							});
						}
					}
				}
			});
		}
	};
};