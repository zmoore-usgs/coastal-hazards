var Session = function(name, isPerm) {
    var me = (this === window) ? {} : this;
    
    me.isPerm = isPerm;
    me.name = (!name) ? Util.randomUUID() : name;
    me.sessionObject = isPerm ? localStorage : sessionStorage;
    me.session =  isPerm ? $.parseJSON(me.sessionObject.getItem(me.name)) : new Object();
    
    // Initialize the session object
    if (isPerm) {
        if (!me.session) {
            // A session has not yet been created for perm storage. Probably the first
            // run of the application or a new browser with no imported session
            var randID = Util.randomUUID();
            var newSession = Object();
        
            me.session = {
                sessions : {}
            }

            newSession[randID] = Object.extended(); 
            newSession.files = [];
            me.session['sessions'][randID] = newSession;
            me.session['current-session'] = Obect.extended();
            me.session['current-session']['key'] = randID;
            me.session['current-session']['session'] = me.session['sessions'][randID];
        }
    } else {
        LOG.info('Creating new temp session object');
        me.session = new Object();
        
        LOG.info('Removing previous temp session');
        me.sessionObject.removeItem('coastal-hazards');
        
        LOG.info('Saving new temp session');
        me.sessionObject.setItem(me.name, JSON.stringify(me.session));
        
        /**
         * Persist the temp session to the appropriate location in the current session 
         */
        me.persistCurrentSession = function() {
            LOG.info('Persisting temp session to perm session');
            permSession.session.sessions[this.key] = this.session;
            permSession.save();
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
            LOG.info('Saving session object to storage');
            me.sessionObject.setItem(me.name, JSON.stringify(me.session));
        },
        load : function(name) {
            LOG.info('Loading session object from storage');
            $.parseJSON(me.sessionObject.getItem(name ? name : me.name));
        },
        addFileToSession : function(params) {
            me.session.files.push({ 
                token : params.token, 
                name : params.name
            });
            me.persistCurrentSession();
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
