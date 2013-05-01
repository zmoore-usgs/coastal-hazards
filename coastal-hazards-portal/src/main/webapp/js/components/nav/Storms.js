var Storms = function(args) {
	LOG.info('Storms.js::constructor: Storms class is initializing.');
	var me = (this === window) ? {} : this;
	LOG.debug('Storms.js::constructor: Storms class initialized.');

	me.shareMenuDiv = args.shareMenuDiv;
	me.viewMenuDiv = args.viewMenuDiv;
	return $.extend(me, {
		init: function() {
			this.bindShareMenu();
		},
				
		bindShareMenu: function() {
			CONFIG.ui.bindShareMenu({
				menuItem: me.shareMenuDiv
			});
		}
	});
};