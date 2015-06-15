/*jslint browser: true */
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global localStorage*/
CCH.Objects.Session = function (args) {
	"use strict";

	CCH.LOG.trace('Session.js::constructor: Session class is initializing.');

	var me = (this === window) ? {} : this;

	args = args || {};

	me.storageName = 'cch';
	me.hasLocalStorage = 'localStorage' in window && window['localStorage'] !== null;
	
	me.session = {
		items: [],
		baselayer: '',
		scale: 55467893.20,
		bbox: [-138.48502349853044, 7.986650381678925, -55.86783599853124, 56.56752394039768],
		center: [-95.76961135864461, 37.0182344690233]
	};
	
	me.initSession = function () {
		if(me.hasLocalStorage) {
			// localStorage handling
			if (!localStorage[me.storageName]) {
				localStorage[me.storageName] = me.toString();
			} else {
				try {
					me.session = $.extend({}, me.session, JSON.parse(localStorage[me.storageName]));
				} catch (ex) {
					CCH.LOG.warn("Session could not be loaded. Creating new session");
					localStorage[me.storageName] = me.toString();
				}
			}
		} else {
			// Cookie handling
			$.cookie.json = true;
			
			if ($.cookie(me.storageName) === undefined) {
				$.cookie(me.storageName, me.session);
			} else {
				me.session = $.cookie(me.storageName);
			}
		}
	};
	
	me.persistSession = function () {
		if(me.hasLocalStorage) {
			localStorage[me.storageName] = me.toString();
		} else {
			$.cookie(me.storageName, me.session);
		}
	};

	me.toString = function () {
		return JSON.stringify(me.session);
	};

	me.getSession = function () {
		return me.session;
	};

	me.update = function (args) {
		CCH.LOG.trace('Session.js::update');
		
		CCH.map.updateSession()

		args = args || {};

		var itemid = args.itemid,
			visible = args.visible,
			itemIndex;

		itemIndex = me.getItemIndex({
			id: itemid
		});
		if (itemIndex !== -1) {
			me.session.items[itemIndex].visible = visible;
		}

		me.persistSession();
	};
	
	me.write = function (args) {
		CCH.LOG.debug('Session.js::write');
		args = args || {};

		var callbacks = args.callbacks || {
			success: [],
			error: []
		};

		me.update();

		callbacks.success.unshift(function (json) {
			CCH.LOG.debug("Session.js::write: " + json.sid);
		});

		$.ajax(CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.session.endpoint, {
			type: 'POST',
			contentType: 'application/json;charset=utf-8',
			dataType: 'json',
			data: me.toString(),
			success: function (json, textStatus, jqXHR) {
				if (callbacks.success && callbacks.success.length > 0) {
					callbacks.success.each(function (callback) {
						callback.call(null, json, textStatus, jqXHR);
					});
				}
			},
			error: function (data, textStatus, jqXHR) {
				if (callbacks.error && callbacks.error.length > 0) {
					callbacks.error.each(function (callback) {
						callback.call(null, data, textStatus, jqXHR);
					});
				}
			}
		});
	};

	me.read = function (args) {
		CCH.LOG.debug('Session.js::read');

		var sid = args.sid,
			context = args.context;

		if (sid) {
			return $.ajax(CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.session.endpoint + sid, {
				type: 'GET',
				contentType: 'application/json;charset=utf-8',
				dataType: 'json',
				context : context
			});
		}
	};

	me.load = function (args) {
		CCH.LOG.debug('Session.js::load');
		args = args || {};
		var sid = args.sid,
			callbacks = args.callbacks || {
				success: [],
				error: []
			},
			read = me.read({
				sid: sid
			});
		
		if (read) {
			read.done(callbacks.success, function (json) {
				if (json) {
					CCH.LOG.info("Session.js::load: Session found on server. Updating current session.");
					$.extend(true, me.session, json);

					me.persistSession();

					$(window).trigger('cch.data.session.loaded.true');
				} else {
					CCH.LOG.info("Session.js::load: Session not found on server.");
					$(window).trigger('cch.data.session.loaded.false');
				}
			});

			read.fail(callbacks.error);
		}
		
		CCH.LOG.info("Session.js::load: Will try to load session '" + sid + "' from server");
		
		return read;
	};

	me.getItemById = function (id) {
		var item = null,
			index = me.getItemIndex({
				id: id
			});

		if (index !== -1) {
			item = me.getSession().items[index];
		}
		return item;
	};

	me.getItemIndex = function (item) {
		return me.session.items.findIndex(function (i) {
			return i.itemId === item.id;
		});
	};

	me.addItem = function (args) {
		CCH.LOG.trace('Session.js::addItem');

		var item = args.item,
			visible = args.visible || false,
			index = me.getItemIndex(item);

		if (index === -1) {
			me.session.items.push({
				itemId: item.id,
				visible: visible
			});
		}

		me.persistSession();

		return me.session;
	};

	me.removeItem = function (item) {
		CCH.LOG.debug('Session.js::removeItem');

		var index = me.getItemIndex(item);

		if (index !== -1) {
			me.session.items.removeAt(index);
		}

		me.persistSession();
		
		return me.session;
	};
	
	me.initSession();

	return $.extend(me, {
		cookieName: me.cookieName,
		toString: me.toString,
		getSession: me.getSession,
		load: me.load,
		writeSession: me.write,
		updateSession: me.update,
		getItemById: me.getItemById,
		getItemIndex: me.getItemIndex,
		addItem: me.addItem,
		removeItem: me.removeItem,
		isReturning : me.isReturning
	});
};