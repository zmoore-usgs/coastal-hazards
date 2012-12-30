var Session = function(name, isPerm) {
    var me = (this === window) ? {} : this;
    
    me.isPerm = isPerm;
    me.name = (!name) ? Util.randomUUID() : name;
    me.sessionObject = isPerm ? localStorage : sessionStorage;
    me.session =  isPerm ? $.parseJSON(me.sessionObject.getItem(me.name)) : new Object();
    
    if (isPerm) {
        if (!me.session) {
            // - A session has not yet been created for perm storage. Probably the first
            // run of the application or a new browser with no imported session
            
            // - Because the session is used in the namespace for WFS-T, it needs to 
            // not have a number at the head of it so add a random letter
            var randID = String.fromCharCode(97 + Math.round(Math.random() * 25)) + Util.randomUUID();
            var newSession = new Object();
        
            me.session = {
                sessions : {}
            }

            newSession[randID] = Object.extended(); 
            newSession.layers = [];
            newSession.shorelines = {
                'default' : {
                    colorsParamPairs : [],
                    groupingColumn : 'date_'
                }
            }
            
            me.session['sessions'][randID] = newSession;
            me.session['current-session'] = Object.extended();
            me.session['current-session']['key'] = randID;
            me.session['current-session']['session'] = me.session['sessions'][randID];
        } else {
            // Make sure that session object has everything we need
            if (!me.session.layers) {
                me.session.layers = [];
            }
            if (!me.session.shorelines) {
                me.session.shorelines = {
                    'default' : {
                        colorsParamPairs : [],
                        groupingColumn : 'date_'
                    }
                }
            }
        }
    } else {
        LOG.info('Session.js::constructor:Creating new temp session object');
        me.session = Object.extended();
        
        LOG.info('Session.js::constructor:Removing previous temp session');
        me.sessionObject.removeItem('coastal-hazards');
        
        LOG.info('Session.js::constructor:Saving new temp session');
        me.sessionObject.setItem(me.name, JSON.stringify(me.session));
        
        /**
         * Persist the temp session to the appropriate location in the permanent session 
         */
        me.persistCurrentSession = function() {
            LOG.info('Session.js::persistCurrentSession: Persisting temp session to perm session');
            CONFIG.permSession.session.sessions[this.key] = this.session;
            CONFIG.permSession.save();
            me.save();
        }
        
        me.getShorelineConfig = function(args) {
            var name = args.name;
            if (!me.session.shorelines[name]) {
                me.session.shorelines[name] = {
                    view : {
                        'years-disabled' : [],
                        isSelected : false
                    }
                }
            }
            me.persistCurrentSession();
            return me.session.shorelines[name];
        }
        
        me.setShorelineConfig = function(args) {
            var name = args.name;
            var config = args.config;
            CONFIG.permSession.getCurrentSession().session.shorelines[name] = config;
            me.persistCurrentSession();
            return me.session.shorelines[name];
        }
        
        me.updateLayersFromWMS = function(caps) {
            LOG.info('Session.js::updateLayersFromWMS: Updating session layer list from WMS Capabilities');
            
            var wmsLayers = caps.capability.layers;
            var sessionLayers = me.session.layers;
            
            LOG.debug('Session.js::updateLayersFromWMS: Scanning session for expired/missing layers.');
            for (var sessionLayerIndex = 0;sessionLayerIndex < sessionLayers.length;sessionLayerIndex++) {
                var sessionLayer = sessionLayers[sessionLayerIndex];
                if (sessionLayer.name.indexOf(me.getCurrentSessionKey() > -1)) {
                    var foundLayer = wmsLayers.find(function(wmsLayer) {
                        return wmsLayer.name === sessionLayer.name
                    })
                        
                    if (!foundLayer) {
                        LOG.debug('Session.js::updateLayersFromWMS: Removing layer ' + sessionLayer.name + ' from session object. This layer is not found on the OWS server');
                        me.session.layers[sessionLayerIndex] = null;
                    }
                }
            }
            // Removes all undefined or null from the layers array
            me.session.layers = me.session.layers.compact();
            
            LOG.debug('Session.js::updateLayersFromWMS: Scanning layers on server for layers in this session');
            var ioLayers = wmsLayers.findAll(function(wmsLayer) {
                return (wmsLayer.prefix == 'ch-input' || wmsLayer.prefix == 'ch-output') &&
                wmsLayer.name.indexOf(me.getCurrentSessionKey() != -1);
            })
            
            $(ioLayers).each(function(index, layer) {
                LOG.debug('Session.js::updateLayersFromWMS: Remote layer found. Adding it to current session');
                var incomingLayer = {
                    name : layer.name,
                    title : layer.title,
                    prefix : layer.prefix,
                    bbox : layer.bbox
                }
                    
                var foundLayerAtIndex = me.session.layers.findIndex(function(l) {
                    return l.name === layer.name
                })
                    
                if (foundLayerAtIndex != -1) {
                    LOG.debug('Session.js::updateLayersFromWMS: Layer ' + 
                        'provided by WMS GetCapabilities response already in session layers. ' +
                        'Updating session layers with latest info.');
                    me.session.layers[foundLayerAtIndex] = incomingLayer;
                } else {
                    LOG.debug('Session.js::updateLayersFromWMS: Layer ' + 
                        'provided by WMS GetCapabilities response not in session layers. ' +
                        'Adding layer to session layers.');
                    me.addLayerToSession(incomingLayer)
                }
            })
            me.persistCurrentSession();
        }
        
        me.addLayerToSession = function(params) {
            LOG.debug('Session.js::addLayerToSession:Adding layer to session');
            var layer = params.layer;
            
            me.session.layers.push({ 
                name : params.name || layer.name,
                title : params.title || layer.title,
                prefix : params.prefix || layer.prefix,
                bbox : params.bbox || layer.bbox
            });
        }
        
        /**
         * Replace the current temp session with 
         */
        me.setCurrentSession = function(key, pSession) {
            LOG.info('Replacing current session');
            me.session = Object.clone(pSession.session.sessions[key], true);
            me.key = key;
            me.save();
        }
        
    }

    return $.extend(me, {
        save : function() {
            LOG.info('Session.js::save:Saving session object to storage');
            me.sessionObject.setItem(me.name, JSON.stringify(me.session));
        },
        
        load : function(name) {
            LOG.info('Session.js::load:Loading session object from storage');
            $.parseJSON(me.sessionObject.getItem(name ? name : me.name));
        },
        
        getCurrentSessionKey : function() {
            if (me.isPerm) {
                return me.session['current-session'].key;
            } else {
                return me.key;
            }
        },
        //        setCurrentSession : function(obj) {
        //            if (Object.isString(obj)) {
        //                me.session['current-session']['key'] = obj;
        //                me.session['current-session']['session'] = Object.clone(me.session['sessions'][obj], true);
        //            } else {
        //                me.session = Object.clone(obj, true);
        //            }
        //            me.save();
        //        },
        getCurrentSession : function() {
            return me.session['current-session'];
        }
    });
}
