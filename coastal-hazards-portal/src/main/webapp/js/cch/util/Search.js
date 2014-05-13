/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global OpenLayers*/
/*global CCH*/

/**
 * Triggers:
 * 
 * Listeners: 
 * 
 * @param {type} args
 * @returns {CCH.Util.Search.Anonym$6}
 */
window.CCH = CCH || {};
CCH.Util = CCH.Util || {};
CCH.Util.Search = function (args) {
	"use strict";
	var me = (this === window) ? {} : this;
	args = args || {};
	me.GEOCODE_SERVICE_ENDPOINT = args.geocodeServiceEndpoint || CCH.CONFIG.data.sources.geocoding.endpoint;

	me.submitLocationSearch = function (args) {
		if (!args) {
			throw 'arguments required';
		}

		var criteria = args.criteria || '',
			maxLocations = args.maxLocations || 20,
			callbacks = args.callbacks || {
				success: [],
				error: []
			},
		scope = args.scope || this,
			displayNotification = args.displayNotification === false ? false : true;

		$.ajax({
			type: 'GET',
			url: me.GEOCODE_SERVICE_ENDPOINT,
			context: scope,
			data: {
				text: criteria,
				maxLocations: maxLocations,
				sourceCountry: 'USA',
				outFields: '*',
				f: 'pjson',
				outSR: '3785'
			},
			contentType: 'application/json',
			dataType: 'jsonp',
			success: function (data, statusText, xhrResponse) {
				if (displayNotification && data.locations.length) {
					$(window).trigger('cch.data.locations.searched', {items: data.locations});
				}
				callbacks.success.each(function (cb) {
					cb.apply(this, [data, statusText, xhrResponse]);
				});
			},
			error: function (xhr, status, error) {
				callbacks.error.each(function (cb) {
					cb.apply(this, [xhr, status, error]);
				});
			}
		});
	};

	me.submitItemSearch = function (args) {
		if (!args) {
			throw 'arguments required';
		}

		var criteria = args.criteria || '',
			count = args.count || '',
			bbox = args.bbox || null,
			sortBy = args.sortBy || null,
			item = args.item ? '/' + args.item : '',
			types = args.types || [],
			subtree = args.subtree,
			showDisabled = args.showDisabled || false,
			callbacks = args.callbacks || {
				success: [],
				error: []
			},
		scope = args.scope || this,
			data = {},
			url = CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.item.endpoint,
			displayNotification = args.displayNotification === false ? false : true;

		if (item) {
			data.subtree = subtree;
			url += item;
		} else {
			data.query = criteria;
			data.showDisabled = showDisabled;
			if (count) {
				data.count = count;
			}
			if (bbox) {
				data.bbox = bbox;
			}
			if (sortBy) {
				data.sortBy = sortBy;
			}
			if (criteria || criteria.length > 0) {
				data.criteria = criteria;
			}
			if (types || types.length > 0) {
				data.types = types;
			}
		}

		data.subtree = subtree;

		$.ajax({
			url: url,
			dataType: 'json',
			data: data,
			context: scope,
			traditional: true,
			success: function (data, statusText, xhrResponse) {
				if (displayNotification && data.items) {
					$(window).trigger('cch.data.items.searched', {items: data.items});
				}
				callbacks.success.each(function (cb) {
					cb.apply(this, [data, statusText, xhrResponse]);
				});
			},
			error: function (xhr, status, error) {
				callbacks.error.each(function (cb) {
					cb.apply(this, [xhr, status, error]);
				});
			}
		});
	};

	return {
		submitLocationSearch: me.submitLocationSearch,
		submitItemSearch: me.submitItemSearch
	};

};
