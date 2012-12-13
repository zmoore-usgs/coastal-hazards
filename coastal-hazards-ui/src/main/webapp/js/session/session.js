var Session = function(name, isPerm) {
    var me = (this === window) ? {} : this;
    
    me.name = (!name) ? Util.randomUUID() : name;
    me.sessionObject = isPerm ? localStorage : sessionStorage;
    me.session =  $.parseJSON(me.sessionObject.getItem(me.name));
    
    // Initialize the session object
    if (!me.session && isPerm) {
        var randID = Util.randomUUID();
        var newSession = new Object();
        
        me.session = {
            sessions : {}
        }

        newSession[randID] = new Object(); 
        newSession.files = [];
        me.session['sessions'][randID] = newSession;
        me.session['current-session'] = new Object();
        me.session['current-session']['key'] = randID;
        me.session['current-session']['session'] = me.session['sessions'][randID];
        me.sessionObject.setItem(me.name, JSON.stringify(me.session));
    }

    return $.extend(me, {
        save : function() {
            me.sessionObject.setItem(me.name, JSON.stringify(me.session))
        },
        load : function(name) {
            $.parseJSON(me.sessionObject.getItem(name ? name : me.name));
        },
        addFileToSession : function(params) {
            me.session.sessions[me.getCurrentSessionKey()].files.push({ 
                token : params.token, 
                name : params.name
            });
            me.setCurrentSession(me.getCurrentSessionKey());
        },
        getCurrentSessionKey : function() {
            return me.session['current-session'].key;
        },
        setCurrentSession : function(key) {
            me.session['current-session']['key'] = key;
            me.session['current-session']['session'] = me.session['sessions'][key];
            return me.session['current-session'];
        },
        getCurrentSession : function() {
            return me.session['sessions'][me.getCurrentSessionKey()];
        }
    });
}
