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

		var search = $.ajax({
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
				callbacks.success.each(function (cb) {
					cb.apply(this, [data, statusText, xhrResponse]);
				});
				ga('send', 'event', {
					'eventCategory': 'search',
					'eventAction': 'geocodeSearchPerformed',
					'eventLabel': 'search event'
				});
			},
			error: function (xhr, status, error) {
				callbacks.error.each(function (cb) {
					cb.apply(this, [xhr, status, error]);
				});
				ga('send', 'exception', {
					'exDescription': 'GeoSearchFailed',
					'exFatal': false
				});
			}
		});
		
		search.done(function (data) {
			if (displayNotification && data.locations.length) {
				$(window).trigger('cch.data.locations.searched', {items: data.locations});
			}
		});
	};
	
	me.getBboxOfLocationResults = function (items) {
		var points = items.map(function (i) {
			return new OpenLayers.Geometry.Point(i.feature.geometry.x, i.feature.geometry.y);
		});
		return new OpenLayers.Geometry.MultiPoint(points).getBounds();
	};
	
	me.getAliasById = function (args) {
		if (!args || !args.id) {
			throw 'arguments required';
		}
		
		var id = args.id,
			callbacks = args.callbacks || {
				success: [],
				error: []
		};
		
		var url = CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.alias.endpoint + '/' + id;
		
		$.ajax({
			url: url,
			dataType: 'json',
			context: this,
			traditional: true,
			success: function (data, statusText, xhrResponse) {
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
	
	me.getAliasListForItem = function (args) {
		if (!args || !args.itemId) {
			throw 'arguments required';
		}
		
		var itemId = args.itemId,
			callbacks = args.callbacks || {
				success: [],
				error: []
		};
		
		var url = CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.alias.endpoint + '/item/' + itemId;
		
		$.ajax({
			url: url,
			dataType: 'json',
			context: this,
			traditional: true,
			success: function (data, statusText, xhrResponse) {
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
	
	me.getAllAliases = function (args) {
		var callbacks = args.callbacks || {
				success: [],
				error: []
		};
		
		var url = CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.alias.endpoint;
		
		$.ajax({
			url: url,
			dataType: 'json',
			context: this,
			traditional: true,
			success: function (data, statusText, xhrResponse) {
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
			subtree = args.subtree || false,
			showDisabled = args.showDisabled || false,
			callbacks = args.callbacks || {
				success: [],
				error: []
			},
		scope = args.scope || this,
			data = {
				subtree: subtree,
				timestamp: new Date().getTime()
			},
		url = CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.item.endpoint,
			displayNotification = args.displayNotification === false ? false : true;

		if (item) {
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
			if (types || types.length > 0) {
				data.type = types;
			}
		}

		var search = $.ajax({
			url: url,
			dataType: 'json',
			data: data,
			context: scope,
			traditional: true,
			success: function (data, statusText, xhrResponse) {
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
		
		var gaSuccess = function () {
			if (window.ga) {
				ga('send', 'event', {
					'eventCategory': 'search',
					'eventAction': 'ItemSearchSucceeded'
				});
			}
		};
		
		var gaFail = function () {
			if (window.ga) {
				ga('send', 'exception', {
					'exDescription': 'ItemSearchFailed',
					'exFatal': false
				});
			}
		};
		
		// Attach a few callbacks before passing this on
		search.done(function (data) {
			if (displayNotification && data.items) {
				$(window).trigger('cch.data.items.searched', {items: data.items});
			}
		}).then(gaSuccess, gaFail);
		
		return search;
	};

	return {
		submitLocationSearch: me.submitLocationSearch,
		submitItemSearch: me.submitItemSearch,
		getBboxOfLocationResults: me.getBboxOfLocationResults,
		getAliasById: me.getAliasById,
		getAliasListForItem: me.getAliasListForItem,
		getAllAliases: me.getAllAliases
	};

};
