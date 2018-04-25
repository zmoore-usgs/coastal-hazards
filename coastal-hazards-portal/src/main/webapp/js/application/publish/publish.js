/*global CCH */

(function () {
	"use strict";
	window.CCH = CCH || {};
	CCH.Publish = function (args) {

		var me = (this === window) ? {} : $.extend({}, me, args);

		var _init = function () {
			CCH.ui.addUserInformationToForm({
				data: CCH.CONFIG.user
			});

			var searchItemSuccess = function (itemJSON) {
				CCH.CONFIG.item = CCH.Objects.Item(itemJSON);
				CCH.ui.addItemToForm({
					data: CCH.CONFIG.item
				});
			};
			
			if (me.item) {
				return new CCH.Util.Search().submitItemSearch({
					subtree: true,
					showDisabled: false,
					item: me.item
				}).done(searchItemSuccess);
			}
		};

		return {
			init: _init
		};
	};

})();
