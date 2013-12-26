/*jslint browser: true */
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
CCH.Objects.Session = function(args) {
    "use strict";
    
    CCH.LOG.info('Session.js::constructor: Session class is initializing.');
    
    var me = (this === window) ? {} : this;
    
    args = args || {};
    
    me.session = {
        items: [],
        bucket: [],
        searches: [],
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
    
    me.write = function (args) {
        args = args || {};
        
        var callbacks = args.callbacks || {
            success: [],
            error: []
        };
        
        callbacks.success.unshift(function(json) {
            CCH.LOG.debug("Session.js::write: " + json.sid);
        });
        
        CCH.map.updateSession();
        
        $.ajax(CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.session.endpoint, {
            type: 'POST',
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            data: me.toString(),
            success: function(json, textStatus, jqXHR) {
                if (callbacks.success && callbacks.success.length > 0) {
                    callbacks.success.each(function(callback) {
                        callback.call(null, json, textStatus, jqXHR);
                    });
                }
            },
            error: function(data, textStatus, jqXHR) {
                if (callbacks.error && callbacks.error.length > 0) {
                    callbacks.error.each(function(callback) {
                        callback.call(null, data, textStatus, jqXHR);
                    });
                }
            }
        });
    };

    return $.extend(me, {
        toString: me.toString,
        getSession: me.getSession,
        load: function(args) {
            args = args || {};
            var sid = args.sid,
                callbacks = args.callbacks || {
                    success : [],
                    error : []
                };

            callbacks.success.unshift(function(json, textStatus, jqXHR) {
                if (json) {
                    CCH.LOG.info("Session.js::load: Session found on server. Updating current session.");
                    $.extend(true, me.session, json);
                    $(window).trigger('cch.data.session.loaded.true');
                } else {
                    CCH.LOG.info("Session.js::load: Session not found on server.");
                    $(window).trigger('cch.data.session.loaded.false');
                }
            });

            CCH.LOG.info("Session.js::load: Will try to load session '" + sid + "' from server");
            me.readSession({
                sid: sid,
                callbacks: {
                    success: callbacks.success,
                    error: callbacks.error
                }
            });
        },
        readSession: function(args) {
            var sid = args.sid;
            var callbacks = args.callbacks || {
                success: [],
                error: []
            };

            var context = args.context;

            if (sid) {
                $.ajax(CCH.CONFIG.contextPath + CCH.CONFIG.data.sources.session.endpoint + sid, {
                    type: 'GET',
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'json',
                    success: function(json, textStatus, jqXHR) {
                        if (callbacks.success && callbacks.success.length > 0) {
                            callbacks.success.each(function(callback) {
                                callback.call(context, json, textStatus, jqXHR);
                            });
                        }
                    },
                    error: function(data, textStatus, jqXHR) {
                        if (callbacks.error && callbacks.error.length > 0) {
                            callbacks.error.each(function(callback) {
                                callback.call(context, data, textStatus, jqXHR);
                            });
                        }
                    }
                });
            }
        },
        writeSession: me.write,
        getEndpoint: function(args) {
            var callbacks = args.callbacks || [];
            var context = args.context;
            this.getIdentifier({
                context: context,
                callbacks: callbacks
            });
        }
    });
};