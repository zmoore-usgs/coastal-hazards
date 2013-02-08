var Session = function(name, isPerm) {
    var me = (this === window) ? {} : this;
    
    me.isPerm = isPerm;
    me.name = name;
    me.sessionObject = isPerm ? localStorage : sessionStorage;
    me.session =  isPerm ? $.parseJSON(me.sessionObject.getItem(me.name)) : Object.extended();
    
    var defaultSession = Object.extended();
    defaultSession['default'] = {
        'default' : {
            view : {
                isSelected : false
            }
        }
    }
        
    defaultSession.shorelines = {
        view : {
            selectedLayers : []
        },
        'default' : {
            colorsParamPairs : [],
            groupingColumn : 'date_',
            describeFeatureTypeResponse : null,
            view : {
                'years-disabled' : [],
                'dates-disabled' : [],
                isSelected : false
            }
        }
    }
    defaultSession.baseline = defaultSession['default'];
    defaultSession.transects = defaultSession['default'];
    defaultSession.intersections = defaultSession['default'];
    defaultSession.calculation = defaultSession['default'];
    defaultSession.results = defaultSession['default'];
            
    
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
            
            var newSession = new Object();
        
            me.session = {
                sessions : {}
            }

            newSession[randID] = Object.extended(); 
            newSession.layers = [];
            newSession.shorelines = defaultSession.shorelines;
            newSession.baseline = defaultSession.baseline;            
            newSession.transects = defaultSession.transects;
            newSession.intersections = defaultSession.intersections;
            newSession.calculation = defaultSession.calculation;
            newSession.results = defaultSession.results;
            
            me.session['sessions'][randID] = newSession;
            me.session['current-session'] = Object.extended();
            me.session['current-session']['key'] = randID;
            me.session['current-session']['session'] = me.session['sessions'][randID];
        } else {
            if (me.session["current-session"].session) {
                if (!me.session["current-session"].session.shorelines) {
                    me.session["current-session"].session.shorelines = defaultSession.shorelines;
                }
                
                if (!me.session["current-session"].session.baseline) {
                    me.session["current-session"].session.baseline = defaultSession.baseline;
                }
                
                if (!me.session["current-session"].session.transects) {
                    me.session["current-session"].session.transects = defaultSession.transects;
                }
                
                if (!me.session["current-session"].session.intersections) {
                    me.session["current-session"].session.intersections = defaultSession.intersections;
                }
                
                if (!me.session["current-session"].session.calculation) {
                    me.session["current-session"].session.calculation = defaultSession.calculation;
                }
                
                if (!me.session["current-session"].session.results) {
                    me.session["current-session"].session.results = defaultSession.results;
                }
                
                if (!!me.session["current-session"].session.view) {
                    me.session["current-session"].session.view = {};
                    me.session["current-session"].session.view.popups = false;
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
        
        me.getStage = function(args) {
            if (!args) {
                args = Object.extended();
            }
            var stage = args.stage || 'default';
            
            if (!me.session[stage]) {
                me.session[stage] = defaultSession[stage];
            }
            
            return me.session[stage];
        }
        
        me.setStage = function(args) {
            if (!args) {
                return;
            }
            var stage = args.stage || 'default';
            me.session[stage] = args.obj
        }
        
        me.getStageConfig = function(args) {
            if (!args) {
                args = Object.extended();
            }
            var name = args.name || 'default';
            var stage = args.stage || 'default';
            var sessionStage = me.getStage(stage);
            
            if (!sessionStage[name]) {
                sessionStage[name] = sessionStage['default'];
                sessionStage[name].name = name;
            }
            
            return this.session[stage][name];
        }
        
        me.setStageConfig = function(args) {
            if (!args) {
                args = Object.extended();
            }
            var config = args.config || 'default';
            var stage = args.stage || 'default';
            me.session[stage][config.name] = config;
            me.persistCurrentSession();
            return me.session[stage][config.name];
        }
        
        me.updateLayersFromWMS = function(args) {
            LOG.info('Session.js::updateLayersFromWMS');
            
            var wmsCapabilities = args.wmsCapabilities;
            var data = args.data; 
            var jqXHR = args.jqXHR;
            
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
                    me.persistCurrentSession();
                }
            } else {
                LOG.debug('Session.js::updateLayersFromWMS: Could not find any layers for this session. Removing any existing layers in sesion object');
                CONFIG.ui.work_stages.each(function(stage) {
                    var sessionStage = CONFIG.tempSession.getStage({
                        stage : stage
                    })
                    delete sessionStage['default'];
                    Object.keys(sessionStage, function(key) {
                        if (key.has(me.getCurrentSessionKey())) {
                            if (delete sessionStage[key]) {
                                LOG.debug('Session.js::updateLayersFromWMS: Deleted ' + key + ' from session stage ' + stage);
                            }
                        }
                    })
                    me.setStage({
                        stage : stage,
                        obj : sessionStage
                    })
                })
                me.persistCurrentSession();
            }
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
        getCurrentSession : function() {
            return me.session['current-session'];
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
