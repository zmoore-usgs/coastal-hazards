/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global OpenLayers*/
/*global CCH*/
/*global alertify*/

/**
 * Top level JS container for product items
 * 
 *  Listeners
 *  window: 'cch.search.item.submit'
 *
 *  Triggers
 *  window: 'cch.data.products.loaded'
 * 
 * @param {type} args
 * @returns {CCH.Objects.Items.Anonym$4}
 */
CCH.Objects.Items = function (args) {
	"use strict";
	args = args || {};

	var me = this === window ? {} : this;

	me.items = {};
	me.search = new CCH.Util.Search();

	me.findWithinBounds = function (bounds) {
		var itemsInBounds = Object.values(me.items)
				.filter(function (i) {
					return i.id.toLowerCase() !== 'uber' && i.isWithinBounds(bounds);
				});
		return itemsInBounds;
	};

	me.addItem = function (args) {
		args = args || {};

		var item = args.item;
		
		// I want to add an item to my items but I also want to make sure it
		// is an actual item so check it's CLASS_NAME to make sure
		if (item &&
			'object' === typeof item &&
			item.CLASS_NAME === 'CCH.Objects.Item' &&
			item.id &&
			!me.items[item.id]) {
			
			// Tag the NOAA NowCOAST item
			if (item.attr && $.inArray(item.attr.toUpperCase(), CCH.CONFIG.data.storm_track_attributes) !== -1) {
				item.type = 'storm_track';
			}
			
			me.items[item.id] = item;
		}
	};

	return {
		add: me.addItem,
		search: me.search.submitItemSearch,
		getItemsWithinBounds : me.findWithinBounds,
		getItems: function () {
			return me.items;
		},
		getById: function (args) {
			var id = args.id;
			return me.items[id];
		},
		Types: {
			AGGREGATION: 'aggregation',
			HISTORICAL: 'historical',
			STORMS: 'storms',
			VULNERABILITY: 'vulnerability',
			MIXED: 'mixed',
			TRACK: 'storm_track'
		},
		CLASS_NAME: 'CCH.Objects.Items'
	};
};