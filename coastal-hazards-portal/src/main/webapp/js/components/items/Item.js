/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global OpenLayers*/

CCH.Objects.Item = function (args) {
    "use strict";
    args = args || {};

    CCH.LOG.debug('Item.js::init():Item class is initializing.');

    if (!args.id) {
        throw 'Item can not initialize without an id being passed to it';
    }

    var me = this === window ? {} : this;

    me.UNITED_STATES_BBOX = [24.956, -124.731, 49.372, -66.97];
    me.id = args.id;
    me.loaded = false;

    me.load = function (args) {
        args = args || {};
        var callbacks = args.callbacks || {
            success : [],
            error : []
        },
        me = this,
        context = args.context || me;

        callbacks.success.unshift(function (data) {
            me.children = data.children || [];
            me.attr = data.attr;
            me.metadata = data.metadata;
            me.bbox = data.bbox || me.UNITED_STATES_BBOX;
            me.itemType = data.itemType;
            me.name = data.name;
            me.summary = data.summary;
            me.type = data.type;
            me.wfsService = data.wfsService;
            me.wmsService = data.wmsService;
            me.loaded = true;

            CCH.items.add({ item : me });

            // If I have children, load those as well
            me.children.each(function (childId) {
                new CCH.Objects.Item({ id : childId }).load();
            });

            CCH.LOG.debug('Item.js::init():Item ' + me.id + ' finished initializing.');
        });

        CCH.items.search({
            item : me.id,
            displayNotification : false,
            context : context,
            callbacks: {
                success: callbacks.success,
                error: callbacks.error
            }
        });
    };

    me.createWmsLayer = function () {
        var me = this,
            id = me.id,
            service = me.wmsService,
            endpoint = service.endpoint,
            layers = service.layers || [],
            bbox = me.bbox,
            layer = me.itemType === 'aggregation' ? null : new OpenLayers.Layer.WMS(
                id,
                endpoint,
                {
                    layers: layers,
                    format: 'image/png',
                    transparent: true,
                    sld: CCH.CONFIG.publicUrl + '/data/sld/' + id,
                    styles: 'cch'
                },
                {
                    projection: 'EPSG:3857',
                    isBaseLayer: false,
                    displayInLayerSwitcher: false,
                    isItemLayer: true, // CCH specific setting
                    bbox: bbox
                }
            );

        return layer;
    };

    me.showLayer = function () {
        var me = this;
        
        // Check to see if this is an aggregation. If it is, I need
        // to pull the layers from all of its children
        if (me.itemType === 'aggregation') {
            // This aggregation should have children, so for each 
            // child, I want to grab the child's layer and display it
            // on the map
            me.children.each(function (childItemId) {
                var childItem = CCH.items.getById({ id : childItemId });
                CCH.map.showLayer({
                    item : childItem
                });
            });
            // Because I don't have a real layer for this aggregation, once all 
            // of the children are added, I include this trigger so that other
            // components can act on this layer having been added
            $(window).trigger('cch.map.added.layer', {
                layer : {
                    name : me.id
                }
            });
        } else {
            // I am not an aggregation, so just show my layer
            CCH.map.showLayer({
                item : me
            });
        }
    };

    me.hideLayer = function () {
        if (me.itemType === 'aggregation') {
            // This aggregation should have children, so for each 
            // child, I want to grab the child's layer and display it
            // on the map
            me.children.each(function (childItemId) {
                CCH.map.removeLayersByName(childItemId);
            });
            // Because I don't have a real layer for this aggregation, once all 
            // of the children are removed, I include this trigger so that other
            // components can act on this layer having been removed
            $(window).trigger('cch.map.removed.layer', {
                layer : {
                    name : me.id
                }
            });
        } else {
            CCH.map.removeLayersByName(me.id);
        }
        
    };

    CCH.LOG.debug('Item.js::init():Item class finished initializing.');

    return $.extend(me, {
        id : me.id,
        bbox : me.bbox,
        children : me.children,
        itemType : me.itemType,
        name : me.name,
        summary : me.summary,
        type : me.type,
        wfsService : me.wfsService,
        wmsService : me.wmsService,
        getWmsLayer : me.createWmsLayer,
        load : me.load,
        showLayer : me.showLayer,
        hideLayer : me.hideLayer,
        CLASS_NAME : 'CCH.Objects.Item'
    });
};