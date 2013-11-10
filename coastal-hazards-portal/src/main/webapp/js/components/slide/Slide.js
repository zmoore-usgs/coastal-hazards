/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global splashUpdate*/
CCH.Objects.Slide = function (args) {
    args = args || {};

    if (!args.containerId) {
        throw 'id is required when initializing a slide';
    }
    var me = (this === window) ? {} : this;
    
    // Listeners 
    // window: 'cch.ui.resized'
    
    me.SLIDE_CONTAINER_ID = args.containerId;
    me.SLIDE_TAB_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-tab').attr('id');
    me.SLIDE_CONTENT_ID = $('#' + me.SLIDE_CONTAINER_ID + ' .application-slide-content').attr('id');
    
    // right = open rtl
    // left = open ltr
    me.placement = args.placement || 'right';
    // If there's a tab found, the default is to display it
    me.displayTab = args.displayTab || $('#' + me.SLIDE_TAB_ID).length > 0;
    me.startClosed = args.startClosed || false;
    
    me.open = function () {
        
    };
    
    // These functions should be implemented in the function that builds these
    // objects
    me.resized = args.resized || function() {
        throw 'resized not implemented';
    };
    me.getExtents = args.getExtents || function () {
        throw 'getExtent not implemented';
    };
    me.init = args.init || function () {
        throw 'getExtent not implemented';
    };
    
    $(window).on('cch.ui.resized', function(args) {
        me.resized.call(me, args);
    });
    
    return me;
};