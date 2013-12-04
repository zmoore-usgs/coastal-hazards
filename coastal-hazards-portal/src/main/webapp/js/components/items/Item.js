/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/

CCH.Objects.Item = function (item) {
    "use strict";

    CCH.LOG.info('Item.js::init():Item class is initializing.');

    if (!item) {
        throw 'Item can not initialize without an item being passed to it';
    }

    var me = this === window ? {} : this,
        UNITED_STATES_BBOX = [24.956,-124.731,49.372,-66.97];
    
    $.extend(true, me, item);
    
    me.bbox = me.bbox || UNITED_STATES_BBOX;
    me.children = me.children || [];
    
    
    CCH.LOG.info('Item.js::init():Item class finished initializing.');
    
    return {
       id : me.id,
       bbox : me.bbox,
       children : me.children,
       itemType : me.itemType,
       name : me.name,
       summary : me.summary,
       type : me.type,
       wfsService : me.wfsService,
       wmsService : me.wmsService,
       CLASS_NAME : 'CCH.Objects.Item'
    };
};