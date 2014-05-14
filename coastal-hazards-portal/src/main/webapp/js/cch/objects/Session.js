/*jslint browser: true */
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
CCH.Objects.Session = function (args) {
    "use strict";

    CCH.LOG.info('Session.js::constructor: Session class is initializing.');

    var me = (this === window) ? {} : this;

    args = args || {};

    me.session = {
        items: [],
        baselayer: '',
        scale: 0,
        bbox: [0.0, 0.0, 0.0, 0.0],
        center: [0.0, 0.0]
    };

    me.toString = function () {
        return JSON.stringify(me.session);
    };

    me.getSession = function () {
        return me.session;
    };

    me.update = function (args) {
        CCH.LOG.debug('Session.js::update');

        CCH.map.updateSession();

        args = args || {};

        var itemid = args.itemid,
            visible = args.visible,
            itemIndex,
            cookie;

        if (itemid) {
            itemIndex = me.getItemIndex({
                id : itemid
            });
            if (itemIndex !== -1) {
                me.session.items[itemIndex].visible = visible;
            }
        }

        cookie = $.cookie('cch');
        cookie.bbox = me.session.bbox;
        cookie.items = me.session.items;
        $.cookie('cch', cookie);
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
            callbacks = args.callbacks || {
                success: [],
                error: []
            },
            context = args.context;

        if (sid) {
            $.ajax(CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.session.endpoint + sid, {
                type: 'GET',
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                success: function (json, textStatus, jqXHR) {
                    if (callbacks.success && callbacks.success.length > 0) {
                        callbacks.success.each(function (callback) {
                            callback.call(context, json, textStatus, jqXHR);
                        });
                    }
                },
                error: function (data, textStatus, jqXHR) {
                    if (callbacks.error && callbacks.error.length > 0) {
                        callbacks.error.each(function (callback) {
                            callback.call(context, data, textStatus, jqXHR);
                        });
                    }
                }
            });
        }
    };

    me.load = function (args) {
        CCH.LOG.debug('Session.js::load');
        args = args || {};
        var sid = args.sid,
            callbacks = args.callbacks || {
                success : [],
                error : []
            },
            cookie;

        callbacks.success.unshift(function (json) {
            if (json) {
                CCH.LOG.info("Session.js::load: Session found on server. Updating current session.");
                $.extend(true, me.session, json);

                cookie = $.cookie('cch');
                cookie.bbox = me.session.bbox;
                cookie.items = me.session.items;
                $.cookie('cch', cookie);

                $(window).trigger('cch.data.session.loaded.true');
            } else {
                CCH.LOG.info("Session.js::load: Session not found on server.");
                $(window).trigger('cch.data.session.loaded.false');
            }
        });

        CCH.LOG.info("Session.js::load: Will try to load session '" + sid + "' from server");
        me.read({
            sid: sid,
            callbacks: {
                success: callbacks.success,
                error: callbacks.error
            }
        });
    };

    me.getItemById = function (id) {
        var item = null,
            index = me.getItemIndex({
                id : id
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
        CCH.LOG.debug('Session.js::addItem');

        var item = args.item,
            visible = args.visible || false,
            index = me.getItemIndex(item),
            cookie;

        if (index === -1) {
            me.session.items.push({
                itemId : item.id,
                visible : visible
            });
        }

        cookie = $.cookie('cch');
        cookie.items = me.session.items;
        $.cookie('cch', cookie);

        return me.session;
    };

    me.removeItem = function (item) {
        CCH.LOG.debug('Session.js::removeItem');

        var index = me.getItemIndex(item),
            cookie;

        if (index !== -1) {
            me.session.items.removeAt(index);
        }

        cookie = $.cookie('cch');
        cookie.items = me.session.items;
        $.cookie('cch', cookie);
        return me.session;
    };

    // Cookie handling
    $.cookie.json = true;
    if ($.cookie('cch') === undefined) {
        $.cookie('cch', {
            'items' : me.session.items
        },
            {
                path: '/'
            });
    }
    $.cookie('cch').items.each(function (item) {
        me.addItem({
            item : {
                id : item.itemId
            },
            visible : item.visible
        });
    });

    return $.extend(me, {
        toString: me.toString,
        getSession: me.getSession,
        load : me.load,
        readSession : me.read,
        writeSession: me.write,
        updateSession : me.update,
        getItemById : me.getItemById,
        getItemIndex : me.getItemIndex,
        addItem : me.addItem,
        removeItem : me.removeItem
    });
};