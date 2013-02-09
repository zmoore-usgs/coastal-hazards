var Session = function(name, isPerm) {
    var me = (this === window) ? {} : this;
    
    me.isPerm = isPerm;
    me.name = name;
    me.sessionObject = isPerm ? localStorage : sessionStorage;
    me.session =  isPerm ? $.parseJSON(me.sessionObject.getItem(me.name)) : Object.extended();
    
    if (isPerm) {
        if (!me.session) {
            // - A session has not yet been created for perm storage. Probably the first
            // run of the application or a new browser with no imported session
            
            // - Because the session is used in the namespace for WFS-T, it needs to 
            // not have a number at the head of it so add a random letter
            var randID = String.fromCharCode(97 + Math.round(Math.random() * 25)) + Util.randomUUID();
            
            // Prepare the session on the OWS server
            $.ajax('service/session?action=prepare&workspace=' + randID, 
            {
                success : function(data, textStatus, jqXHR) {
                    LOG.info('Session.js::init: A workspace has been prepared on the OWS server with the name of ' + randID)
                    CONFIG.ui.showAlert({
                        message : 'No session could be found. A new session has been created',
                        displayTime : 5000,
                        style: {
                            classes : ['alert-info']
                        }
                    })
                },
                error : function(data, textStatus, jqXHR) {
                    LOG.error('Session.js::init: A workspace could not be created on the OWS server with the name of ' + randID)
                    CONFIG.ui.showAlert({
                        message : 'No session could be found. A new session could not be created on server. This application may not function correctly.',
                        style: {
                            classes : ['alert-error']
                        }
                    })
                }
            })
            
            me.session = Object.extended();
            me.session.sessions = [];
            
            // This will constitute a new session object
            var session = Object.extended();
            session.id = randID;
            session.created = new Date().toString();
            session.stage = Object.extended({
                shorelines : Object.extended({
                    layers : [],
                    viewing : [],
                    groupingColumn : 'date_',
                    dateFormat : '',
                    view : Object.extended({
                        'years-disabled' : [],
                        'dates-disabled' : [],
                        isSelected : false
                    })
                }),
                baseline : Object.extended({
                    layers : [],
                    viewing : ''
                }),
                transects : Object.extended({
                    layers : [],
                    viewing : ''
                }),
                intersections : Object.extended({
                    layers : [],
                    viewing : ''
                }),
                results : Object.extended({
                    layers : [],
                    viewing : ''
                })
            });
            session.layers = [];
            
            me.session.sessions.push(session);
            me.session.currentSession = randID;
        }
    } else {
        LOG.info('Session.js::constructor:Removing previous temp session');
        me.sessionObject.removeItem('coastal-hazards');
        
        LOG.info('Session.js::constructor:Saving new temp session');
        me.session = CONFIG.permSession.session.sessions.find(function(session) {
            return session.id == CONFIG.permSession.session.currentSession
        });
        me.sessionObject.setItem(me.name, JSON.stringify(me.session));
        me.namespaces = Object.extended(); 
        
        /**
         * Persist the temp session to the appropriate location in the permanent session 
         */
        me.persistSession = function() {
            LOG.info('Session.js::persistSession: Persisting temp session to perm session');
            var permSession = CONFIG.permSession; 
            var sessionIndex = permSession.session.sessions.findIndex(function(session){
                return session.id == me.session.id
            });
                
            permSession.session.currentSession = me.session.id;
            if (sessionIndex == -1) {
                permSession.session.sessions.push(me.session);
            } else {
                permSession.session.sessions[sessionIndex] = me.session;
            }
            
            permSession.save();
            me.save();
        }
        
        me.getStage = function(stage) {
            return me.session.stage[stage];
        }
        
        me.setStage = function(args) {
            if (!args) {
                return null;
            }
            var stage = args.stage;
            me.session[stage] = args.obj
        }
        
        me.getConfig = function(args) {
            if (!args) {
                return null;
            }
            var name = args.name;
            var stage = args.stage;
            var config = me.getStage(stage);
            
            return config;
        }
        
        me.setConfig = function(args) {
            if (!args) {
                args = Object.extended();
            }
            var config = args.config || 'default';
            var stage = args.stage || 'default';
            me.session[stage][config.name] = config;
            me.persistSession();
            return me.session[stage][config.name];
        }
        
        me.updateLayersFromWMS = function(args) {
            LOG.info('Session.js::updateLayersFromWMS');
            
            var wmsCapabilities = args.wmsCapabilities;
            var data = args.data; 
            var jqXHR = args.jqXHR;
            
            if (jqXHR.status != 200) {
                LOG.warn('Session.js::updateLayersFromWMS: Client was unable to attain WMS capabilities')
            }
            
            if (wmsCapabilities && wmsCapabilities.capability.layers.length) {
                LOG.info('Session.js::updateLayersFromWMS: Updating session layer list from WMS Capabilities');
            
                var wmsLayers = wmsCapabilities.capability.layers;
                var namespace = wmsLayers[0].prefix;
                var sessionLayers = me.session.layers.filter(function(n) {
                    return n.prefix == namespace
                });
            
                if (namespace == me.getCurrentSessionKey()) {
                    LOG.debug('Session.js::updateLayersFromWMS: Scanning session for expired/missing layers in the ' + namespace + ' prefix');
                    sessionLayers.each(function(sessionLayer, index) {
                        if (sessionLayer.name.indexOf(me.getCurrentSessionKey() > -1)) {
                            var foundLayer = wmsLayers.find(function(wmsLayer) {
                                return wmsLayer.name === sessionLayer.name
                            })
                        
                            if (!foundLayer) {
                                LOG.debug('Session.js::updateLayersFromWMS: Removing layer ' + sessionLayer.name + ' from session object. This layer is not found on the OWS server');
                                me.session.layers[index] = null;
                            }
                        }
                    })
            
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
                    me.persistSession();
                }
            } else {
                LOG.debug('Session.js::updateLayersFromWMS: Could not find any layers for this session. Removing any existing layers in session object');
                
                me.persistSession();
            }
        }
        
        me.addLayerToSession = function(args) {
            LOG.debug('Session.js::addLayerToSession:Adding layer to session');
            var layer = args.layer;
            var sessionLayer = Object.extended({ 
                name : args.name || layer.name,
                title : args.title || layer.title,
                prefix : args.prefix || layer.prefix,
                bbox : args.bbox || layer.bbox,
                keywords : args.keywords || layer.keywords
            })
            
            var lIndex = me.session.layers.findIndex(function(l) {
                return l.name == sessionLayer.name
            })
            
            if (lIndex != -1) {
                me.session.layers[lIndex] = sessionLayer;
            } else {
                me.session.layers.push(sessionLayer);
            }
        }
        
        /**
         * Replace the current temp session with 
         */
        me.setCurrentSession = function(key, session) {
            LOG.info('Replacing current session');
            if (session) {
                me.session = session;
            } else {
                me.session = CONFIG.permSession.session.sessions.find(function(session) {
                    return session.id == CONFIG.permSession.session.currentSession
                })
            }
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
                return me.session.currentSession;
            } else {
                return me.session.id;
            }
        },
        getCurrentSession : function() {
            return me.session['current-session'];
        },
        clearSessions : function(type) {
            type = type || '';
            switch (type) {
                case 'perm' :
                    localStorage.removeItem('coastal-hazards');
                case  'temp' :
                    sessionStorage.removeItem('coastal-hazards');
                    break;
                default :
                    localStorage.removeItem('coastal-hazards');
                    sessionStorage.removeItem('coastal-hazards');
            }
            LOG.warn('UI.js::Cleared '+type+' session. Reloading application.');
            location.reload(true);
        },
        removeResource : function(args) {
            var store = args.store;
            var layer = args.layer;
            var callbacks = args.callbacks || [];
            var workspace = args.session || CONFIG.tempSession.getCurrentSessionKey();
            
            if (workspace.toLowerCase() == CONFIG.name.published) {
                throw 'Workspace cannot be read-only (Ex.: '+CONFIG.name.published+')';
            }
            
            $.get('service/session', {
                action : 'remove-layer',
                workspace : workspace,
                store : store,
                layer : layer
            },
            function(data, textStatus, jqXHR) {
                callbacks.each(function(callback) {
                    callback(data, textStatus, jqXHR);
                })
            }, 'json')
        }
    });
}
