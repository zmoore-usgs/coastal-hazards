var Session = function(args) {
	LOG.info('Session.js::constructor: Session class is initializing.');
	var me = (this === window) ? {} : this;
	var args = args ? args : {};
	
	if (args.map) {
		$.extend(true, me.map, args.map);
	} else {
		me.map = Object.extended({
			baselayer: 'Not Yet Initialized',
			scale : 0,
			extent : [],
			center: {
				lat: 0,
				lon: 0
			}
		});
	}

	return {
		toString : function() {
			var stringifyObject = {
				map : CONFIG.session.getMap()
			}
			return JSON.stringify(stringifyObject);
		},
		getMap : function() {
			return me.map;
		}
	};
};